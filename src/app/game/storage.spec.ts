import { initialState } from './state';
import { STORAGE_KEY, UNDO_KEY, loadState, loadUndo, saveState, saveUndo } from './storage';

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

  it('keeps and clears the way back from a reset', () => {
    const undo = { message: 'Todo reiniciado', snapshot: { ...initialState, target: 150 } };
    saveUndo(undo);
    expect(loadUndo()).toEqual(undo);

    saveUndo(null);
    expect(localStorage.getItem(UNDO_KEY)).toBeNull();
    expect(loadUndo()).toBeNull();
  });

  it('ignores a saved way back whose board is invalid', () => {
    localStorage.setItem(UNDO_KEY, JSON.stringify({ message: 'x', snapshot: { rows: 'no' } }));
    expect(loadUndo()).toBeNull();
  });
});
