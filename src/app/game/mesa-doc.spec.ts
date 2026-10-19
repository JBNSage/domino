import { MatchDoc, Member, SharedMesa } from './cloud';
import {
  fromLiveDoc,
  fromMatchDoc,
  fromShared,
  idsFor,
  liveWrites,
  mesaPlayers,
  renameInMatchDoc,
  resolvePlayers,
  toLiveDoc,
  toMatchDoc,
  toMesaDoc,
} from './mesa-doc';
import { MatchRecord } from './history';
import { State, initialState } from './state';

const ana: Member = { uid: 'u1', name: 'Ana', owner: true, scores: true, joinedAt: 0 };
const luis: Member = { uid: 'u2', name: 'Luis', owner: false, scores: false, joinedAt: 1 };

const context = (atOf: (id: string) => number | undefined = () => undefined) => ({
  members: [ana, luis],
  by: 'u1',
  now: 1000,
  atOf,
  newMatchId: () => 'next',
});

const withRows = (rows: State['rows']): State => ({ ...initialState, rows });

describe('players by member', () => {
  it('remembers which member each player is, and reads their current name', () => {
    const ids = idsFor(['ana', 'Pedro'], [ana, luis]);
    expect(ids).toEqual(['u1', null]);
    const renamed = { ...ana, name: 'Anita' };
    expect(resolvePlayers(['ana', 'Pedro'], ids, [renamed, luis])).toEqual(['Anita', 'Pedro']);
    // A member who left keeps the name the pair was written with.
    expect(resolvePlayers(['ana', 'Pedro'], ids, [luis])).toEqual(['ana', 'Pedro']);
  });

  it('offers members and the players written by hand, once each, in order', () => {
    expect(mesaPlayers(['Pedro', 'ANA'], [ana, luis])).toEqual(['Ana', 'Luis', 'Pedro']);
  });
});

describe('a shared mesa', () => {
  const shared: SharedMesa = {
    id: 'm1',
    doc: {
      name: 'Casa',
      players: ['Pedro'],
      teams: [{ id: 's1', name: 'Los Primos', players: ['Ana', 'Pedro'], playerIds: ['u1', null] }],
      createdBy: 'u1',
      createdAt: 0,
    },
    members: [{ ...ana, name: 'Anita' }, luis],
    matches: [],
    live: null,
    liveLoaded: true,
    invite: 'k',
  };

  it("is a mesa whose members are players, seen with this phone's rights", () => {
    const asLuis = fromShared(shared, 'u2');
    expect(asLuis?.players).toEqual(['Anita', 'Luis', 'Pedro']);
    expect(asLuis?.teams[0].players).toEqual(['Anita', 'Pedro']);
    expect(asLuis?.shared).toMatchObject({ owner: false, scores: false, me: 'u2' });
    expect(fromShared(shared, 'u1')?.shared).toMatchObject({ owner: true, scores: true });
    expect(fromShared({ ...shared, doc: null }, 'u1')).toBeNull();
  });

  it('keeps only the players written by hand when written back', () => {
    const table = fromShared(shared, 'u1')!;
    expect(toMesaDoc(table, shared.members).players).toEqual(['Pedro']);
    expect(toMesaDoc(table, shared.members).teams[0].playerIds).toEqual(['u1', null]);
  });
});

