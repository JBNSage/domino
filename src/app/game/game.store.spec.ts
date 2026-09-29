import { TestBed } from '@angular/core/testing';

import { copy } from '../copy';
import { GameStore, UNDO_MS } from './game.store';
import { initialState } from './state';
import { STORAGE_KEY } from './storage';

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

  it('adds the quick value to one team and announces the total', () => {
    store.addQuick('a');
    store.addQuick('a');
    expect(store.totals()).toEqual({ a: 60, b: 0 });
    expect(store.announcement()).toBe(copy.team.announce('Equipo A', 60));
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

      store.restore();
      expect(store.state()).toEqual(before);
      expect(store.undo()).toBeNull();
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

    it('expires, unless someone is reaching for it', () => {
      store.addPoints('a', 10);
      store.clearRows();

      vi.advanceTimersByTime(UNDO_MS - 1);
      expect(store.undo()).not.toBeNull();

      store.holdUndo();
      vi.advanceTimersByTime(UNDO_MS * 2);
      expect(store.undo()).not.toBeNull();

      store.releaseUndo();
      vi.advanceTimersByTime(UNDO_MS);
      expect(store.undo()).toBeNull();
    });

    it('is withdrawn by the next hand', () => {
      store.addPoints('a', 10);
      store.deleteRow(store.state().rows[0], 0);
      store.addPoints('b', 5);
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
});
