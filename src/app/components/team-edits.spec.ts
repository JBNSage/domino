import { TestBed } from '@angular/core/testing';

import { GameStore } from '../game/game.store';
import { Players } from '../game/state';
import { addTable, setActive } from '../game/tables';
import { TablesStore } from '../game/tables.store';
import { TeamEdits } from './team-edits';

describe('Changing the team at a seat', () => {
  let store: GameStore;
  let tables: TablesStore;
  let edits: TeamEdits;
  const primos = { id: 's1', name: 'Primos', players: ['Ana', 'Luis'] as Players };

  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    store = TestBed.inject(GameStore);
    tables = TestBed.inject(TablesStore);
    edits = TestBed.inject(TeamEdits);
    tables.change((current) => setActive(addTable(current, 'm1', 'Casa'), 'm1'));
    store.saveTableTeam('m1', primos);
    store.seatTeam('a', { name: primos.name, players: primos.players, saved: 's1' });
  });

  afterEach(() => vi.useRealTimers());

  const savedTeams = () => tables.active()!.teams.map(({ name, players }) => ({ name, players }));

  it('keeps a pair with none of the saved players as another team, leaving the saved one', () => {
    edits.side('a').save('Tías', ['Rosa', 'Pepa'], true);
    expect(savedTeams()).toEqual([
      { name: 'Primos', players: ['Ana', 'Luis'] },
      { name: 'Tías', players: ['Rosa', 'Pepa'] },
    ]);
    const seated = store.state().teams.a;
    expect(seated.name).toBe('Tías');
    expect(seated.saved).toBe(tables.active()!.teams[1].id);
    expect(seated.saved).not.toBe('s1');
  });

  it('changes the saved team when one of its players stays', () => {
    edits.side('a').save('Primos', ['Ana', 'Rosa'], true);
    expect(savedTeams()).toEqual([{ name: 'Primos', players: ['Ana', 'Rosa'] }]);
    expect(store.state().teams.a.saved).toBe('s1');
  });

  it('renames the saved team when its players stay', () => {
    edits.side('a').save('Primas', ['Ana', 'Luis'], true);
    expect(savedTeams()).toEqual([{ name: 'Primas', players: ['Ana', 'Luis'] }]);
    expect(store.state().teams.a.saved).toBe('s1');
  });

  it('leaves the saved team alone when the pair is only for this match', () => {
    edits.side('a').save('Tías', ['Rosa', 'Pepa'], false);
    expect(savedTeams()).toEqual([{ name: 'Primos', players: ['Ana', 'Luis'] }]);
    expect(store.state().teams.a).toMatchObject({ name: 'Tías', saved: null });
  });
});
