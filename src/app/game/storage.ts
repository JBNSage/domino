import { State, parseState } from './state';

export const STORAGE_KEY = 'domino/state/v1';

export function loadState(): State | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return null;
    return parseState(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function saveState(state: State): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Scoring keeps working in memory when the browser refuses the write.
  }
}

/** Asks the browser not to evict the saved match when storage runs low. */
export function keepStorage(): void {
  navigator.storage?.persist?.().catch(() => {});
}
