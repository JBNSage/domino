import { initialState } from './state';
import {
  HISTORY_KEY,
  forgetSavedUndo,
  STORAGE_KEY,
  TOURNAMENT_KEY,
  loadHistory,
  loadState,
  loadTournament,
  saveHistory,
  saveState,
  saveTournament,
} from './storage';
import { create } from './tournament';

describe('storage', () => {
  beforeEach(() => localStorage.clear());

  it('returns null when nothing was saved', () => {
    expect(loadState()).toBeNull();
  });

  it('restores what was saved', () => {
    const state = {
      ...initialState,
      target: 150,
      rows: [{ id: 'r1', team: 'a' as const, points: 25 }],
    };
    saveState(state);
    expect(loadState()).toEqual(state);
  });

  it('ignores text that is not JSON', () => {
    localStorage.setItem(STORAGE_KEY, '{not json');
    expect(loadState()).toBeNull();
  });

  it('ignores a saved match with invalid values', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...initialState, target: -5 }));
    expect(loadState()).toBeNull();
  });

  it('reads a board saved before players existed', () => {
    const old = {
      ...initialState,
      teams: { a: { name: 'Los Primos', roundsWon: 2 }, b: { name: 'Equipo B', roundsWon: 0 } },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(old));
    expect(loadState()?.teams.a).toEqual({
      name: 'Los Primos',
      players: null,
      roundsWon: 2,
      saved: null,
    });
  });

  it('keeps and clears the tournament being played', () => {
    const teams = ['Uno', 'Dos', 'Tres'].map((name, index) => ({
      id: `t${index}`,
      name,
      players: null,
    }));
    const tournament = create('x', 1, teams, { kind: 'firstTo', count: 3 });
    saveTournament(tournament);
    expect(loadTournament()).toEqual(tournament);

    saveTournament(null);
    expect(localStorage.getItem(TOURNAMENT_KEY)).toBeNull();
  });

  it('ignores a saved tournament that seats a team twice', () => {
    const teams = ['Uno', 'Dos'].map((name, index) => ({ id: `t${index}`, name, players: null }));
    const tournament = create('x', 1, teams, { kind: 'free' });
    localStorage.setItem(
      TOURNAMENT_KEY,
      JSON.stringify({ ...tournament, seats: { a: 't0', b: 't0' } }),
    );
    expect(loadTournament()).toBeNull();
  });

  it('keeps the history, and leaves no key behind once it is empty', () => {
    const match = {
      id: 'm1',
      endedAt: 10,
      target: 200,
      teams: {
        a: { name: 'Equipo A', players: ['Ana', 'Luis'] as [string, string] },
        b: { name: 'Equipo B', players: null },
      },
      rows: [{ id: 'r1', team: 'a' as const, points: 200 }],
      winner: 'a' as const,
      tournament: null,
      tieBreak: false,
      table: null,
    };
    saveHistory({ matches: [match], tournaments: [] });
    expect(loadHistory().matches).toEqual([match]);

    saveHistory({ matches: [], tournaments: [] });
    expect(localStorage.getItem(HISTORY_KEY)).toBeNull();
  });

  it('keeps the readable entries of a damaged history', () => {
    localStorage.setItem(
      HISTORY_KEY,
      JSON.stringify({ matches: [{ id: 'bad' }, null], tournaments: 'no' }),
    );
    expect(loadHistory()).toEqual({ matches: [], tournaments: [] });
  });

  it('forgets the way back that older versions kept across a restart', () => {
    localStorage.setItem('domino/undo/v1', JSON.stringify({ message: 'x' }));
    forgetSavedUndo();
    expect(localStorage.getItem('domino/undo/v1')).toBeNull();
  });
});
