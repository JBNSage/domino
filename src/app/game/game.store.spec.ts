import { TestBed } from '@angular/core/testing';

import { copy } from '../copy';
import { GameStore, UNDO_MS } from './game.store';
import { HistoryStore } from './history.store';
import { initialState } from './state';
import { STORAGE_KEY, TOURNAMENT_KEY, UNDO_KEY, loadTournament, loadUndo } from './storage';
import { standings } from './tournament';
import { TournamentDraft } from './tournament-draft';

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
      expect(loadUndo()).toEqual({
        message: copy.undo.allReset,
        snapshot: before,
        tournament: null,
        recorded: { matches: [], tournaments: [] },
      });
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

  describe('players', () => {
    it('are saved with the team and shown with the result', () => {
      store.setTeam('a', 'Los Primos', ['Ana', 'Luis']);
      store.addPoints('a', 200);
      expect(store.result()?.players).toEqual({ a: ['Ana', 'Luis'], b: null });
      expect(store.state().teams.b.players).toBeNull();
    });
  });

  describe('history', () => {
    const history = () => TestBed.inject(HistoryStore).history();

    it('keeps a closed match with its teams, players and hands', () => {
      store.setTeam('b', 'Las Tías', ['Marta', 'Rosa']);
      store.addPoints('a', 40);
      store.addPoints('b', 200);
      const rows = store.state().rows;
      store.closeRound();

      expect(history().matches).toHaveLength(1);
      expect(history().matches[0]).toMatchObject({
        target: 200,
        winner: 'b',
        rows,
        tournament: null,
        teams: {
          a: { name: 'Equipo A', players: null },
          b: { name: 'Las Tías', players: ['Marta', 'Rosa'] },
        },
      });
    });

    it('forgets the match when closing it is taken back', () => {
      store.addPoints('a', 200);
      store.closeRound();
      store.restore();
      expect(history().matches).toHaveLength(0);
      expect(store.winner()).toBe('a');
    });

    it('removes one match and brings it back', () => {
      store.addPoints('a', 200);
      store.closeRound();
      const [match] = history().matches;

      store.deleteMatch(match.id);
      expect(history().matches).toHaveLength(0);
      expect(store.undo()?.message).toBe(copy.undo.matchDeleted);

      store.restore();
      expect(history().matches).toEqual([match]);
    });

    it('clears everything, with no time limit on the way back', () => {
      store.addPoints('a', 200);
      store.closeRound();
      store.clearHistory();
      expect(history().matches).toHaveLength(0);

      vi.advanceTimersByTime(UNDO_MS * 10);
      store.restore();
      expect(history().matches).toHaveLength(1);
    });

    it('offers nothing when the history was already empty', () => {
      store.clearHistory();
      expect(store.undo()).toBeNull();
    });

    it('survives a full reset of the board', () => {
      store.addPoints('a', 200);
      store.closeRound();
      store.resetAll();
      expect(history().matches).toHaveLength(1);
    });
  });

  describe('tournament', () => {
    const history = () => TestBed.inject(HistoryStore).history();
    const teams = ['Uno', 'Dos', 'Tres'].map((name, index) => ({
      id: `t${index + 1}`,
      name,
      players: index === 0 ? (['Ana', 'Luis'] as [string, string]) : null,
    }));
    const names = () => [store.state().teams.a.name, store.state().teams.b.name];

    /** Plays the match on the table to the end and closes it. */
    const win = (side: 'a' | 'b') => {
      store.addPoints(side, 200);
      store.closeRound();
    };

    it('sweeps the board, waits for the first pair, and can be taken back', () => {
      store.addPoints('a', 50);
      const before = store.state();
      store.startTournament(teams, { kind: 'firstTo', count: 2 });

      expect(store.tournament()?.phase).toBe('between');
      expect(store.state().rows).toEqual([]);
      expect(store.addPoints('a', 10)).toBeNull();

      store.restore();
      expect(store.tournament()).toBeNull();
      expect(store.state()).toEqual(before);
    });

    it('sits the chosen teams at the board with their players', () => {
      store.startTournament(teams, { kind: 'free' });
      store.setSeat('b', 't3');
      store.startNextMatch();
      expect(names()).toEqual(['Uno', 'Tres']);
      expect(store.state().teams.a.players).toEqual(['Ana', 'Luis']);
    });

    it('keeps the winner, brings in who waited, and counts wins at the board', () => {
      store.startTournament(teams, { kind: 'free' });
      store.startNextMatch();
      win('b');
      expect(store.closeLabel()).toBe(copy.winner.close);
      expect(store.tournament()?.phase).toBe('between');

      store.startNextMatch();
      expect(names()).toEqual(['Tres', 'Dos']);
      expect(store.state().teams.b.roundsWon).toBe(1);
      expect(history().matches[0].tournament).toBe(store.tournament()?.id);
    });

    it('says what closing the match leads to', () => {
      store.startTournament(teams, { kind: 'firstTo', count: 2 });
      store.startNextMatch();
      store.addPoints('a', 200);
      expect(store.closeLabel()).toBe(copy.tournament.next);
      store.closeRound();
      store.startNextMatch();
      store.addPoints('a', 200);
      expect(store.closeLabel()).toBe(copy.tournament.result);
    });

    it('ends on the limit, and is kept in the history when saved', () => {
      store.startTournament(teams, { kind: 'firstTo', count: 2 });
      store.startNextMatch();
      win('a');
      store.startNextMatch();
      win('a');
      expect(store.tournament()?.phase).toBe('done');
      expect(store.announcement()).toBe(copy.tournament.announceChampion('Uno'));

      store.finishTournament();
      expect(store.tournament()).toBeNull();
      expect(store.state().rows).toEqual([]);
      expect(store.state().teams.a.roundsWon).toBe(0);

      const [record] = history().tournaments;
      expect(record.champion).toBe('t1');
      expect(record.championSeat).toBe('a');
      expect(record.ranking.map((team) => team.name)).toEqual(['Uno', 'Dos', 'Tres']);
      expect(history().matches).toHaveLength(2);
    });

    it('takes back the match that decided it, table and history included', () => {
      store.startTournament(teams, { kind: 'firstTo', count: 1 });
      store.startNextMatch();
      store.addPoints('b', 200);
      const before = store.tournament();
      store.closeRound();
      expect(store.canGoBack()).toBe(true);

      store.restore();
      expect(store.tournament()).toEqual(before);
      expect(store.winner()).toBe('b');
      expect(history().matches).toHaveLength(0);
    });

    it('takes back saving the tournament', () => {
      store.startTournament(teams.slice(0, 2), { kind: 'firstTo', count: 1 });
      win('a');
      store.finishTournament();
      store.restore();
      expect(store.tournament()?.phase).toBe('done');
      expect(history().tournaments).toHaveLength(0);
      expect(history().matches).toHaveLength(1);
    });

    it('is cancelled, not saved, when ended before any match', () => {
      store.startTournament(teams, { kind: 'free' });
      store.startNextMatch();
      store.addPoints('a', 30);
      store.endTournament();
      expect(store.tournament()).toBeNull();
      expect(store.undo()?.message).toBe(copy.undo.tournamentCancelled);
      expect(history().tournaments).toHaveLength(0);
    });

    it('ends by hand with the leader as champion, dropping the hands in play', () => {
      store.startTournament(teams, { kind: 'free' });
      store.startNextMatch();
      win('a');
      store.startNextMatch();
      store.addPoints('b', 30);
      store.endTournament();

      expect(store.tournament()?.phase).toBe('done');
      expect(store.state().rows).toEqual([]);
      store.finishTournament();
      expect(history().tournaments[0].champion).toBe('t1');
    });

    it('breaks a tie for first between the tied teams only', () => {
      store.startTournament(teams, { kind: 'free' });
      store.startNextMatch();
      win('a'); // Uno beats Dos
      store.startNextMatch();
      win('b'); // Tres beats Uno
      store.startNextMatch();
      store.startTieBreak();

      expect(names().sort()).toEqual(['Tres', 'Uno']);
      expect(store.tournament()?.phase).toBe('playing');
      win('a');
      expect(store.tournament()?.phase).toBe('done');
      expect(history().matches[0].tieBreak).toBe(true);
    });

    it('can end level, without a champion', () => {
      store.startTournament(teams, { kind: 'free' });
      store.startNextMatch();
      win('a');
      store.startNextMatch();
      win('b');
      store.endTournament();
      store.finishTournament();
      expect(history().tournaments[0].champion).toBeNull();
    });

    it('keeps a new name when the team leaves the table', () => {
      store.startTournament(teams, { kind: 'free' });
      store.startNextMatch();
      store.setTeam('b', 'Las Tías', ['Marta', 'Rosa']);
      win('a');
      const tournament = store.tournament();
      expect(tournament && standings(tournament).map((team) => team.name)).toEqual([
        'Uno',
        'Tres',
        'Las Tías',
      ]);
    });

    it('leaves its teams ready for the next one, with the names they ended with', () => {
      store.startTournament(teams.slice(0, 2), { kind: 'firstTo', count: 1 });
      store.setTeam('b', 'Las Tías', null);
      win('a');
      store.finishTournament();
      const draft = TestBed.inject(TournamentDraft).draft();
      expect(draft?.teams.map((team) => team.name)).toEqual(['Uno', 'Las Tías']);
      expect(draft?.touched).toBe(true);
    });

    it('keeps a deleted tournament on offer with no time limit', () => {
      store.startTournament(teams.slice(0, 2), { kind: 'firstTo', count: 1 });
      win('a');
      store.finishTournament();
      store.deleteTournament(history().tournaments[0].id);
      expect(history()).toEqual({ matches: [], tournaments: [] });

      vi.advanceTimersByTime(UNDO_MS * 10);
      store.restore();
      expect(history().tournaments).toHaveLength(1);
      expect(history().matches).toHaveLength(1);
    });

    it('is not swept away by a full reset', () => {
      store.startTournament(teams.slice(0, 2), { kind: 'free' });
      store.resetAll();
      expect(store.tournament()).not.toBeNull();
    });

    it('is saved, and taken from the other open copy of the app', () => {
      store.startTournament(teams, { kind: 'free' });
      TestBed.tick();
      const saved = loadTournament();
      expect(saved).toEqual(store.tournament());

      localStorage.removeItem(TOURNAMENT_KEY);
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: TOURNAMENT_KEY,
          newValue: null,
          storageArea: localStorage,
        }),
      );
      expect(store.tournament()).toBeNull();
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
