import { DestroyRef, Injectable, computed, effect, inject, signal, untracked } from '@angular/core';

import { copy } from '../copy';
import { haptics } from '../platform/haptics';
import {
  Action,
  Row,
  State,
  TeamId,
  initialState,
  reducer,
  selectTotals,
  selectWinner,
} from './state';
import {
  STORAGE_KEY,
  UNDO_KEY,
  loadState,
  loadUndo,
  readState,
  readUndo,
  saveState,
  saveUndo,
} from './storage';

// Long enough to notice at a noisy table.
export const UNDO_MS = 8000;

/** A no-break space: invisible, but enough for a live region to speak again. */
const REPEAT_MARK = String.fromCharCode(160);

/**
 * How an action is taken back. Changes to one hand are reversed on their own,
 * so hands scored in the meantime stay. A reset or a closed round goes back to
 * the board as it was, and is kept until the board changes again.
 */
type Reversal =
  | { kind: 'restoreRow'; row: Row; index: number }
  | { kind: 'removeRow'; id: string }
  | { kind: 'editRow'; id: string; points: number }
  | { kind: 'snapshot'; snapshot: State };

export type Undo = { message: string; reversal: Reversal };

export type MatchResult = {
  winner: TeamId;
  names: Record<TeamId, string>;
  totals: Record<TeamId, number>;
  /** Rounds the winner will have once this one is counted. */
  roundsAfter: number;
};

/** The change that can end a round, kept so the winner screen can take it back. */
type LastChange = { kind: 'hand' } | { kind: 'target' | 'edit'; snapshot: State };

/** What `correct` did, so the screen can follow up. */
export type Correction = 'restored' | 'deleted' | 'settings';

@Injectable({ providedIn: 'root' })
export class GameStore {
  readonly state = signal<State>(loadState() ?? initialState);
  readonly undo = signal<Undo | null>(GameStore.savedUndo());
  /** Text for the screen reader's live region. */
  readonly announcement = signal('');

  readonly totals = computed(() => selectTotals(this.state()));
  readonly winner = computed(() => selectWinner(this.state()));

  readonly result = computed<MatchResult | null>(() => {
    const winner = this.winner();
    if (winner === null) return null;
    const { teams } = this.state();
    return {
      winner,
      names: { a: teams.a.name, b: teams.b.name },
      totals: this.totals(),
      roundsAfter: teams[winner].roundsWon + 1,
    };
  });

  // What ended the round: a target or a hand changed in this session, the last
  // hand, or, after a restart, an earlier change that no single hand explains.
  readonly cause = computed<'restore' | 'hand' | 'settings'>(() => {
    if (this.lastChange().kind !== 'hand') return 'restore';
    const state = this.state();
    const lastHandDecides =
      state.rows.length > 0 && selectWinner({ ...state, rows: state.rows.slice(0, -1) }) === null;
    return lastHandDecides ? 'hand' : 'settings';
  });

  readonly correctLabel = computed(() => {
    const change = this.lastChange();
    if (change.kind === 'target') return copy.winner.restoreTarget(change.snapshot.target);
    if (change.kind === 'edit') return copy.winner.undoEdit;
    return this.cause() === 'hand' ? copy.winner.correct : copy.winner.changeTarget;
  });

  private readonly lastChange = signal<LastChange>({ kind: 'hand' });
  private undoTimer: ReturnType<typeof setTimeout> | null = null;
  private nextId = 0;

  constructor() {
    effect(() => saveState(this.state()));

    effect(() => {
      const undo = this.undo();
      saveUndo(
        undo?.reversal.kind === 'snapshot'
          ? { message: undo.message, snapshot: undo.reversal.snapshot }
          : null,
      );
    });

    effect(() => {
      const result = this.result();
      if (result === null) return;
      haptics.win();
      untracked(() => this.announce(copy.winner.body(result.names[result.winner])));
    });

    this.followOtherTabs();
  }

  dispatch(action: Action): void {
    this.state.update((state) => reducer(state, action));
  }

  addPoints(team: TeamId, points: number): Row | null {
    this.nextId += 1;
    const before = this.state();
    const id = `${Date.now()}-${this.nextId}`;
    this.dispatch({ type: 'addPoints', team, points, id });
    const state = this.state();
    if (state === before) return null;

    this.lastChange.set({ kind: 'hand' });
    this.boardChanged();
    haptics.tap();
    this.announce(copy.team.announce(state.teams[team].name, this.totals()[team]));
    return state.rows[state.rows.length - 1];
  }

  /** One tap and no sheet, so a slip of the thumb gets its own way back. */
  addQuick(team: TeamId): void {
    const value = this.state().quickValue;
    const row = this.addPoints(team, value);
    if (row === null) return;
    this.offer(copy.undo.quickAdded(value, this.state().teams[team].name), {
      kind: 'removeRow',
      id: row.id,
    });
  }

  editRow(row: Row, index: number, points: number): void {
    const before = this.state();
    this.dispatch({ type: 'editRow', id: row.id, points });
    if (this.state() === before) return;

    this.lastChange.set({ kind: 'edit', snapshot: before });
    haptics.tap();
    this.offer(copy.undo.handEdited(index + 1, points), {
      kind: 'editRow',
      id: row.id,
      points: row.points,
    });
  }

