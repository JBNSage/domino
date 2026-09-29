import { History, MatchRecord } from './history';
import { Players, TEAM_IDS, fold, sameName } from './state';

/** Which mesa the statistics look at. */
export type TableChoice =
  | { kind: 'all' }
  | { kind: 'none' }
  /** `id` is null for a mesa known only by the name its matches recorded. */
  | { kind: 'table'; id: string | null; name: string };

export type StatsFilter = {
  /** Start of the first day counted, or null for no limit. */
  from: number | null;
  /** End of the last day counted, or null for no limit. */
  to: number | null;
  table: TableChoice;
};

export const noFilter: StatsFilter = { from: null, to: null, table: { kind: 'all' } };

export type Tally = { played: number; won: number; lost: number; rate: number };

export type PlayerStat = Tally & { key: string; name: string };

export type CoupleStat = Tally & { key: string; players: Players };

export type DatePreset = 'all' | 'today' | 'week' | 'month';

function startOfDay(time: number): number {
  const day = new Date(time);
  day.setHours(0, 0, 0, 0);
  return day.getTime();
}

function endOfDay(time: number): number {
  const day = new Date(time);
  day.setHours(23, 59, 59, 999);
  return day.getTime();
}

/** The days a preset covers, today included. */
export function rangeOf(
  preset: DatePreset,
  now: number,
): { from: number | null; to: number | null } {
  if (preset === 'all') return { from: null, to: null };
  const days = preset === 'today' ? 1 : preset === 'week' ? 7 : 30;
  // Stepping back by calendar date, not by 24 hours, keeps days whole across a clock change.
  const first = new Date(now);
  first.setDate(first.getDate() - (days - 1));
  return { from: startOfDay(first.getTime()), to: endOfDay(now) };
}

/** A date field's value ("2026-09-29") as the start or the end of that local day. */
export function parseDay(value: string, end = false): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (match === null) return null;
  const [year, month, day] = match.slice(1).map(Number);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  return end ? endOfDay(date.getTime()) : date.getTime();
}

