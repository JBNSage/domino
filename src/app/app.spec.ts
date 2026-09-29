import { TestBed } from '@angular/core/testing';

import { App } from './app';
import { copy } from './copy';
import { GameStore } from './game/game.store';
import { addTable, setActive } from './game/tables';
import { TablesStore } from './game/tables.store';

describe('App', () => {
  beforeEach(() => localStorage.clear());

  it('opens on the scoreboard, ready to score', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const page = fixture.nativeElement as HTMLElement;

    expect(page.textContent).toContain('Equipo A');
    expect(page.textContent).toContain('Equipo B');
    expect(page.textContent).toContain(copy.list.emptyTitle);
    expect(page.querySelector('app-target-header')?.textContent).toContain('200');
  });

  it('offers the tournament, the history and the teams from the menu', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const page = fixture.nativeElement as HTMLElement;
    const menu = page.querySelector('app-menu-sheet');

    expect(page.querySelector('app-target-header [aria-label="Menú"]')).not.toBeNull();
    expect(menu?.textContent).toContain(copy.menu.tournament);
    expect(menu?.textContent).toContain(copy.menu.history);
    expect(menu?.textContent).toContain(copy.menu.stats);
    expect(menu?.textContent).toContain(copy.appearance.label);
    expect(menu?.querySelectorAll('.team')).toHaveLength(2);
  });

  it('shows the way to the table only during a tournament', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const header = (fixture.nativeElement as HTMLElement).querySelector('app-target-header');
    expect(header?.querySelector('.status')).toBeNull();

    const teams = ['Uno', 'Dos'].map((name, index) => ({ id: `t${index}`, name, players: null }));
    TestBed.inject(GameStore).startTournament(teams, { kind: 'free' });
    await fixture.whenStable();
    expect(header?.querySelector('.status')?.textContent?.trim()).toBe(
      copy.tournament.status(null, 1, false),
    );
  });

  it('names the mesa in the menu and above the board', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const page = fixture.nativeElement as HTMLElement;
    expect(page.querySelector('app-menu-sheet')?.textContent).toContain(copy.menu.mesa(null));
    expect(page.querySelector('app-target-header .status')).toBeNull();

    TestBed.inject(TablesStore).change((tables) => setActive(addTable(tables, 'm1', 'Casa'), 'm1'));
    await fixture.whenStable();
    expect(page.querySelector('app-menu-sheet')?.textContent).toContain(copy.menu.mesa('Casa'));
    expect(page.querySelector('app-target-header .status')?.textContent?.trim()).toBe(
      copy.tables.status('Casa'),
    );
  });

  it('offers other teams after a match only at a mesa', () => {
    const store = TestBed.inject(GameStore);
    store.addPoints('a', 200);
    expect(store.closeLabel()).toBe(copy.winner.close);
    expect(store.canRotate()).toBe(false);

    TestBed.inject(TablesStore).change((tables) => setActive(addTable(tables, 'm1', 'Casa'), 'm1'));
    expect(store.closeLabel()).toBe(copy.winner.close);
    expect(store.canRotate()).toBe(true);
  });

  it('shows the players under their team', async () => {
    const fixture = TestBed.createComponent(App);
    TestBed.inject(GameStore).setTeam('a', 'Los Primos', ['Ana', 'Luis']);
    await fixture.whenStable();
    const panels = (fixture.nativeElement as HTMLElement).querySelectorAll(
      'app-team-lockup .panel',
    );
    const players = panels[0].querySelector('.players')?.textContent ?? '';
    expect(players.replace(/\s+/g, ' ').trim()).toBe('Ana · Luis');
    expect(panels[1].querySelector('.players')).toBeNull();
  });

  it('adds the quick points with one press', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const page = fixture.nativeElement as HTMLElement;

    page.querySelector<HTMLButtonElement>('app-quick-add-bar button')?.click();
    await fixture.whenStable();

    expect(page.querySelector('app-team-lockup .total')?.textContent?.trim()).toBe('30');
    expect(page.querySelectorAll('app-score-list li')).toHaveLength(1);
  });
});
