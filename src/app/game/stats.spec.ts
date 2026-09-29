import { History, MatchRecord } from './history';
import { Players, TeamId } from './state';
import {
  coupleStats,
  dayOf,
  matchesFor,
  noFilter,
  parseDay,
  partnersOf,
  places,
  playerStats,
  presetOf,
  rangeOf,
  tablesIn,
} from './stats';

let count = 0;

function match(
  a: Players | null,
  b: Players | null,
  winner: TeamId,
  extra: Partial<MatchRecord> = {},
): MatchRecord {
  count += 1;
  return {
    id: `m${count}`,
    endedAt: new Date(2026, 8, 29, 20, 0).getTime() - count,
    target: 200,
    teams: { a: { name: 'Uno', players: a }, b: { name: 'Dos', players: b } },
    rows: [],
    winner,
    tournament: null,
    tieBreak: false,
    table: null,
    tableId: null,
    ...extra,
  };
}

const history = (matches: MatchRecord[]): History => ({ matches, tournaments: [] });

describe('player statistics', () => {
  it('count a win for both players of the winning team and a loss for the others', () => {
    const stats = playerStats([match(['Ana', 'Luis'], ['Rosa', 'Marta'], 'a')]);
    const byName = Object.fromEntries(stats.map((stat) => [stat.name, [stat.won, stat.lost]]));
    expect(byName).toEqual({ Ana: [1, 0], Luis: [1, 0], Rosa: [0, 1], Marta: [0, 1] });
  });

  it('leave out a team without players, and still count the other', () => {
    const stats = playerStats([match(['Ana', 'Luis'], null, 'b')]);
    expect(stats.map((stat) => [stat.name, stat.lost])).toEqual([
      ['Ana', 1],
      ['Luis', 1],
    ]);
  });

  it('join the same name written with other accents or capitals, keeping the newest spelling', () => {
    const stats = playerStats([
      match(['Ángel', 'Luis'], null, 'a'),
      match(['angel', 'Luis'], null, 'b'),
    ]);
    const angel = stats.find((stat) => stat.key === 'angel');
    expect(angel).toMatchObject({ name: 'Ángel', played: 2, won: 1, rate: 0.5 });
  });

  it('come best rate first, then most matches, then by name', () => {
    const stats = playerStats([
      match(['Ana', 'Luis'], ['Rosa', 'Marta'], 'a'),
      match(['Ana', 'Pedro'], ['Rosa', 'Marta'], 'a'),
      match(['Luis', 'Pedro'], ['Rosa', 'Marta'], 'b'),
    ]);
    expect(stats.map((stat) => stat.name)).toEqual(['Ana', 'Luis', 'Pedro', 'Marta', 'Rosa']);
    expect(places(stats)).toEqual([1, 2, 2, 4, 4]);
  });

  it('count tournament matches and tie-breaks too', () => {
    const stats = playerStats([
      match(['Ana', 'Luis'], null, 'a', { tournament: 't1', tieBreak: true }),
    ]);
    expect(stats[0].played).toBe(1);
  });
});

describe('couple statistics', () => {
  it('treat a couple the same in either order', () => {
    const stats = coupleStats([
      match(['Ana', 'Luis'], null, 'a'),
      match(['luis', 'ANA'], null, 'b'),
    ]);
    expect(stats).toHaveLength(1);
    expect(stats[0]).toMatchObject({ players: ['Ana', 'Luis'], played: 2, won: 1 });
  });

  it('list the partners of one player', () => {
    const matches = [
      match(['Ana', 'Luis'], ['Rosa', 'Marta'], 'a'),
      match(['Rosa', 'Ana'], ['Luis', 'Marta'], 'a'),
      match(['Ana', 'Luis'], ['Rosa', 'Marta'], 'b'),
    ];
    expect(partnersOf(matches, 'ana').map((stat) => [stat.name, stat.won, stat.played])).toEqual([
      ['Rosa', 1, 1],
      ['Luis', 1, 2],
    ]);
  });

  it('are empty for an empty history', () => {
    expect(coupleStats([])).toEqual([]);
    expect(playerStats([])).toEqual([]);
  });
});

describe('dates', () => {
  const now = new Date(2026, 8, 29, 15, 30).getTime();

  it('cover whole local days, today included', () => {
    expect(rangeOf('all', now)).toEqual({ from: null, to: null });
    const today = rangeOf('today', now);
    expect(today.from).toBe(new Date(2026, 8, 29).getTime());
    expect(today.to).toBe(new Date(2026, 8, 29, 23, 59, 59, 999).getTime());
    expect(rangeOf('week', now).from).toBe(new Date(2026, 8, 23).getTime());
    expect(rangeOf('month', now).from).toBe(new Date(2026, 7, 31).getTime());
  });

  it('read a date field from the start or to the end of its day', () => {
    expect(parseDay('2026-09-01')).toBe(new Date(2026, 8, 1).getTime());
    expect(parseDay('2026-09-01', true)).toBe(new Date(2026, 8, 1, 23, 59, 59, 999).getTime());
    expect(parseDay('2026-02-30')).toBeNull();
    expect(parseDay('')).toBeNull();
    expect(dayOf(new Date(2026, 0, 5, 22).getTime())).toBe('2026-01-05');
  });

  it('recognise a preset from its range', () => {
    expect(presetOf(rangeOf('week', now), now)).toBe('week');
    expect(presetOf({ from: parseDay('2026-01-01'), to: null }, now)).toBeNull();
  });

  it('keep the matches of both end days', () => {
    const first = match(['Ana', 'Luis'], null, 'a', {
      endedAt: new Date(2026, 8, 1, 0, 5).getTime(),
    });
    const last = match(['Ana', 'Luis'], null, 'a', {
      endedAt: new Date(2026, 8, 2, 23, 55).getTime(),
    });
    const outside = match(['Ana', 'Luis'], null, 'a', {
      endedAt: new Date(2026, 8, 3, 0, 1).getTime(),
    });
    const filter = { ...noFilter, from: parseDay('2026-09-01'), to: parseDay('2026-09-02', true) };
    expect(matchesFor(history([outside, last, first]), filter)).toEqual([last, first]);
  });
});

describe('mesas', () => {
  const renamed = match(['Ana', 'Luis'], null, 'a', { table: 'Casa de Ana', tableId: 'm1' });
  const before = match(['Ana', 'Luis'], null, 'a', { table: 'Casa', tableId: 'm1' });
  const old = match(['Ana', 'Luis'], null, 'a', { table: 'Club', tableId: null });
  const none = match(['Ana', 'Luis'], null, 'a');
  const all = history([renamed, before, old, none]);

  it('are listed by id with their newest name, older matches by name', () => {
    expect(tablesIn(all)).toEqual({
      none: true,
      tables: [
        { kind: 'table', id: 'm1', name: 'Casa de Ana' },
        { kind: 'table', id: null, name: 'Club' },
      ],
    });
  });

  it('filter by id, by name for old matches, or to matches at none', () => {
    const at = (table: Parameters<typeof matchesFor>[1]['table']) =>
      matchesFor(all, { ...noFilter, table });
    expect(at({ kind: 'table', id: 'm1', name: 'Casa de Ana' })).toEqual([renamed, before]);
    expect(at({ kind: 'table', id: null, name: 'club' })).toEqual([old]);
    expect(at({ kind: 'none' })).toEqual([none]);
    expect(at({ kind: 'all' })).toHaveLength(4);
  });
});