/** A time as a date field's value. */
export function dayOf(time: number): string {
  const date = new Date(time);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Whether the range is one of the presets, as it would be worked out today. */
export function presetOf(filter: Pick<StatsFilter, 'from' | 'to'>, now: number): DatePreset | null {
  const presets: DatePreset[] = ['all', 'today', 'week', 'month'];
  return (
    presets.find((preset) => {
      const range = rangeOf(preset, now);
      return range.from === filter.from && range.to === filter.to;
    }) ?? null
  );
}

export function sameTable(one: TableChoice, other: TableChoice): boolean {
  if (one.kind !== 'table' || other.kind !== 'table') return one.kind === other.kind;
  return one.id !== null || other.id !== null
    ? one.id === other.id
    : sameName(one.name, other.name);
}

/**
 * The mesas the history has matches from, newest name first, and whether any
 * match was played at none. A mesa is known by its id; older matches only
 * recorded a name, and join the mesa that has it.
 */
export function tablesIn(history: History): { tables: TableChoice[]; none: boolean } {
  const tables: Extract<TableChoice, { kind: 'table' }>[] = [];
  let none = false;
  // Matches come newest first, so the first name met is the current one.
  for (const match of history.matches) {
    if (match.table === null) {
      none = true;
      continue;
    }
    const known = tables.find((table) =>
      match.tableId !== null && table.id !== null
        ? table.id === match.tableId
        : sameName(table.name, match.table as string),
    );
    if (known === undefined) tables.push({ kind: 'table', id: match.tableId, name: match.table });
    else if (known.id === null && match.tableId !== null) known.id = match.tableId;
  }
  tables.sort((one, other) => one.name.localeCompare(other.name, 'es', { sensitivity: 'base' }));
  return { tables, none };
}

function atTable(match: MatchRecord, table: TableChoice): boolean {
  if (table.kind === 'all') return true;
  if (table.kind === 'none') return match.table === null;
  if (match.table === null) return false;
  if (table.id !== null && match.tableId !== null) return table.id === match.tableId;
  return sameName(table.name, match.table);
}

/** The matches the filter lets through, newest first. */
export function matchesFor(history: History, filter: StatsFilter): MatchRecord[] {
  return history.matches.filter(
    (match) =>
      (filter.from === null || match.endedAt >= filter.from) &&
      (filter.to === null || match.endedAt <= filter.to) &&
      atTable(match, filter.table),
  );
}

/** Whether any match has a team with named players. */
export function hasPlayers(matches: MatchRecord[]): boolean {
  return matches.some((match) => TEAM_IDS.some((side) => match.teams[side].players !== null));
}

type Count = { played: number; won: number };

function tally(count: Count): Tally {
  return {
    played: count.played,
    won: count.won,
    lost: count.played - count.won,
    rate: count.played === 0 ? 0 : count.won / count.played,
  };
}

/** Best rate first; then more matches played, then by name. */
function byRate<T extends Tally>(label: (item: T) => string) {
  return (one: T, other: T) =>
    other.rate - one.rate ||
    other.played - one.played ||
    label(one).localeCompare(label(other), 'es', { sensitivity: 'base' });
}

/** Each team with players in each match: its side, its pair, and whether it won. */
function* teamsIn(matches: MatchRecord[]) {
  for (const match of matches) {
    for (const side of TEAM_IDS) {
      const players = match.teams[side].players;
      if (players !== null) yield { players, won: match.winner === side };
    }
  }
}

export function playerKey(name: string): string {
  return fold(name);
}

function coupleKey(players: Players): string {
  return players.map(playerKey).sort().join('|');
}

/** Every player's matches, ordered by win rate. */
export function playerStats(matches: MatchRecord[]): PlayerStat[] {
  const players = new Map<string, Count & { name: string }>();
  for (const team of teamsIn(matches)) {
    for (const name of team.players) {
      const key = playerKey(name);
      // The first spelling met is the newest one.
      const count = players.get(key) ?? { name, played: 0, won: 0 };
      count.played += 1;
      if (team.won) count.won += 1;
      players.set(key, count);
    }
  }
  return [...players.entries()]
    .map(([key, count]) => ({ key, name: count.name, ...tally(count) }))
    .sort(byRate((stat) => stat.name));
}

/** Every couple's matches, whichever of the two is written first. */
export function coupleStats(matches: MatchRecord[]): CoupleStat[] {
  const couples = new Map<string, Count & { players: Players }>();
  for (const team of teamsIn(matches)) {
    const key = coupleKey(team.players);
    const count = couples.get(key) ?? { players: team.players, played: 0, won: 0 };
    count.played += 1;
    if (team.won) count.won += 1;
    couples.set(key, count);
  }
  return [...couples.entries()]
    .map(([key, count]) => ({ key, players: count.players, ...tally(count) }))
    .sort(byRate((stat) => stat.players.join(' ')));
}

/** One player's matches with each partner. */
export function partnersOf(matches: MatchRecord[], key: string): PlayerStat[] {
  const partners = new Map<string, Count & { name: string }>();
  for (const team of teamsIn(matches)) {
    const index = team.players.findIndex((name) => playerKey(name) === key);
    if (index === -1) continue;
    const name = team.players[1 - index];
    const partner = playerKey(name);
    const count = partners.get(partner) ?? { name, played: 0, won: 0 };
    count.played += 1;
    if (team.won) count.won += 1;
    partners.set(partner, count);
  }
  return [...partners.entries()]
    .map(([partner, count]) => ({ key: partner, name: count.name, ...tally(count) }))
    .sort(byRate((stat) => stat.name));
}

/** Places in an ordered list; the same rate over the same matches shares a place. */
export function places(list: Tally[]): number[] {
  return list.map((stat, index) => {
    let first = index;
    while (
      first > 0 &&
      list[first - 1].rate === stat.rate &&
      list[first - 1].played === stat.played
    ) {
      first -= 1;
    }
    return first + 1;
  });
}
