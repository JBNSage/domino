export type TeamId = 'a' | 'b';

export type Row = {
  id: string;
  team: TeamId;
  points: number;
};

/** A team plays with two people or with none named. */
export type Players = [string, string];

export type Team = {
  name: string;
  players: Players | null;
  roundsWon: number;
  /** The team saved at a mesa that sits here, whose wins follow it. */
  saved: string | null;
};

/**
 * `start`: a mesa was chosen and the first two teams are being picked.
 * `next`: a match at a mesa is over and the next two are being picked.
 */
export type Between = 'start' | 'next';

export type State = {
  teams: Record<TeamId, Team>;
  target: number;
  quickValue: number;
  rows: Row[];
  between: Between | null;
};

export type Action =
  | { type: 'addPoints'; team: TeamId; points: number; id: string }
  | { type: 'deleteRow'; id: string }
  | { type: 'restoreRow'; row: Row; index: number }
  | { type: 'editRow'; id: string; points: number }
  | { type: 'renameTeam'; team: TeamId; name: string }
  | {
      type: 'setTeam';
      team: TeamId;
      name: string;
      players: Players | null;
      saved?: string | null;
      /** The wins the changed team brings, as when other players make it another team. */
      roundsWon?: number;
    }
  | {
      type: 'seatTeam';
      team: TeamId;
      name: string;
      players: Players | null;
      saved: string | null;
      roundsWon: number;
    }
  | { type: 'seat'; teams: Record<TeamId, Team> }
  | { type: 'setTarget'; target: number }
  | { type: 'setQuickValue'; value: number }
  | { type: 'closeRound'; winner: TeamId; pause?: boolean }
  | { type: 'waitForTeams' }
  | { type: 'resume' }
  | { type: 'clearRows' }
  | { type: 'resetAll' }
  | { type: 'hydrate'; state: State };

export const TEAM_IDS: TeamId[] = ['a', 'b'];

export const DEFAULT_NAMES: Record<TeamId, string> = {
  a: 'Equipo A',
  b: 'Equipo B',
};

export const DEFAULT_TARGET = 200;
export const DEFAULT_QUICK_VALUE = 30;
export const MAX_POINTS = 999;
export const MAX_TARGET = 9999;
export const MAX_NAME_LENGTH = 16;
export const MAX_PLAYER_LENGTH = 16;
/** How long every offer to undo stays on screen. */
export const UNDO_SECONDS = 3;

export const initialState: State = {
  teams: {
    a: { name: DEFAULT_NAMES.a, players: null, roundsWon: 0, saved: null },
    b: { name: DEFAULT_NAMES.b, players: null, roundsWon: 0, saved: null },
  },
  target: DEFAULT_TARGET,
  quickValue: DEFAULT_QUICK_VALUE,
  rows: [],
  between: null,
};

export function otherTeam(team: TeamId): TeamId {
  return team === 'a' ? 'b' : 'a';
}

/** Parses user input into a whole number within [1, max], or null when invalid. */
export function parseAmount(input: string, max: number): number | null {
  const trimmed = input.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const value = Number(trimmed);
  if (value < 1 || value > max) return null;
  return value;
}

function isValidAmount(value: number, max: number): boolean {
  return Number.isInteger(value) && value >= 1 && value <= max;
}

/** Cuts to a number of visible characters, so an emoji or accented letter is never split. */
function truncate(text: string, length: number): string {
  const characters =
    typeof Intl.Segmenter === 'function'
      ? Array.from(new Intl.Segmenter().segment(text), (part) => part.segment)
      : Array.from(text);
  return characters.slice(0, length).join('');
}

function tidy(text: string, length: number): string {
  return truncate(text.trim().replace(/\s+/g, ' '), length).trim();
}

/** A team name, or `fallback` when nothing was written. */
export function cleanLabel(name: string, fallback: string): string {
  const trimmed = tidy(name, MAX_NAME_LENGTH);
  return trimmed.length > 0 ? trimmed : fallback;
}

export function cleanName(name: string, team: TeamId): string {
  return cleanLabel(name, DEFAULT_NAMES[team]);
}

