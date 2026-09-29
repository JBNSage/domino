import { DestroyRef, Injectable, effect, inject, signal } from '@angular/core';

import {
  History,
  MatchRecord,
  Removal,
  TournamentRecord,
  addMatch,
  addTournament,
  emptyHistory,
  merge,
  remove,
  renamePlayer,
} from './history';
import { HISTORY_KEY, loadHistory, readHistory, saveHistory } from './storage';

/** The finished matches and tournaments kept on this device. */
@Injectable({ providedIn: 'root' })
export class HistoryStore {
  readonly history = signal<History>(loadHistory());

  constructor() {
    effect(() => saveHistory(this.history()));
    this.followOtherTabs();
  }

  addMatch(match: MatchRecord): void {
    this.history.update((history) => addMatch(history, match));
  }

  addTournament(tournament: TournamentRecord): void {
    this.history.update((history) => addTournament(history, tournament));
  }

  /** Takes entries out and returns them, so they can be put back. */
  remove(goes: Removal): History {
    const { kept, removed } = remove(this.history(), goes);
    if (removed.matches.length > 0 || removed.tournaments.length > 0) this.history.set(kept);
    return removed;
  }

  clear(): History {
    const removed = this.history();
    this.history.set(emptyHistory);
    return removed;
  }

  renamePlayer(at: (match: MatchRecord) => boolean, from: string, to: string): void {
    this.history.update((history) => renamePlayer(history, at, from, to));
  }

  restore(removed: History): void {
    this.history.update((history) => merge(history, removed));
  }

  private followOtherTabs(): void {
    if (typeof window === 'undefined') return;

    const onStorage = (event: StorageEvent) => {
      if (event.storageArea !== localStorage) return;
      if (event.key !== HISTORY_KEY && event.key !== null) return;
      const history = readHistory(event.newValue);
      if (JSON.stringify(history) !== JSON.stringify(this.history())) this.history.set(history);
    };

    window.addEventListener('storage', onStorage);
    inject(DestroyRef).onDestroy(() => window.removeEventListener('storage', onStorage));
  }
}
