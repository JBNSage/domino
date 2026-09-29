import {
  Action,
  State,
  cleanName,
  cleanPlayers,
  initialState,
  parseAmount,
  parseState,
  reducer,
  selectTotals,
  selectWinner,
} from './state';

function play(actions: Action[], from: State = initialState): State {
  return actions.reduce(reducer, from);
}

const add = (team: 'a' | 'b', points: number, id: string): Action => ({
  type: 'addPoints',
  team,
  points,
  id,
});

describe('defaults', () => {
  it('starts with two teams, a 200 target and 30 quick points', () => {
    expect(initialState.teams.a.name).toBe('Equipo A');
    expect(initialState.teams.b.name).toBe('Equipo B');
    expect(initialState.target).toBe(200);
    expect(initialState.quickValue).toBe(30);
    expect(initialState.rows).toEqual([]);
  });
});

describe('points', () => {
  it('adds a row for one team and totals both', () => {
    const state = play([add('a', 25, '1'), add('b', 40, '2'), add('a', 10, '3')]);
    expect(state.rows).toHaveLength(3);
    expect(selectTotals(state)).toEqual({ a: 35, b: 40 });
  });

  it('ignores invalid amounts', () => {
    const state = play([
      add('a', 0, '1'),
      add('a', -5, '2'),
      add('a', 1.5, '3'),
      add('a', 1000, '4'),
    ]);
    expect(state.rows).toEqual([]);
  });

  it('deletes a row and restores it in place', () => {
    const before = play([add('a', 25, '1'), add('b', 40, '2'), add('a', 10, '3')]);
    const deleted = reducer(before, { type: 'deleteRow', id: '2' });
    expect(deleted.rows.map((r) => r.id)).toEqual(['1', '3']);
    expect(selectTotals(deleted)).toEqual({ a: 35, b: 0 });

    const restored = reducer(deleted, { type: 'restoreRow', row: before.rows[1], index: 1 });
    expect(restored.rows).toEqual(before.rows);
  });

  it('does not restore the same row twice', () => {
    const before = play([add('a', 25, '1')]);
    const again = reducer(before, { type: 'restoreRow', row: before.rows[0], index: 0 });
    expect(again.rows).toHaveLength(1);
  });
});

describe('winner', () => {
  it('has no winner below the target', () => {
    expect(selectWinner(play([add('a', 199, '1')]))).toBeNull();
  });

  it('declares the team that reaches the target', () => {
    expect(selectWinner(play([add('a', 150, '1'), add('b', 90, '2'), add('a', 50, '3')]))).toBe(
      'a',
    );
  });

  it('declares a winner when the target is lowered below a total', () => {
    const state = play([add('a', 60, '1'), add('b', 120, '2')]);
    expect(selectWinner(state)).toBeNull();
    expect(selectWinner(reducer(state, { type: 'setTarget', target: 100 }))).toBe('b');
  });

  it('picks whoever got there first when both pass a lowered target', () => {
    const state = play([add('b', 40, '1'), add('a', 80, '2'), add('b', 90, '3')]);
    const lowered = reducer(state, { type: 'setTarget', target: 50 });
    expect(selectWinner(lowered)).toBe('a');
  });

  it('takes no more points once the match is won', () => {
    const won = play([add('a', 200, '1')]);
    expect(reducer(won, add('b', 30, '2'))).toBe(won);
  });

  it('closing the round clears rows and counts the win', () => {
    const won = play([
      { type: 'renameTeam', team: 'a', name: 'Los Primos' },
      { type: 'setTarget', target: 100 },
      { type: 'setQuickValue', value: 25 },
      add('a', 100, '1'),
    ]);
    const next = reducer(won, { type: 'closeRound', winner: 'a' });
    expect(next.rows).toEqual([]);
    expect(next.teams.a).toEqual({ name: 'Los Primos', players: null, roundsWon: 1 });
    expect(next.teams.b.roundsWon).toBe(0);
    expect(next.target).toBe(100);
    expect(next.quickValue).toBe(25);
  });
});

describe('settings', () => {
  it('renames a team and falls back to the default when blank', () => {
    const named = reducer(initialState, { type: 'renameTeam', team: 'b', name: '  Las   Tías ' });
    expect(named.teams.b.name).toBe('Las Tías');
    const blank = reducer(named, { type: 'renameTeam', team: 'b', name: '   ' });
    expect(blank.teams.b.name).toBe('Equipo B');
  });

  it('rejects invalid targets and quick values', () => {
    expect(reducer(initialState, { type: 'setTarget', target: 0 })).toBe(initialState);
    expect(reducer(initialState, { type: 'setTarget', target: 10000 })).toBe(initialState);
    expect(reducer(initialState, { type: 'setQuickValue', value: 0 })).toBe(initialState);
  });

  it('clears the hands but keeps names, rounds and settings', () => {
    const state = play([
      { type: 'renameTeam', team: 'a', name: 'Los Primos' },
      { type: 'setTarget', target: 150 },
      add('a', 150, '1'),
      { type: 'closeRound', winner: 'a' },
      add('b', 40, '2'),
    ]);
    const cleared = reducer(state, { type: 'clearRows' });
    expect(cleared.rows).toEqual([]);
    expect(cleared.teams.a).toEqual({ name: 'Los Primos', players: null, roundsWon: 1 });
    expect(cleared.target).toBe(150);
  });

  it('resets everything', () => {
    const state = play([add('a', 200, '1'), { type: 'closeRound', winner: 'a' }, add('b', 5, '2')]);
    expect(reducer(state, { type: 'resetAll' })).toEqual(initialState);
  });
});

