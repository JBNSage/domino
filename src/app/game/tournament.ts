import { Players, TeamId, cleanLabel, otherTeam, parsePlayers, winsFor } from './state';

export const MIN_TEAMS = 2;
export const MAX_TEAMS = 12;
export const MAX_COUNT = 99;

/** How a tournament ends: on a number of wins, or when the table says so. */
export type Rule = { kind: 'firstTo' | 'bestOf'; count: number } | { kind: 'free' };

export type TournamentTeam = {
  id: string;
  name: string;
  players: Players | null;
};

export type Result = {
  /** The match as kept in the history. */
  match: string;
  seats: Record<TeamId, string>;
  winner: TeamId;
  points: Record<TeamId, number>;
  tieBreak: boolean;
};

/**
 * `between`: a match is over and the next pair is being chosen.
 * `done`: the tournament is decided and waits to be saved.
 */
export type Phase = 'playing' | 'between' | 'done';

export type Tournament = {
  id: string;
  startedAt: number;
  teams: TournamentTeam[];
  rule: Rule;
  results: Result[];
  /** Who sits on each side: playing now, or proposed for the next match. */
  seats: Record<TeamId, string>;
  /** Everyone else, longest wait first. */
  waiting: string[];
  phase: Phase;
  /** The only teams that may play while a tie for first is broken. */
  tieBreak: string[] | null;
};

export type Standing = TournamentTeam & {
  won: number;
  lost: number;
  points: number;
};

/** Wins that end the tournament, or null when only the table can end it. */
export function winsNeeded(rule: Rule): number | null {
  if (rule.kind === 'free') return null;
  return rule.kind === 'firstTo' ? rule.count : Math.floor(rule.count / 2) + 1;
}

export function isCount(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= MAX_COUNT;
}

export function teamOf(tournament: Tournament, id: string): TournamentTeam {
  return tournament.teams.find((team) => team.id === id) ?? tournament.teams[0];
}

/** Most wins first, a lisa counting as two; then fewest defeats, most points, and the order of entry. */
export function standings(tournament: Pick<Tournament, 'teams' | 'results'>): Standing[] {
  const table = new Map<string, Standing>(
    tournament.teams.map((team) => [team.id, { ...team, won: 0, lost: 0, points: 0 }]),
  );
  for (const result of tournament.results) {
    const winner = table.get(result.seats[result.winner]);
    const loser = table.get(result.seats[otherTeam(result.winner)]);
    if (winner) {
      winner.won += winsFor(result.points, result.winner);
      winner.points += result.points[result.winner];
    }
    if (loser) {
      loser.lost += 1;
      loser.points += result.points[otherTeam(result.winner)];
    }
  }
  // The sort is stable, so teams level on everything keep their order of entry.
  return [...table.values()].sort(
    (one, other) => other.won - one.won || one.lost - other.lost || other.points - one.points,
  );
}

/** The teams sharing the most wins. */
export function leaders(tournament: Pick<Tournament, 'teams' | 'results'>): Standing[] {
  const table = standings(tournament);
  return table.filter((team) => team.won === table[0].won);
}

export function winsOf(tournament: Tournament, id: string): number {
  return tournament.results
    .filter((result) => result.seats[result.winner] === id)
    .reduce((won, result) => won + winsFor(result.points, result.winner), 0);
}

/** The side a team last won on, which is the colour it is remembered in. */
export function lastWinningSeat(
  tournament: Pick<Tournament, 'results'>,
  id: string,
): TeamId | null {
  for (let index = tournament.results.length - 1; index >= 0; index -= 1) {
    const result = tournament.results[index];
    if (result.seats[result.winner] === id) return result.winner;
  }
  return null;
}

export function create(
  id: string,
  startedAt: number,
  teams: TournamentTeam[],
  rule: Rule,
): Tournament {
  const [first, second, ...rest] = teams.map((team) => team.id);
  return {
    id,
    startedAt,
    teams,
    rule,
    results: [],
    seats: { a: first, b: second },
    waiting: rest,
    // Two teams have nothing to choose; more than two pick who opens.
    phase: rest.length === 0 ? 'playing' : 'between',
    tieBreak: null,
  };
}

function isDecided(tournament: Tournament): boolean {
  const first = leaders(tournament);
  if (tournament.tieBreak !== null) return first.length === 1;
  const needed = winsNeeded(tournament.rule);
  return needed !== null && first[0].won >= needed;
}

/** Who may take a seat: the teams waiting, or only the tied ones in a tie-break. */
export function available(tournament: Tournament): string[] {
  const allowed = tournament.tieBreak;
  return allowed === null
    ? tournament.waiting
    : tournament.waiting.filter((id) => allowed.includes(id));
}

/** Counts a finished match, then proposes the next one: the winner stays. */
export function recordResult(
  tournament: Tournament,
  match: string,
  winner: TeamId,
  points: Record<TeamId, number>,
): Tournament {
  const result: Result = {
    match,
    seats: tournament.seats,
    winner,
    points,
    tieBreak: tournament.tieBreak !== null,
  };
  const played = { ...tournament, results: [...tournament.results, result] };
  if (isDecided(played)) return { ...played, phase: 'done' };

  const next = available(played)[0];
  if (next === undefined) return { ...played, phase: 'playing' };

  const loser = otherTeam(winner);
  return {
    ...played,
    seats: { ...played.seats, [loser]: next },
    waiting: [...played.waiting.filter((id) => id !== next), played.seats[loser]],
    phase: 'between',
  };
}

