import { TestBed } from '@angular/core/testing';

import { App } from './app';
import { copy } from './copy';
import { GameStore } from './game/game.store';

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
    expect(menu?.textContent).toContain(copy.appearance.label);
    expect(menu?.querySelectorAll('.team')).toHaveLength(2);
  });

  it('shows the way to the table only during a tournament', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const header = (fixture.nativeElement as HTMLElement).querySelector('app-target-header');
    expect(header?.textContent).not.toContain(copy.tournament.table);

    const teams = ['Uno', 'Dos'].map((name, index) => ({ id: `t${index}`, name, players: null }));
    TestBed.inject(GameStore).startTournament(teams, { kind: 'free' });
    await fixture.whenStable();
    expect(header?.textContent).toContain(copy.tournament.table);
  });

  it('shows the players under their team', async () => {
    const fixture = TestBed.createComponent(App);
    TestBed.inject(GameStore).setTeam('a', 'Los Primos', ['Ana', 'Luis']);
    await fixture.whenStable();
    const panels = (fixture.nativeElement as HTMLElement).querySelectorAll(
      'app-team-lockup .panel',
    );
    expect(panels[0].querySelector('.players')?.textContent?.trim()).toBe('Ana · Luis');
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