describe('parseAmount', () => {
  it('accepts whole numbers in range', () => {
    expect(parseAmount('30', 999)).toBe(30);
    expect(parseAmount(' 7 ', 999)).toBe(7);
  });

  it('rejects everything else', () => {
    for (const input of ['', '0', '-3', '2.5', '2,5', 'abc', '1000']) {
      expect(parseAmount(input, 999)).toBeNull();
    }
  });
});

describe('parseState', () => {
  it('round-trips a saved state', () => {
    const state = play([add('a', 25, '1'), add('b', 40, '2')]);
    expect(parseState(JSON.parse(JSON.stringify(state)))).toEqual(state);
  });

  it('rejects malformed data', () => {
    expect(parseState(null)).toBeNull();
    expect(parseState({})).toBeNull();
    expect(parseState({ ...initialState, target: 'x' })).toBeNull();
    expect(parseState({ ...initialState, rows: [{ id: '1', team: 'c', points: 5 }] })).toBeNull();
  });
});

describe('editRow', () => {
  it('changes the points of one hand and keeps its place', () => {
    const state = play([add('a', 10, 'r1'), add('b', 20, 'r2'), add('a', 30, 'r3')]);
    const next = reducer(state, { type: 'editRow', id: 'r2', points: 25 });
    expect(next.rows.map((row) => row.id)).toEqual(['r1', 'r2', 'r3']);
    expect(next.rows[1]).toEqual({ id: 'r2', team: 'b', points: 25 });
    expect(selectTotals(next)).toEqual({ a: 40, b: 25 });
  });

  it('ignores an invalid amount, an unknown hand and an unchanged value', () => {
    const state = play([add('a', 10, 'r1')]);
    expect(reducer(state, { type: 'editRow', id: 'r1', points: 0 })).toBe(state);
    expect(reducer(state, { type: 'editRow', id: 'nope', points: 5 })).toBe(state);
    expect(reducer(state, { type: 'editRow', id: 'r1', points: 10 })).toBe(state);
  });
});

describe('players', () => {
  it('are two or none', () => {
    expect(cleanPlayers('  Ana ', 'Luis')).toEqual(['Ana', 'Luis']);
    expect(cleanPlayers('', '   ')).toBeNull();
    expect(cleanPlayers('Ana', '')).toBe('incomplete');
    expect(cleanPlayers(' ', 'Luis')).toBe('incomplete');
  });

  it('can be given to one team and not the other', () => {
    const state = reducer(initialState, {
      type: 'setTeam',
      team: 'a',
      name: 'Los Primos',
      players: ['Ana', 'Luis'],
    });
    expect(state.teams.a).toEqual({ name: 'Los Primos', players: ['Ana', 'Luis'], roundsWon: 0 });
    expect(state.teams.b.players).toBeNull();
  });

  it('stay with the team when it is renamed, and go on a full reset', () => {
    const state = play([
      { type: 'setTeam', team: 'b', name: 'Las Tías', players: ['Marta', 'Rosa'] },
      { type: 'renameTeam', team: 'b', name: 'Las Primas' },
    ]);
    expect(state.teams.b).toEqual({
      name: 'Las Primas',
      players: ['Marta', 'Rosa'],
      roundsWon: 0,
    });
    expect(reducer(state, { type: 'resetAll' }).teams.b.players).toBeNull();
  });

  it('changes nothing when the team is saved as it was', () => {
    expect(
      reducer(initialState, { type: 'setTeam', team: 'a', name: 'Equipo A', players: null }),
    ).toBe(initialState);
  });

  it('drops a saved pair that is not two names', () => {
    const saved = JSON.parse(JSON.stringify(initialState));
    saved.teams.a.players = ['Ana'];
    saved.teams.b.players = ['Marta', 'Rosa'];
    const state = parseState(saved);
    expect(state?.teams.a.players).toBeNull();
    expect(state?.teams.b.players).toEqual(['Marta', 'Rosa']);
  });
});

describe('seat', () => {
  it('sits two other teams at a clean board and keeps the settings', () => {
    const state = play([{ type: 'setTarget', target: 150 }, add('a', 40, '1')]);
    const next = reducer(state, {
      type: 'seat',
      teams: {
        a: { name: 'Uno', players: null, roundsWon: 2 },
        b: { name: 'Dos', players: ['Ana', 'Luis'], roundsWon: 0 },
      },
    });
    expect(next.rows).toEqual([]);
    expect(next.target).toBe(150);
    expect(next.teams.a).toEqual({ name: 'Uno', players: null, roundsWon: 2 });
    expect(next.teams.b.players).toEqual(['Ana', 'Luis']);
  });
});

describe('cleanName', () => {
  it('never cuts an emoji in half', () => {
    const name = cleanName('🁣'.repeat(20), 'a');
    expect(Array.from(name)).toHaveLength(16);
    expect(name).toBe('🁣'.repeat(16));
  });
});