/** Puts a waiting team on one side; the team it replaces is next in line. */
export function setSeat(tournament: Tournament, seat: TeamId, id: string): Tournament {
  if (tournament.phase !== 'between' || !available(tournament).includes(id)) return tournament;
  return {
    ...tournament,
    seats: { ...tournament.seats, [seat]: id },
    waiting: [tournament.seats[seat], ...tournament.waiting.filter((other) => other !== id)],
  };
}

export function startMatch(tournament: Tournament): Tournament {
  return tournament.phase === 'between' ? { ...tournament, phase: 'playing' } : tournament;
}

export function renameTeam(
  tournament: Tournament,
  id: string,
  name: string,
  players: Players | null,
): Tournament {
  return {
    ...tournament,
    teams: tournament.teams.map((team) => (team.id === id ? { ...team, name, players } : team)),
  };
}

/** Ends by hand. With a tie for first there is no champion unless it is broken. */
export function end(tournament: Tournament): Tournament {
  return { ...tournament, phase: 'done' };
}

/** Only the tied teams go on, until one of them leads. */
export function startTieBreak(tournament: Tournament): Tournament {
  const tied = leaders(tournament).map((team) => team.id);
  if (tied.length < 2) return tournament;
  const [first, second, ...rest] = tied;
  const others = tournament.teams.map((team) => team.id).filter((id) => !tied.includes(id));
  return {
    ...tournament,
    tieBreak: tied,
    seats: { a: first, b: second },
    waiting: [...rest, ...others],
    // Two tied teams have nothing to choose.
    phase: rest.length === 0 ? 'playing' : 'between',
  };
}

/** The winner, or null when the tournament ended level. */
export function champion(tournament: Pick<Tournament, 'teams' | 'results'>): Standing | null {
  const first = leaders(tournament);
  return first.length === 1 && first[0].won > 0 ? first[0] : null;
}

export function parseRule(value: unknown): Rule | null {
  if (typeof value !== 'object' || value === null) return null;
  const raw = value as Record<string, unknown>;
  if (raw.kind === 'free') return { kind: 'free' };
  if (raw.kind !== 'firstTo' && raw.kind !== 'bestOf') return null;
  return isCount(raw.count) ? { kind: raw.kind, count: raw.count } : null;
}

export function parseTeams(value: unknown): TournamentTeam[] | null {
  if (!Array.isArray(value) || value.length < MIN_TEAMS || value.length > MAX_TEAMS) return null;
  const teams: TournamentTeam[] = [];
  for (const item of value) {
    if (typeof item !== 'object' || item === null) return null;
    const raw = item as Record<string, unknown>;
    if (typeof raw.id !== 'string' || typeof raw.name !== 'string') return null;
    if (teams.some((team) => team.id === raw.id)) return null;
    const name = cleanLabel(raw.name, '');
    if (name.length === 0) return null;
    teams.push({ id: raw.id, name, players: parsePlayers(raw.players) });
  }
  return teams;
}

function isSeat(value: unknown): value is TeamId {
  return value === 'a' || value === 'b';
}

function isAmount(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

function parseSeats(value: unknown, ids: string[]): Record<TeamId, string> | null {
  if (typeof value !== 'object' || value === null) return null;
  const { a, b } = value as Record<string, unknown>;
  if (typeof a !== 'string' || typeof b !== 'string' || a === b) return null;
  return ids.includes(a) && ids.includes(b) ? { a, b } : null;
}

export function parseResults(value: unknown, ids: string[]): Result[] | null {
  if (!Array.isArray(value)) return null;
  const results: Result[] = [];
  for (const item of value) {
    if (typeof item !== 'object' || item === null) return null;
    const raw = item as Record<string, unknown>;
    const seats = parseSeats(raw.seats, ids);
    const points = raw.points as Record<string, unknown> | null;
    if (seats === null || typeof raw.match !== 'string' || !isSeat(raw.winner)) return null;
    if (typeof points !== 'object' || points === null) return null;
    if (!isAmount(points.a) || !isAmount(points.b)) return null;
    results.push({
      match: raw.match,
      seats,
      winner: raw.winner,
      points: { a: points.a, b: points.b },
      tieBreak: raw.tieBreak === true,
    });
  }
  return results;
}

/** Validates a saved tournament; anything malformed yields null. */
export function parseTournament(value: unknown): Tournament | null {
  if (typeof value !== 'object' || value === null) return null;
  const raw = value as Record<string, unknown>;
  if (typeof raw.id !== 'string' || typeof raw.startedAt !== 'number') return null;

  const teams = parseTeams(raw.teams);
  const rule = parseRule(raw.rule);
  if (teams === null || rule === null) return null;

  const ids = teams.map((team) => team.id);
  const seats = parseSeats(raw.seats, ids);
  const results = parseResults(raw.results, ids);
  if (seats === null || results === null) return null;
  if (raw.phase !== 'playing' && raw.phase !== 'between' && raw.phase !== 'done') return null;

  const isIds = (list: unknown): list is string[] =>
    Array.isArray(list) && list.every((id) => typeof id === 'string' && ids.includes(id));
  if (!isIds(raw.waiting)) return null;
  // Everyone is either seated or waiting, once.
  const placed = [seats.a, seats.b, ...raw.waiting];
  if (placed.length !== ids.length || new Set(placed).size !== ids.length) return null;
  if (raw.tieBreak !== null && raw.tieBreak !== undefined && !isIds(raw.tieBreak)) return null;

  return {
    id: raw.id,
    startedAt: raw.startedAt,
    teams,
    rule,
    results,
    seats,
    waiting: raw.waiting,
    phase: raw.phase,
    tieBreak: raw.tieBreak ?? null,
  };
}
