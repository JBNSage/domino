import { History, emptyHistory, parseHistory } from './history';
import { State, parseState } from './state';
import { Tables, noTables, parseTables } from './tables';
import { Tournament, parseTournament } from './tournament';

export const STORAGE_KEY = 'domino/state/v1';
/** No longer written: an offer to undo lasts seconds, not across a restart. */
const UNDO_KEY = 'domino/undo/v1';
export const TOURNAMENT_KEY = 'domino/tournament/v1';
export const HISTORY_KEY = 'domino/history/v1';
export const TABLES_KEY = 'domino/tables/v1';

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

export function readTables(raw: string | null): Tables {
  return raw === null ? noTables : parseTables(parse(raw));
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

/** Removes the way back that older versions kept across a restart. */
export function forgetSavedUndo(): void {
  write(UNDO_KEY, null);
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

export function loadTables(): Tables {
  return readTables(read(TABLES_KEY));
}

export function saveTables(tables: Tables): void {
  const empty = tables.tables.length === 0;
  write(TABLES_KEY, empty ? null : JSON.stringify(tables));
}

/** Asks the browser not to evict the saved match when storage runs low. */
export function keepStorage(): void {
  navigator.storage?.persist?.().catch(() => {});
}
