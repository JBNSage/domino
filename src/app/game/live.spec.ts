import { TestBed } from '@angular/core/testing';

import { MESA_CLOUD, SharedMesa } from './cloud';
import { FakeMesaCloud, applyLive } from './cloud.fake';
import { GameStore } from './game.store';
import { HistoryStore } from './history.store';
import { MeStore } from './me.store';
import { SharingStore } from './sharing.store';
import { addTable, setActive } from './tables';
import { TablesStore } from './tables.store';

describe('The live match at a shared mesa', () => {
  let cloud: FakeMesaCloud;
  let store: GameStore;
  let tables: TablesStore;
  let sharing: SharingStore;

  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      providers: [{ provide: MESA_CLOUD, useClass: FakeMesaCloud }],
    });
    cloud = TestBed.inject(MESA_CLOUD) as FakeMesaCloud;
    store = TestBed.inject(GameStore);
    tables = TestBed.inject(TablesStore);
    sharing = TestBed.inject(SharingStore);
    TestBed.inject(MeStore).rename('Juan');
  });

  afterEach(() => vi.useRealTimers());

  /** A mesa of this phone, shared and in use. */
  const shareMine = async () => {
    tables.change((current) => setActive(addTable(current, 'm1', 'Casa'), 'm1'));
    store.startQuickMatch();
    const id = (await sharing.share('m1')) ?? '';
    TestBed.tick();
    return id;
  };

  /** Eva, on her phone, adds a hand to the live match. */
  const evaScores = (mesaId: string, id: string, points: number, at: number) =>
    cloud.fromOtherPhone(mesaId, (mesa) =>
      applyLive(mesa, { fields: {}, rows: { [id]: { team: 'b', points, at, by: 'eva' } } }),
    );

  it('sends every hand to the mesa, and takes in the hands of other phones', async () => {
    const mesaId = await shareMine();
    store.addPoints('a', 25);
    expect(Object.values(cloud.mesas().get(mesaId)?.live?.rows ?? {})).toMatchObject([
      { team: 'a', points: 25 },
    ]);

    evaScores(mesaId, 'eva-1', 30, Date.now() + 10);
    TestBed.tick();
    expect(store.totals()).toEqual({ a: 25, b: 30 });
    // It lands as a hand of this phone would.
    expect(store.moment()).toMatchObject({ kind: 'hand', team: 'b', points: 30 });
  });

  it('keeps a hand from another phone when this phone undoes its own', async () => {
    const mesaId = await shareMine();
    store.addQuick('a');
    evaScores(mesaId, 'eva-1', 30, Date.now() + 10);
    TestBed.tick();

    store.restore();
    TestBed.tick();
    expect(store.totals()).toEqual({ a: 0, b: 30 });
  });

  it('writes one match when two phones close the same one', async () => {
    const mesaId = await shareMine();
    store.addPoints('a', 200);
    const matchId = cloud.mesas().get(mesaId)?.live?.matchId;
    store.closeRound();
    expect(
      cloud
        .mesas()
        .get(mesaId)
        ?.matches.map((match) => match.id),
    ).toEqual([matchId]);
    expect(TestBed.inject(HistoryStore).history().matches[0].id).toBe(matchId);
    // A new match, with a new id.
    expect(cloud.mesas().get(mesaId)?.live?.matchId).not.toBe(matchId);
  });

  it('only shows the board to someone who watches, until an owner lets them score', async () => {
    const mesa: SharedMesa = {
      id: 'm9',
      doc: { name: 'Club', players: [], teams: [], createdBy: 'ana', createdAt: 0 },
      members: [{ uid: 'ana', name: 'Ana', owner: true, scores: true, joinedAt: 0 }],
      matches: [],
      live: {
        matchId: 'x1',
        teams: {
          a: { name: 'Los Primos', players: null, roundsWon: 0, saved: null, playerIds: null },
          b: { name: 'Equipo B', players: null, roundsWon: 0, saved: null, playerIds: null },
        },
        target: 200,
        quickValue: 30,
        between: null,
        rows: { r1: { team: 'a', points: 40, at: 1, by: 'ana' } },
      },
      liveLoaded: true,
      invite: null,
    };
    cloud.invites.set('m9', { mesa, token: 'k' });
    await sharing.join({ id: 'm9', token: 'k', name: 'Club' });
    TestBed.tick();

    expect(store.state().teams.a.name).toBe('Los Primos');
    expect(store.totals().a).toBe(40);
    expect(store.canScore()).toBe(false);
    expect(store.atHome()).toBe(false);
    expect(store.addPoints('a', 10)).toBeNull();
    expect(cloud.mesas().get('m9')?.live?.rows).toEqual(mesa.live?.rows);

    cloud.fromOtherPhone('m9', (current) => ({
      ...current,
      members: current.members.map((member) =>
        member.uid === 'me' ? { ...member, scores: true } : member,
      ),
    }));
    expect(store.canScore()).toBe(true);
    store.addPoints('a', 10);
    expect(store.totals().a).toBe(50);
    expect(Object.keys(cloud.mesas().get('m9')?.live?.rows ?? {})).toHaveLength(2);
  });

  it('leaves the board on this phone while a tournament is played', async () => {
    await shareMine();
    cloud.writes.length = 0;
    store.startTournament(
      ['Uno', 'Dos'].map((name, index) => ({ id: `t${index}`, name, players: null })),
      { kind: 'free' },
    );
    store.addPoints('a', 10);
    expect(cloud.writes.filter((write) => write.startsWith('board'))).toEqual([]);
  });

  it('waits for the live match to be read before scoring, and never writes over it', async () => {
    const mesaId = await shareMine();
    // As when the app opens and the mesa arrives before its live match.
    cloud.fromOtherPhone(mesaId, (mesa) => ({ ...mesa, live: null, liveLoaded: false }));
    cloud.writes.length = 0;
    TestBed.tick();

    expect(store.liveLoading()).toBe(true);
    expect(store.addPoints('a', 10)).toBeNull();
    expect(cloud.writes).toEqual([]);
  });

  it('closes a match again as the same match after undoing it', async () => {
    const mesaId = await shareMine();
    store.addPoints('a', 200);
    const matchId = cloud.mesas().get(mesaId)?.live?.matchId;
    store.closeRound();
    store.restore();
    expect(cloud.mesas().get(mesaId)?.live?.matchId).toBe(matchId);
    store.closeRound();
    expect(
      cloud
        .mesas()
        .get(mesaId)
        ?.matches.map((match) => match.id),
    ).toEqual([matchId]);
  });
});