/** Both players, none, or 'incomplete' when only one was written. */
export function cleanPlayers(first: string, second: string): Players | null | 'incomplete' {
  const players: Players = [tidy(first, MAX_PLAYER_LENGTH), tidy(second, MAX_PLAYER_LENGTH)];
  const written = players.filter((player) => player.length > 0).length;
  if (written === 0) return null;
  return written === 2 ? players : 'incomplete';
}

/** One player's name, tidied; empty when nothing was written. */
export function cleanPlayer(name: string): string {
  return tidy(name, MAX_PLAYER_LENGTH);
}

/** Lower case and without accents, so "Ángel" and "angel" are the same name. */
export function fold(text: string): string {
  return text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim().replace(/\s+/g, ' ');
}

export function sameName(one: string, other: string): boolean {
  return fold(one) === fold(other);
}

/** A player the two teams have in common, or null. */
export function sharedPlayer(one: Players | null, other: Players | null): string | null {
  if (one === null || other === null) return null;
  return one.find((player) => other.some((each) => sameName(each, player))) ?? null;
}

export function parsePlayers(value: unknown): Players | null {
  if (!Array.isArray(value) || value.length !== 2) return null;
  const [first, second] = value as unknown[];
  if (typeof first !== 'string' || typeof second !== 'string') return null;
  const players = cleanPlayers(first, second);
  return players === 'incomplete' ? null : players;
}

export function samePlayers(one: Players | null, other: Players | null): boolean {
  if (one === null || other === null) return one === other;
  return one[0] === other[0] && one[1] === other[1];
}

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'addPoints': {
      if (!isValidAmount(action.points, MAX_POINTS)) return state;
      // Nobody scores while the next two teams are being chosen.
      if (state.between !== null) return state;
      // A finished match takes no more points until the round is closed.
      if (selectWinner(state) !== null) return state;
      const row: Row = { id: action.id, team: action.team, points: action.points };
      return { ...state, rows: [...state.rows, row] };
    }
    case 'deleteRow': {
      const rows = state.rows.filter((row) => row.id !== action.id);
      return rows.length === state.rows.length ? state : { ...state, rows };
    }
    case 'restoreRow': {
      if (state.rows.some((row) => row.id === action.row.id)) return state;
      const index = Math.max(0, Math.min(action.index, state.rows.length));
      const rows = [...state.rows];
      rows.splice(index, 0, action.row);
      return { ...state, rows };
    }
    case 'editRow': {
      if (!isValidAmount(action.points, MAX_POINTS)) return state;
      const current = state.rows.find((row) => row.id === action.id);
      if (current === undefined || current.points === action.points) return state;
      const rows = state.rows.map((row) =>
        row.id === action.id ? { ...row, points: action.points } : row,
      );
      return { ...state, rows };
    }
    case 'renameTeam': {
      const name = cleanName(action.name, action.team);
      return {
        ...state,
        teams: { ...state.teams, [action.team]: { ...state.teams[action.team], name } },
      };
    }
    // The same side, changed; other players may bring other wins.
    case 'setTeam': {
      const current = state.teams[action.team];
      const name = cleanName(action.name, action.team);
      const saved = action.saved === undefined ? current.saved : action.saved;
      const roundsWon = action.roundsWon ?? current.roundsWon;
      if (
        name === current.name &&
        samePlayers(action.players, current.players) &&
        saved === current.saved &&
        roundsWon === current.roundsWon
      ) {
        return state;
      }
      const team: Team = { ...current, name, players: action.players, saved, roundsWon };
      return { ...state, teams: { ...state.teams, [action.team]: team } };
    }
    // Another team takes the side, with the wins it brings.
    case 'seatTeam': {
      const team: Team = {
        name: cleanName(action.name, action.team),
        players: action.players,
        saved: action.saved,
        roundsWon: action.roundsWon,
      };
      return { ...state, teams: { ...state.teams, [action.team]: team } };
    }
    // Other teams sit down, as between two matches of a tournament.
    case 'seat':
      return { ...state, teams: action.teams, rows: [], between: null };
    case 'setTarget': {
      if (!isValidAmount(action.target, MAX_TARGET)) return state;
      return { ...state, target: action.target };
    }
    case 'setQuickValue': {
      if (!isValidAmount(action.value, MAX_POINTS)) return state;
      return { ...state, quickValue: action.value };
    }
    case 'closeRound': {
      const winner = state.teams[action.winner];
      const roundsWon = winner.roundsWon + 1;
      return {
        ...state,
        rows: [],
        teams: { ...state.teams, [action.winner]: { ...winner, roundsWon } },
        between: action.pause === true ? 'next' : null,
      };
    }
    case 'waitForTeams':
      return state.between === null && state.rows.length === 0
        ? { ...state, between: 'start' }
        : state;
    case 'resume':
      return state.between === null ? state : { ...state, between: null };
    case 'clearRows':
      return state.rows.length === 0 ? state : { ...state, rows: [] };
    case 'resetAll':
      return initialState;
    case 'hydrate':
      return action.state;
  }
}

