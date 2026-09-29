import { TestBed } from '@angular/core/testing';

import { App } from './app';
import { copy } from './copy';

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