  renameTeam(team: TeamId, name: string): void {
    this.dispatch({ type: 'renameTeam', team, name });
    this.boardChanged();
  }

  deleteRow(row: Row, index: number): void {
    const before = this.state();
    this.dispatch({ type: 'deleteRow', id: row.id });
    if (this.state() === before) return;
    this.offer(copy.undo.handDeleted(index + 1), { kind: 'restoreRow', row, index });
  }

  closeRound(): void {
    const winner = this.winner();
    if (winner === null) return;
    this.withSnapshot(copy.undo.roundClosed, { type: 'closeRound', winner });
  }

  clearRows(): void {
    this.withSnapshot(copy.undo.handsCleared, { type: 'clearRows' });
  }

  resetAll(): void {
    this.withSnapshot(copy.undo.allReset, { type: 'resetAll' });
  }

  saveSettings(target: number, quickValue: number): void {
    const before = this.state();
    this.dispatch({ type: 'setTarget', target });
    this.dispatch({ type: 'setQuickValue', value: quickValue });
    if (this.state() === before) return;
    if (target !== before.target) this.lastChange.set({ kind: 'target', snapshot: before });
    this.boardChanged();
  }

  /** Takes back whatever ended the round. */
  correct(): Correction {
    const change = this.lastChange();
    const cause = this.cause();
    this.lastChange.set({ kind: 'hand' });

    if (change.kind !== 'hand') {
      this.dispatch({ type: 'hydrate', state: change.snapshot });
      this.clearUndo();
      return 'restored';
    }
    if (cause === 'hand') {
      const rows = this.state().rows;
      this.deleteRow(rows[rows.length - 1], rows.length - 1);
      return 'deleted';
    }
    return 'settings';
  }

  /** Takes the offer. Returns the hand that came back or changed, if it was one. */
  restore(): string | null {
    const undo = this.undo();
    if (undo === null) return null;
    const { reversal } = undo;
    this.clearUndo();
    this.lastChange.set({ kind: 'hand' });
    this.announce(copy.undo.done);

    switch (reversal.kind) {
      case 'restoreRow':
        this.dispatch({ type: 'restoreRow', row: reversal.row, index: reversal.index });
        return reversal.row.id;
      case 'removeRow':
        this.dispatch({ type: 'deleteRow', id: reversal.id });
        return null;
      case 'editRow':
        this.dispatch({ type: 'editRow', id: reversal.id, points: reversal.points });
        return reversal.id;
      case 'snapshot':
        this.dispatch({ type: 'hydrate', state: reversal.snapshot });
        return null;
    }
  }

  /** Keeps a short-lived offer open while someone is reaching for it. */
  holdUndo(): void {
    if (this.undoTimer) clearTimeout(this.undoTimer);
    this.undoTimer = null;
  }

  releaseUndo(): void {
    this.holdUndo();
    const undo = this.undo();
    // A reset or a closed round stays on offer; only single hands expire.
    if (undo === null || undo.reversal.kind === 'snapshot') return;
    this.undoTimer = setTimeout(() => this.undo.set(null), UNDO_MS);
  }

  announce(message: string): void {
    // A live region only speaks when its text changes, so a repeat gets a trailing space.
    this.announcement.update((current) => (current === message ? message + REPEAT_MARK : message));
  }

  private static savedUndo(): Undo | null {
    const saved = loadUndo();
    return saved === null
      ? null
      : { message: saved.message, reversal: { kind: 'snapshot', snapshot: saved.snapshot } };
  }

  private offer(message: string, reversal: Reversal): void {
    this.undo.set({ message, reversal });
    this.announce(`${message}. ${copy.undo.action}`);
    this.releaseUndo();
  }

  private withSnapshot(message: string, action: Action): void {
    const snapshot = this.state();
    this.dispatch(action);
    if (this.state() === snapshot) return;
    this.lastChange.set({ kind: 'hand' });
    this.offer(message, { kind: 'snapshot', snapshot });
  }

  /** Going back to an old board would now erase newer work, so that offer ends. */
  private boardChanged(): void {
    if (this.undo()?.reversal.kind === 'snapshot') this.clearUndo();
  }

  private clearUndo(): void {
    this.holdUndo();
    this.undo.set(null);
  }

  /** The installed app and a browser tab can both be open; the newest save wins in both. */
  private followOtherTabs(): void {
    if (typeof window === 'undefined') return;

    const onStorage = (event: StorageEvent) => {
      if (event.storageArea !== localStorage) return;
      if (event.key === STORAGE_KEY || event.key === null) {
        const state = readState(event.newValue) ?? initialState;
        if (JSON.stringify(state) === JSON.stringify(this.state())) return;
        this.state.set(state);
        this.lastChange.set({ kind: 'hand' });
        // Whatever this tab was offering belongs to a board that is gone.
        this.holdUndo();
        this.undo.set(GameStore.savedUndo());
      }
      if (event.key === UNDO_KEY) {
        const saved = readUndo(event.newValue);
        this.holdUndo();
        this.undo.set(
          saved === null
            ? null
            : { message: saved.message, reversal: { kind: 'snapshot', snapshot: saved.snapshot } },
        );
      }
    };

    window.addEventListener('storage', onStorage);
    inject(DestroyRef).onDestroy(() => window.removeEventListener('storage', onStorage));
  }
}