export function totalsOf(rows: Row[]): Record<TeamId, number> {
  const totals: Record<TeamId, number> = { a: 0, b: 0 };
  for (const row of rows) totals[row.team] += row.points;
  return totals;
}

export function selectTotals(state: State): Record<TeamId, number> {
  return totalsOf(state.rows);
}

/** The first team whose running total reaches the target, walking rows in order. */
export function selectWinner(state: State): TeamId | null {
  const running: Record<TeamId, number> = { a: 0, b: 0 };
  for (const row of state.rows) {
    running[row.team] += row.points;
    if (running[row.team] >= state.target) return row.team;
  }
  return null;
}

/** Validates persisted data; anything malformed yields null so defaults apply. */
export function parseState(value: unknown): State | null {
  if (typeof value !== 'object' || value === null) return null;
  const raw = value as Record<string, unknown>;
  const teams = raw.teams as Record<string, unknown> | undefined;
  if (typeof teams !== 'object' || teams === null) return null;

  const parsedTeams = {} as Record<TeamId, Team>;
  for (const id of TEAM_IDS) {
    const team = teams[id] as Record<string, unknown> | undefined;
    if (typeof team !== 'object' || team === null) return null;
    if (typeof team.name !== 'string') return null;
    const roundsWon = team.roundsWon;
    if (typeof roundsWon !== 'number' || !Number.isInteger(roundsWon) || roundsWon < 0) return null;
    // Boards saved before players existed have none.
    parsedTeams[id] = {
      name: cleanName(team.name, id),
      players: parsePlayers(team.players),
      roundsWon,
      saved: typeof team.saved === 'string' ? team.saved : null,
    };
  }

  const { target, quickValue, rows } = raw;
  if (typeof target !== 'number' || !isValidAmount(target, MAX_TARGET)) return null;
  if (typeof quickValue !== 'number' || !isValidAmount(quickValue, MAX_POINTS)) return null;
  if (!Array.isArray(rows)) return null;

  const parsedRows = parseRows(rows);
  if (parsedRows === null) return null;

  // Boards saved before mesas existed have none.
  const between = raw.between === 'start' || raw.between === 'next' ? raw.between : null;
  return {
    teams: parsedTeams,
    target,
    quickValue,
    rows: parsedRows,
    between,
  };
}

export function parseRows(value: unknown): Row[] | null {
  if (!Array.isArray(value)) return null;
  const rows: Row[] = [];
  for (const item of value) {
    if (typeof item !== 'object' || item === null) return null;
    const row = item as Record<string, unknown>;
    if (typeof row.id !== 'string') return null;
    if (row.team !== 'a' && row.team !== 'b') return null;
    if (typeof row.points !== 'number' || !isValidAmount(row.points, MAX_POINTS)) return null;
    rows.push({ id: row.id, team: row.team, points: row.points });
  }
  return rows;
}

export function isTarget(value: unknown): value is number {
  return typeof value === 'number' && isValidAmount(value, MAX_TARGET);
}
