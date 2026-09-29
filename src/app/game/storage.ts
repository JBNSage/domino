import { History, emptyHistory, parseHistory } from './history';
import { State, parseState } from './state';
import { Tournament, parseTournament } from './tournament';

export const STORAGE_KEY = 'domino/state/v1';
export const UNDO_KEY = 'domino/undo/v1';
export const TOURNAMENT_KEY = 'domino/tournament/v1';
export const HISTORY_KEY = 'domino/history/v1';

/** History entries written by a change, which go when the change is taken back. */
export type Recorded = { matches: string[]; tournaments: string[] };

/**
 * A saved way back from a reset, a closed match or a change to the tournament:
 * the board and the tournament as they were.
 */
export type SavedUndo = {
  message: string;
  snapshot: State;
  tournament: Tournament | null;
  recorded: Recorded;
};

export const nothingRecorded: Recorded = { matches: [], tournaments: [] };

function parse(raw: string | null): unknown {
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

export function readState(raw: string | null): State | null {
  return parseState(parse(raw));
}

export function readTournament(raw: string | null): Tournament | null {
  return parseTournament(parse(raw));
}

export function readHistory(raw: string | null): History {
  return raw === null ? emptyHistory : parseHistory(parse(raw));
}

function readIds(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string') : [];
}

export function readUndo(raw: string | null): SavedUndo | null {
  const value = parse(raw) as Record<string, unknown> | null;
  if (typeof value !== 'object' || value === null) return null;
  if (typeof value.message !== 'string') return null;
  const snapshot = parseState(value.snapshot);
  if (snapshot === null) return null;

  // Ways back saved before tournaments existed carry neither of these.
  const recorded = (value.recorded ?? {}) as Record<string, unknown>;
  return {
    message: value.message,
    snapshot,
    tournament: parseTournament(value.tournament),
    recorded: { matches: readIds(recorded.matches), tournaments: readIds(recorded.tournaments) },
  };
}

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string | null): void {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // Scoring keeps working in memory when the browser refuses the write.
  }
}

export function loadState(): State | null {
  return readState(read(STORAGE_KEY));
}

export function saveState(state: State): void {
  write(STORAGE_KEY, JSON.stringify(state));
}

export function loadUndo(): SavedUndo | null {
  return readUndo(read(UNDO_KEY));
}

export function saveUndo(undo: SavedUndo | null): void {
  write(UNDO_KEY, undo === null ? null : JSON.stringify(undo));
}

export function loadTournament(): Tournament | null {
  return readTournament(read(TOURNAMENT_KEY));
}

export function saveTournament(tournament: Tournament | null): void {
  write(TOURNAMENT_KEY, tournament === null ? null : JSON.stringify(tournament));
}

export function loadHistory(): History {
  return readHistory(read(HISTORY_KEY));
}

export function saveHistory(history: History): void {
  const empty = history.matches.length === 0 && history.tournaments.length === 0;
  write(HISTORY_KEY, empty ? null : JSON.stringify(history));
}

/** Asks the browser not to evict the saved match when storage runs low. */
export function keepStorage(): void {
  navigator.storage?.persist?.().catch(() => {});
}
