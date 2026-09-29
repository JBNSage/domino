import { Injectable, computed, effect, signal } from '@angular/core';

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
import { loadState, saveState } from './storage';

// Long enough to notice at a noisy table.
export const UNDO_MS = 8000;

/** A no-break space: invisible, but enough for a live region to speak again. */
const REPEAT_MARK = String.fromCharCode(160);

export type Undo = { message: string; snapshot: State };

export type MatchResult = {
  winner: TeamId;
  names: Record<TeamId, string>;
  totals: Record<TeamId, number>;
  /** Rounds the winner will have once this one is counted. */
  roundsAfter: number;
};

/** The change that can end a round, kept so the winner screen can take it back. */
type LastChange = { kind: 'hand' } | { kind: 'target'; snapshot: State };

/** What `correct` did, so the screen can follow up. */
export type Correction = 'restored' | 'deleted' | 'settings';

@Injectable({ providedIn: 'root' })
export class GameStore {
  readonly state = signal<State>(loadState() ?? initialState);
  readonly undo = signal<Undo | null>(null);
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

  // What ended the round: a target lowered in this session, the last hand, or,
  // after a restart, a target lowered earlier that no single hand explains.
  readonly cause = computed<'restore' | 'hand' | 'settings'>(() => {
    if (this.lastChange().kind === 'target') return 'restore';
    const state = this.state();
    const lastHandDecides =
      state.rows.length > 0 && selectWinner({ ...state, rows: state.rows.slice(0, -1) }) === null;
    return lastHandDecides ? 'hand' : 'settings';
  });

  readonly correctLabel = computed(() => {
    const change = this.lastChange();
    if (change.kind === 'target') return copy.winner.restoreTarget(change.snapshot.target);
    return this.cause() === 'hand' ? copy.winner.correct : copy.winner.changeTarget;
  });

  private readonly lastChange = signal<LastChange>({ kind: 'hand' });
  private undoTimer: ReturnType<typeof setTimeout> | null = null;
  private nextId = 0;

  constructor() {
    effect(() => saveState(this.state()));
    effect(() => {
      if (this.winner() !== null) haptics.win();
    });
  }

  dispatch(action: Action): void {
    this.state.update((state) => reducer(state, action));
  }

  addPoints(team: TeamId, points: number): void {
    this.nextId += 1;
    this.lastChange.set({ kind: 'hand' });
    const before = this.state();
    this.dispatch({ type: 'addPoints', team, points, id: `${Date.now()}-${this.nextId}` });
    if (this.state() === before) return;
    haptics.tap();
    this.announce(copy.team.announce(this.state().teams[team].name, this.totals()[team]));
    this.clearUndo();
  }

  addQuick(team: TeamId): void {
    this.addPoints(team, this.state().quickValue);
  }

  renameTeam(team: TeamId, name: string): void {
    this.dispatch({ type: 'renameTeam', team, name });
  }

  deleteRow(row: Row, index: number): void {
    this.withUndo(copy.undo.handDeleted(index + 1), () =>
      this.dispatch({ type: 'deleteRow', id: row.id }),
    );
  }

  closeRound(): void {
    const winner = this.winner();
    if (winner === null) return;
    this.withUndo(copy.undo.roundClosed, () => this.dispatch({ type: 'closeRound', winner }));
  }

  clearRows(): void {
    this.withUndo(copy.undo.handsCleared, () => this.dispatch({ type: 'clearRows' }));
  }

  resetAll(): void {
    this.withUndo(copy.undo.allReset, () => this.dispatch({ type: 'resetAll' }));
  }

  saveSettings(target: number, quickValue: number): void {
    const state = this.state();
    if (target !== state.target) this.lastChange.set({ kind: 'target', snapshot: state });
    this.dispatch({ type: 'setTarget', target });
    this.dispatch({ type: 'setQuickValue', value: quickValue });
  }

  /** Takes back whatever ended the round. */
  correct(): Correction {
    const change = this.lastChange();
    const cause = this.cause();
    this.lastChange.set({ kind: 'hand' });

    if (cause === 'restore' && change.kind === 'target') {
      this.dispatch({ type: 'hydrate', state: change.snapshot });
      return 'restored';
    }
    if (cause === 'hand') {
      const rows = this.state().rows;
      this.deleteRow(rows[rows.length - 1], rows.length - 1);
      return 'deleted';
    }
    return 'settings';
  }

  restore(): void {
    const undo = this.undo();
    if (undo === null) return;
    this.dispatch({ type: 'hydrate', state: undo.snapshot });
    this.clearUndo();
  }

  /** Keeps the undo offer open while someone is reaching for it. */
  holdUndo(): void {
    if (this.undoTimer) clearTimeout(this.undoTimer);
    this.undoTimer = null;
  }

  releaseUndo(): void {
    if (this.undo() === null) return;
    this.holdUndo();
    this.undoTimer = setTimeout(() => this.undo.set(null), UNDO_MS);
  }

  announce(message: string): void {
    // A live region only speaks when its text changes, so a repeat gets a trailing space.
    this.announcement.update((current) => (current === message ? message + REPEAT_MARK : message));
  }

  /** Applies a destructive action and offers to take it back. */
  private withUndo(message: string, apply: () => void): void {
    const snapshot = this.state();
    apply();
    if (this.state() === snapshot) return;
    this.undo.set({ message, snapshot });
    this.announce(message);
    this.releaseUndo();
  }

  private clearUndo(): void {
    this.holdUndo();
    this.undo.set(null);
  }
}
