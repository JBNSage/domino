import { State, parseState } from './state';

export const STORAGE_KEY = 'domino/state/v1';
export const UNDO_KEY = 'domino/undo/v1';

/** A saved way back from a reset or a closed round. */
export type SavedUndo = { message: string; snapshot: State };

export function readState(raw: string | null): State | null {
  if (raw === null) return null;
  try {
    return parseState(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function readUndo(raw: string | null): SavedUndo | null {
  if (raw === null) return null;
  try {
    const value = JSON.parse(raw) as Record<string, unknown> | null;
    if (typeof value !== 'object' || value === null) return null;
    if (typeof value.message !== 'string') return null;
    const snapshot = parseState(value.snapshot);
    return snapshot === null ? null : { message: value.message, snapshot };
  } catch {
    return null;
  }
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

/** Asks the browser not to evict the saved match when storage runs low. */
export function keepStorage(): void {
  navigator.storage?.persist?.().catch(() => {});
}
