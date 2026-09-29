import { initialState } from './state';
import { STORAGE_KEY, loadState, saveState } from './storage';

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
});
