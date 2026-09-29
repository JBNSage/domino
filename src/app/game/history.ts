import { Players, Row, TeamId, cleanName, isTarget, parsePlayers, parseRows } from './state';
import {
  Result,
  Rule,
  Standing,
  parseResults,
  parseRule,
  parseTeams,
  standings,
} from './tournament';

/** Finished matches kept on the device; the oldest go first. */
export const MAX_MATCHES = 500;

export type RecordedTeam = {
  name: string;
  players: Players | null;
};

export type MatchRecord = {
  id: string;
  endedAt: number;
  target: number;
  teams: Record<TeamId, RecordedTeam>;
  rows: Row[];
  winner: TeamId;
  /** The tournament it was played in, if any. */
  tournament: string | null;
  tieBreak: boolean;
};

export type TournamentRecord = {
  id: string;
  startedAt: number;
  endedAt: number;
  rule: Rule;
  ranking: Standing[];
  /** A team of the ranking, or null when it ended level. */
  champion: string | null;
  /** The side the champion last won on: the colour it is shown in. */
  championSeat: TeamId | null;
  results: Result[];
};

export type History = {
  matches: MatchRecord[];
  tournaments: TournamentRecord[];
};

export const emptyHistory: History = { matches: [], tournaments: [] };

const newestFirst = (one: { endedAt: number }, other: { endedAt: number }) =>
  other.endedAt - one.endedAt;

export function isEmpty(history: History): boolean {
  return history.matches.length === 0 && history.tournaments.length === 0;
}

export function addMatch(history: History, match: MatchRecord): History {
  const matches = [match, ...history.matches.filter((other) => other.id !== match.id)]
    .sort(newestFirst)
    .slice(0, MAX_MATCHES);
  return { ...history, matches };
}

export function addTournament(history: History, tournament: TournamentRecord): History {
  const tournaments = [
    tournament,
    ...history.tournaments.filter((other) => other.id !== tournament.id),
  ].sort(newestFirst);
  return { ...history, tournaments };
}

/** Puts back what was removed. */
export function merge(history: History, removed: History): History {
  const withMatches = removed.matches.reduce(addMatch, history);
  return removed.tournaments.reduce(addTournament, withMatches);
}

/**
 * What leaves the history. A tournament in `tournaments` leaves with the
 * matches played in it; one in `records` leaves alone, as when saving it is
 * taken back and the tournament goes on.
 */
export type Removal = { matches?: string[]; tournaments?: string[]; records?: string[] };

/** Splits the history into what stays and what goes. */
export function remove(history: History, goes: Removal): { kept: History; removed: History } {
  const matches = goes.matches ?? [];
  const whole = goes.tournaments ?? [];
  const records = [...whole, ...(goes.records ?? [])];
  const leaves = (match: MatchRecord) =>
    matches.includes(match.id) || (match.tournament !== null && whole.includes(match.tournament));
  return {
    kept: {
      matches: history.matches.filter((match) => !leaves(match)),
      tournaments: history.tournaments.filter((entry) => !records.includes(entry.id)),
    },
    removed: {
      matches: history.matches.filter(leaves),
      tournaments: history.tournaments.filter((entry) => records.includes(entry.id)),
    },
  };
}

export function matchesOf(history: History, tournament: string): MatchRecord[] {
  return history.matches
    .filter((match) => match.tournament === tournament)
    .sort((one, other) => one.endedAt - other.endedAt);
}

function parseTeam(value: unknown, id: TeamId): RecordedTeam | null {
  if (typeof value !== 'object' || value === null) return null;
  const raw = value as Record<string, unknown>;
  if (typeof raw.name !== 'string') return null;
  return { name: cleanName(raw.name, id), players: parsePlayers(raw.players) };
}

function parseMatch(value: unknown): MatchRecord | null {
  if (typeof value !== 'object' || value === null) return null;
  const raw = value as Record<string, unknown>;
  if (typeof raw.id !== 'string' || typeof raw.endedAt !== 'number') return null;
  if (!isTarget(raw.target)) return null;
  if (raw.winner !== 'a' && raw.winner !== 'b') return null;

  const teams = raw.teams as Record<string, unknown> | null;
  if (typeof teams !== 'object' || teams === null) return null;
  const a = parseTeam(teams.a, 'a');
  const b = parseTeam(teams.b, 'b');
  const rows = parseRows(raw.rows);
  if (a === null || b === null || rows === null) return null;

  return {
    id: raw.id,
    endedAt: raw.endedAt,
    target: raw.target,
    teams: { a, b },
    rows,
    winner: raw.winner,
    tournament: typeof raw.tournament === 'string' ? raw.tournament : null,
    tieBreak: raw.tieBreak === true,
  };
}

function parseTournamentRecord(value: unknown): TournamentRecord | null {
  if (typeof value !== 'object' || value === null) return null;
  const raw = value as Record<string, unknown>;
  if (typeof raw.id !== 'string') return null;
  if (typeof raw.startedAt !== 'number' || typeof raw.endedAt !== 'number') return null;

  // The ranking is worked out again from the results, so it cannot disagree with them.
  const teams = parseTeams(raw.ranking);
  const rule = parseRule(raw.rule);
  if (teams === null || rule === null) return null;
  const ids = teams.map((team) => team.id);
  const results = parseResults(raw.results, ids);
  if (results === null) return null;

  const champion = typeof raw.champion === 'string' && ids.includes(raw.champion);
  return {
    id: raw.id,
    startedAt: raw.startedAt,
    endedAt: raw.endedAt,
    rule,
    ranking: standings({ teams, results }),
    champion: champion ? (raw.champion as string) : null,
    championSeat: raw.championSeat === 'a' || raw.championSeat === 'b' ? raw.championSeat : null,
    results,
  };
}

/** Keeps every entry that can be read; one bad entry does not cost the rest. */
export function parseHistory(value: unknown): History {
  if (typeof value !== 'object' || value === null) return emptyHistory;
  const raw = value as Record<string, unknown>;
  const read = <T>(list: unknown, parse: (item: unknown) => T | null): T[] =>
    Array.isArray(list) ? list.map(parse).filter((item): item is T => item !== null) : [];
  return {
    matches: read(raw.matches, parseMatch).sort(newestFirst).slice(0, MAX_MATCHES),
    tournaments: read(raw.tournaments, parseTournamentRecord).sort(newestFirst),
  };
}
