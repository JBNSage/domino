import { DestroyRef, Injectable, computed, effect, inject, signal } from '@angular/core';

import { MESA_CLOUD, SharedMesa } from './cloud';
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
import { fromMatchDoc, toMatchDoc } from './mesa-doc';
import { HISTORY_KEY, loadHistory, readHistory, saveHistory } from './storage';

const newestFirst = (one: MatchRecord, other: MatchRecord) => other.endedAt - one.endedAt;

/** A shared mesa's matches, read as the app keeps matches. */
function sharedMatches(mesa: SharedMesa): MatchRecord[] {
  const doc = mesa.doc;
  if (doc === null) return [];
  return mesa.matches.map((match) =>
    fromMatchDoc(match, { id: mesa.id, name: doc.name }, mesa.members),
  );
}

/**
 * The finished matches and tournaments: those kept on this device, and the
 * matches of the shared mesas it belongs to, which are kept in the cloud.
 */
@Injectable({ providedIn: 'root' })
export class HistoryStore {
  private readonly cloud = inject(MESA_CLOUD);
  private readonly local = signal<History>(loadHistory());
  /** What this device keeps; a shared mesa's matches belong to the mesa. */
  readonly kept = this.local.asReadonly();

  readonly history = computed<History>(() => {
    const local = this.local();
    const mesas = [...this.cloud.mesas().values()];
    if (mesas.length === 0) return local;
    const shared = mesas.flatMap(sharedMatches);
    const ids = new Set(shared.map((match) => match.id));
    return {
      matches: [...shared, ...local.matches.filter((match) => !ids.has(match.id))].sort(
        newestFirst,
      ),
      tournaments: local.tournaments,
    };
  });

  constructor() {
    effect(() => saveHistory(this.local()));
    this.followOtherTabs();
  }

  addMatch(match: MatchRecord): void {
    const mesa = this.sharedAt(match);
    if (mesa !== null) this.cloud.addMatch(mesa.id, toMatchDoc(match, mesa.members));
    else this.local.update((history) => addMatch(history, match));
  }

  addTournament(tournament: TournamentRecord): void {
    this.local.update((history) => addTournament(history, tournament));
  }

  /** Takes entries out and returns them, so they can be put back. */
  remove(goes: Removal): History {
    const { removed } = remove(this.history(), goes);
    for (const match of removed.matches) {
      const mesa = this.sharedAt(match);
      if (mesa !== null) this.cloud.removeMatch(mesa.id, match.id);
    }
    const { kept } = remove(this.local(), goes);
    if (kept !== this.local()) this.local.set(kept);
    return removed;
  }

  /** Empties what is kept on this device; a shared mesa's matches belong to the mesa. */
  clear(): History {
    const removed = this.local();
    this.local.set(emptyHistory);
    return removed;
  }

  /** Renames a player in the matches kept here; shared ones follow their members by themselves. */
  renamePlayer(at: (match: MatchRecord) => boolean, from: string, to: string): void {
    this.local.update((history) => renamePlayer(history, at, from, to));
  }

  restore(removed: History): void {
    const local: History = { matches: [], tournaments: removed.tournaments };
    for (const match of removed.matches) {
      if (this.sharedAt(match) !== null) this.addMatch(match);
      else local.matches.push(match);
    }
    this.local.update((history) => merge(history, local));
  }

  /** The matches this device keeps that `at` picks, such as those of a mesa about to be shared. */
  localOf(at: (match: MatchRecord) => boolean): MatchRecord[] {
    return this.local().matches.filter(at);
  }

  /** Lets go of matches this device kept, once they are safe in the cloud. */
  dropLocal(ids: string[]): void {
    if (ids.length === 0) return;
    this.local.update((history) => remove(history, { matches: ids }).kept);
  }

  private sharedAt(match: MatchRecord): SharedMesa | null {
    if (match.tableId === null) return null;
    const mesa = this.cloud.mesas().get(match.tableId);
    return mesa === undefined || mesa.doc === null ? null : mesa;
  }

  private followOtherTabs(): void {
    if (typeof window === 'undefined') return;

    const onStorage = (event: StorageEvent) => {
      if (event.storageArea !== localStorage) return;
      if (event.key !== HISTORY_KEY && event.key !== null) return;
      const history = readHistory(event.newValue);
      if (JSON.stringify(history) !== JSON.stringify(this.local())) this.local.set(history);
    };

    window.addEventListener('storage', onStorage);
    inject(DestroyRef).onDestroy(() => window.removeEventListener('storage', onStorage));
  }
}
