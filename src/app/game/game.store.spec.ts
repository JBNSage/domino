import { TestBed } from '@angular/core/testing';

import { copy } from '../copy';
import { GameStore, UNDO_MS } from './game.store';
import { initialState } from './state';
import { STORAGE_KEY, UNDO_KEY, loadUndo } from './storage';

describe('GameStore', () => {
  let store: GameStore;

  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    store = TestBed.inject(GameStore);
  });

  afterEach(() => vi.useRealTimers());

  it('starts from the defaults when nothing was saved', () => {
    expect(store.state()).toEqual(initialState);
    expect(store.winner()).toBeNull();
  });

  it('announces the new total after a hand', () => {
    store.addPoints('a', 25);
    store.addPoints('a', 35);
    expect(store.totals()).toEqual({ a: 60, b: 0 });
    expect(store.announcement()).toBe(copy.team.announce('Equipo A', 60));
  });

  it('announces the winner', () => {
    store.addPoints('b', 200);
    TestBed.tick();
    expect(store.announcement()).toBe(copy.winner.body('Equipo B'));
  });

  describe('quick points', () => {
    it('add the quick value and can be taken back without touching later hands', () => {
      store.addQuick('a');
      expect(store.totals()).toEqual({ a: 30, b: 0 });
      expect(store.undo()?.message).toBe(copy.undo.quickAdded(30, 'Equipo A'));

      store.addPoints('b', 12);
      store.restore();
      expect(store.totals()).toEqual({ a: 0, b: 12 });
    });
  });

  describe('correcting a hand', () => {
    it('changes the points in place and can be taken back', () => {
      store.addPoints('a', 10);
      store.addPoints('b', 20);
      const row = store.state().rows[0];

      store.editRow(row, 0, 15);
      expect(store.state().rows[0]).toEqual({ ...row, points: 15 });
      expect(store.undo()?.message).toBe(copy.undo.handEdited(1, 15));

      expect(store.restore()).toBe(row.id);
      expect(store.state().rows[0]).toEqual(row);
    });

    it('offers to take the correction back when it ends the round', () => {
      store.addPoints('a', 20);
      store.addPoints('b', 10);
      store.editRow(store.state().rows[0], 0, 200);
      expect(store.winner()).toBe('a');
      expect(store.correctLabel()).toBe(copy.winner.undoEdit);

      expect(store.correct()).toBe('restored');
      expect(store.totals()).toEqual({ a: 20, b: 10 });
    });
  });

  it('saves every change', () => {
    store.addPoints('b', 40);
    TestBed.tick();
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
    expect(saved.rows).toHaveLength(1);
    expect(saved.rows[0]).toMatchObject({ team: 'b', points: 40 });
  });

  describe('undo', () => {
    it('restores a deleted hand in place', () => {
      store.addPoints('a', 10);
      store.addPoints('b', 20);
      store.addPoints('a', 30);
      const before = store.state();

      store.deleteRow(before.rows[1], 1);
      expect(store.state().rows).toHaveLength(2);
      expect(store.undo()?.message).toBe(copy.undo.handDeleted(2));

      expect(store.restore()).toBe(before.rows[1].id);
      expect(store.state()).toEqual(before);
      expect(store.undo()).toBeNull();
      expect(store.announcement()).toBe(copy.undo.done);
    });

    it('keeps the offer for a deleted hand while more hands are scored', () => {
      store.addPoints('a', 10);
      store.addPoints('b', 20);
      const deleted = store.state().rows[0];

      store.deleteRow(deleted, 0);
      store.addPoints('b', 5);
      expect(store.undo()).not.toBeNull();

      store.restore();
      expect(store.state().rows.map((row) => row.points)).toEqual([10, 20, 5]);
    });

    it('restores a closed round', () => {
      store.addPoints('a', 200);
      const before = store.state();

      store.closeRound();
      expect(store.state().rows).toHaveLength(0);
      expect(store.state().teams.a.roundsWon).toBe(1);

      store.restore();
      expect(store.state()).toEqual(before);
      expect(store.winner()).toBe('a');
    });

    it('restores cleared hands and a full reset', () => {
      store.renameTeam('a', 'Los Primos');
      store.addPoints('a', 50);
      const before = store.state();

      store.clearRows();
      expect(store.state().rows).toHaveLength(0);
      expect(store.state().teams.a.name).toBe('Los Primos');
      store.restore();
      expect(store.state()).toEqual(before);

      store.resetAll();
      expect(store.state()).toEqual(initialState);
      store.restore();
      expect(store.state()).toEqual(before);
    });

    it('offers nothing when there was nothing to clear', () => {
      store.clearRows();
      expect(store.undo()).toBeNull();
    });

    it('keeps a reset on offer with no time limit, and across a restart', () => {
      store.addPoints('a', 10);
      const before = store.state();
      store.resetAll();

      vi.advanceTimersByTime(UNDO_MS * 10);
      expect(store.undo()?.message).toBe(copy.undo.allReset);

      TestBed.tick();
      expect(loadUndo()).toEqual({ message: copy.undo.allReset, snapshot: before });
    });

    it('withdraws a reset offer once the new board is in use', () => {
      store.addPoints('a', 10);
      store.clearRows();
      store.addPoints('b', 5);
      expect(store.undo()).toBeNull();
      TestBed.tick();
      expect(loadUndo()).toBeNull();
    });

    it('lets the offer for one hand expire, unless someone is reaching for it', () => {
      store.addPoints('a', 10);
      store.deleteRow(store.state().rows[0], 0);

      vi.advanceTimersByTime(UNDO_MS - 1);
      expect(store.undo()).not.toBeNull();

      store.holdUndo();
      vi.advanceTimersByTime(UNDO_MS * 2);
      expect(store.undo()).not.toBeNull();

      store.releaseUndo();
      vi.advanceTimersByTime(UNDO_MS);
      expect(store.undo()).toBeNull();
    });
  });

  describe('taking back what ended the round', () => {
    it('deletes the last hand when that hand won', () => {
      store.addPoints('b', 40);
      store.addPoints('a', 200);
      expect(store.cause()).toBe('hand');
      expect(store.correctLabel()).toBe(copy.winner.correct);

      expect(store.correct()).toBe('deleted');
      expect(store.winner()).toBeNull();
      expect(store.totals()).toEqual({ a: 0, b: 40 });
    });

    it('restores the target when lowering it won, leaving the hands alone', () => {
      store.addPoints('a', 80);
      store.addPoints('b', 10);
      store.saveSettings(60, 30);
      expect(store.winner()).toBe('a');
      expect(store.cause()).toBe('restore');
      expect(store.correctLabel()).toBe(copy.winner.restoreTarget(200));

      expect(store.correct()).toBe('restored');
      expect(store.state().target).toBe(200);
      expect(store.state().rows).toHaveLength(2);
      expect(store.winner()).toBeNull();
    });

    it('sends to the settings when no single hand explains the win', () => {
      // As after a restart: the target was lowered earlier and the session forgot it.
      store.dispatch({
        type: 'hydrate',
        state: {
          ...initialState,
          target: 60,
          rows: [
            { id: 'r1', team: 'a', points: 80 },
            { id: 'r2', team: 'b', points: 10 },
          ],
        },
      });
      expect(store.cause()).toBe('settings');
      expect(store.correctLabel()).toBe(copy.winner.changeTarget);

      expect(store.correct()).toBe('settings');
      expect(store.state().rows).toHaveLength(2);
    });
  });

  it('takes no more points once a team has won', () => {
    store.addPoints('a', 200);
    store.addPoints('b', 50);
    expect(store.totals()).toEqual({ a: 200, b: 0 });
  });

  describe('with the app open twice', () => {
    const fromOtherTab = (key: string, value: string | null) => {
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, value);
      window.dispatchEvent(
        new StorageEvent('storage', { key, newValue: value, storageArea: localStorage }),
      );
    };

    it('takes the board saved by the other one', () => {
      store.addQuick('a');
      const theirs = {
        ...initialState,
        rows: [{ id: 'x1', team: 'b' as const, points: 60 }],
      };
      fromOtherTab(STORAGE_KEY, JSON.stringify(theirs));

      expect(store.state()).toEqual(theirs);
      expect(store.undo()).toBeNull();
    });

    it('shows the way back from a reset made in the other one', () => {
      const snapshot = { ...initialState, rows: [{ id: 'x1', team: 'a' as const, points: 40 }] };
      fromOtherTab(UNDO_KEY, JSON.stringify({ message: copy.undo.allReset, snapshot }));
      expect(store.undo()?.message).toBe(copy.undo.allReset);

      store.restore();
      expect(store.state()).toEqual(snapshot);
    });

    it('falls back to a clean board when the other one saved something unreadable', () => {
      store.addPoints('a', 10);
      fromOtherTab(STORAGE_KEY, '{broken');
      expect(store.state()).toEqual(initialState);
    });
  });
});
