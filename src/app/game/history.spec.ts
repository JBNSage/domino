import {
  History,
  MAX_MATCHES,
  MatchRecord,
  TournamentRecord,
  addMatch,
  addTournament,
  emptyHistory,
  matchesOf,
  merge,
  parseHistory,
  remove,
} from './history';

const match = (id: string, endedAt: number, tournament: string | null = null): MatchRecord => ({
  id,
  endedAt,
  target: 200,
  teams: {
    a: { name: 'Los Primos', players: ['Ana', 'Luis'] },
    b: { name: 'Las Tías', players: null },
  },
  rows: [
    { id: `${id}-1`, team: 'b', points: 40 },
    { id: `${id}-2`, team: 'a', points: 200 },
  ],
  winner: 'a',
  tournament,
  tieBreak: false,
  table: null,
  tableId: null,
});

const tournament = (id: string, endedAt: number): TournamentRecord => ({
  id,
  startedAt: endedAt - 100,
  endedAt,
  rule: { kind: 'firstTo', count: 1 },
  ranking: [
    { id: 't1', name: 'Uno', players: null, won: 1, lost: 0, points: 200 },
    { id: 't2', name: 'Dos', players: null, won: 0, lost: 1, points: 40 },
  ],
  champion: 't1',
  championSeat: 'a',
  results: [
    {
      match: 'm1',
      seats: { a: 't1', b: 't2' },
      winner: 'a',
      points: { a: 200, b: 40 },
      tieBreak: false,
    },
  ],
});

function filled(): History {
  const matches = [match('m3', 30), match('m2', 20, 'x'), match('m1', 10, 'x')];
  return { matches, tournaments: [tournament('x', 25)] };
}

describe('history', () => {
  it('keeps the newest match first', () => {
    const history = [match('old', 1), match('new', 3), match('mid', 2)].reduce(
      addMatch,
      emptyHistory,
    );
    expect(history.matches.map((entry) => entry.id)).toEqual(['new', 'mid', 'old']);
  });

  it('does not keep the same match twice', () => {
    const history = addMatch(addMatch(emptyHistory, match('m1', 1)), match('m1', 1));
    expect(history.matches).toHaveLength(1);
  });

  it('drops the oldest matches past the limit', () => {
    let history = emptyHistory;
    for (let time = 0; time <= MAX_MATCHES; time += 1) {
      history = addMatch(history, match(`m${time}`, time));
    }
    expect(history.matches).toHaveLength(MAX_MATCHES);
    expect(history.matches.at(-1)?.id).toBe('m1');
  });

  it('lists the matches of a tournament in the order they were played', () => {
    expect(matchesOf(filled(), 'x').map((entry) => entry.id)).toEqual(['m1', 'm2']);
  });

  it('removes one match and puts it back in its place', () => {
    const history = filled();
    const { kept, removed } = remove(history, { matches: ['m3'] });
    expect(kept.matches.map((entry) => entry.id)).toEqual(['m2', 'm1']);
    expect(removed.matches.map((entry) => entry.id)).toEqual(['m3']);
    expect(merge(kept, removed)).toEqual(history);
  });

  it('removes a tournament with the matches played in it', () => {
    const history = filled();
    const { kept, removed } = remove(history, { tournaments: ['x'] });
    expect(kept).toEqual({ matches: [match('m3', 30)], tournaments: [] });
    expect(removed.matches).toHaveLength(2);
    expect(merge(kept, removed)).toEqual(history);
  });

  it('can remove the record of a tournament and leave its matches', () => {
    const { kept, removed } = remove(filled(), { records: ['x'] });
    expect(kept.tournaments).toEqual([]);
    expect(kept.matches).toHaveLength(3);
    expect(removed.matches).toEqual([]);
  });

  it('keeps tournaments newest first', () => {
    const history = addTournament(
      addTournament(emptyHistory, tournament('x', 5)),
      tournament('y', 9),
    );
    expect(history.tournaments.map((entry) => entry.id)).toEqual(['y', 'x']);
  });
});

describe('parseHistory', () => {
  it('round-trips what was saved', () => {
    const history = filled();
    expect(parseHistory(JSON.parse(JSON.stringify(history)))).toEqual(history);
  });

  it('keeps what it can read and drops the rest', () => {
    const saved = {
      matches: [match('m1', 1), { ...match('m2', 2), winner: 'c' }, 'nonsense'],
      tournaments: [{ ...tournament('x', 3), rule: null }],
    };
    expect(parseHistory(JSON.parse(JSON.stringify(saved)))).toEqual({
      matches: [match('m1', 1)],
      tournaments: [],
    });
  });

  it('starts empty from anything that is not a history', () => {
    expect(parseHistory(null)).toEqual(emptyHistory);
    expect(parseHistory('x')).toEqual(emptyHistory);
  });

  it('works the ranking out again from the results', () => {
    const saved = tournament('x', 3);
    saved.ranking = [saved.ranking[1], saved.ranking[0]].map((team) => ({ ...team, won: 9 }));
    const [parsed] = parseHistory({ matches: [], tournaments: [saved] }).tournaments;
    expect(parsed.ranking.map(({ id, won }) => [id, won])).toEqual([
      ['t1', 1],
      ['t2', 0],
    ]);
  });
});