describe('a finished match', () => {
  it('goes to the cloud without its mesa and comes back with it, names resolved', () => {
    const match: MatchRecord = {
      id: 'x1',
      endedAt: 5,
      target: 200,
      teams: { a: { name: 'A', players: ['Ana', 'Luis'] }, b: { name: 'B', players: null } },
      rows: [{ id: 'r1', team: 'a', points: 200 }],
      winner: 'a',
      tournament: null,
      tieBreak: false,
      table: 'Casa',
      tableId: 'm1',
    };
    const doc = toMatchDoc(match, [ana, luis]);
    expect('table' in doc).toBe(false);
    expect(doc.teams.a.playerIds).toEqual(['u1', 'u2']);
    const back = fromMatchDoc(doc, { id: 'm1', name: 'Casa' }, [{ ...luis, name: 'Lucho' }]);
    expect(back).toEqual({
      ...match,
      teams: { ...match.teams, a: { name: 'A', players: ['Ana', 'Lucho'] } },
    });
  });

  it('renames a player written by hand, linking the new name when it is a member', () => {
    const doc: MatchDoc = {
      id: 'x1',
      endedAt: 5,
      target: 200,
      teams: {
        a: { name: 'A', players: ['Pedro', 'Rosa'], playerIds: null },
        b: { name: 'B', players: ['Luis', 'Pepe'], playerIds: ['u2', null] },
      },
      rows: [],
      winner: 'a',
      tournament: null,
      tieBreak: false,
    };
    const pedro: Member = { uid: 'u3', name: 'Pedro Bello', owner: false, scores: false, joinedAt: 2 };

    const merged = renameInMatchDoc(doc, 'pedro', 'Pedro Bello', [ana, luis, pedro]);
    expect(merged?.teams.a).toEqual({ name: 'A', players: ['Pedro Bello', 'Rosa'], playerIds: ['u3', null] });
    expect(merged?.teams.b).toBe(doc.teams.b);

    const renamed = renameInMatchDoc(doc, 'Rosa', 'Rosi', [ana, luis]);
    expect(renamed?.teams.a).toEqual({ name: 'A', players: ['Pedro', 'Rosi'], playerIds: null });

    // A slot with a member id is that member's, whatever its name says.
    expect(renameInMatchDoc(doc, 'Luis', 'Lucho', [ana, luis])).toBeNull();
    expect(renameInMatchDoc(doc, 'Nadie', 'Alguien', [ana, luis])).toBeNull();
  });
});

describe('the live match', () => {
  it('orders hands by when they were played, whoever played them', () => {
    const live = toLiveDoc(initialState, 'm', [ana], 'u1', 0);
    live.rows = {
      late: { team: 'b', points: 10, at: 30, by: 'u2' },
      early: { team: 'a', points: 20, at: 10, by: 'u1' },
    };
    const { state, matchId } = fromLiveDoc(live, [ana]);
    expect(matchId).toBe('m');
    expect(state.rows.map((row) => row.id)).toEqual(['early', 'late']);
  });

  it("writes only the hand that changed, so another phone's hand stays", () => {
    const before = withRows([{ id: 'r1', team: 'a', points: 20 }]);
    const after = withRows([
      { id: 'r1', team: 'a', points: 20 },
      { id: 'r2', team: 'b', points: 15 },
    ]);
    expect(liveWrites(before, after, context())).toEqual({
      fields: {},
      rows: { r2: { team: 'b', points: 15, at: 1000, by: 'u1' } },
    });
    expect(liveWrites(after, before, context()).rows).toEqual({ r2: null });
  });

  it('puts a hand that comes back in its old place, and starts a new match once cleared', () => {
    const before = withRows([]);
    const after = withRows([{ id: 'r1', team: 'a', points: 20 }]);
    expect(
      liveWrites(
        before,
        after,
        context(() => 7),
      ).rows['r1']?.at,
    ).toBe(7);
    expect(liveWrites(after, before, context()).fields.matchId).toBe('next');
  });

  it('writes the teams and settings that changed', () => {
    const after: State = {
      ...initialState,
      target: 150,
      teams: { ...initialState.teams, a: { ...initialState.teams.a, players: ['Ana', 'Luis'] } },
    };
    const writes = liveWrites(initialState, after, context());
    expect(writes.fields.target).toBe(150);
    expect(writes.fields.teams?.a.playerIds).toEqual(['u1', 'u2']);
    expect(writes.fields.quickValue).toBeUndefined();
  });
});
