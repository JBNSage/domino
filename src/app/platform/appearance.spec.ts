import { TestBed } from '@angular/core/testing';

import { APPEARANCE_KEY, Appearance } from './appearance';

/** Stands in for the phone's own light/dark setting. */
function stubSystem(initial: 'light' | 'dark') {
  let light = initial === 'light';
  const listeners = new Set<() => void>();
  vi.stubGlobal('matchMedia', () => ({
    get matches() {
      return light;
    },
    addEventListener: (_: string, listener: () => void) => listeners.add(listener),
    removeEventListener: (_: string, listener: () => void) => listeners.delete(listener),
  }));
  return {
    change(to: 'light' | 'dark') {
      light = to === 'light';
      listeners.forEach((listener) => listener());
    },
  };
}

const shown = () => document.documentElement.dataset['scheme'];

describe('Appearance', () => {
  beforeEach(() => {
    localStorage.clear();
    delete document.documentElement.dataset['scheme'];
  });

  afterEach(() => vi.unstubAllGlobals());

  it('follows the system until told otherwise', () => {
    const system = stubSystem('light');
    const appearance = TestBed.inject(Appearance);
    TestBed.tick();
    expect(appearance.choice()).toBe('system');
    expect(shown()).toBe('light');

    system.change('dark');
    TestBed.tick();
    expect(shown()).toBe('dark');
  });

  it('overrides the system and stops following it', () => {
    const system = stubSystem('dark');
    const appearance = TestBed.inject(Appearance);

    appearance.set('light');
    TestBed.tick();
    expect(shown()).toBe('light');
    expect(localStorage.getItem(APPEARANCE_KEY)).toBe('light');

    system.change('light');
    system.change('dark');
    TestBed.tick();
    expect(shown()).toBe('light');
  });

  it('goes back to the system and forgets the override', () => {
    stubSystem('dark');
    const appearance = TestBed.inject(Appearance);
    appearance.set('light');

    appearance.set('system');
    TestBed.tick();
    expect(shown()).toBe('dark');
    expect(localStorage.getItem(APPEARANCE_KEY)).toBeNull();
  });

  it('toggles to the opposite of what is showing, also from the system setting', () => {
    stubSystem('light');
    const appearance = TestBed.inject(Appearance);

    expect(appearance.toggle()).toBe('dark');
    expect(appearance.choice()).toBe('dark');
    expect(appearance.toggle()).toBe('light');
    expect(appearance.choice()).toBe('light');
  });

  it('restores a saved choice', () => {
    stubSystem('dark');
    localStorage.setItem(APPEARANCE_KEY, 'light');
    const appearance = TestBed.inject(Appearance);
    TestBed.tick();
    expect(appearance.choice()).toBe('light');
    expect(shown()).toBe('light');
  });

  it('falls back to the system when the saved value is unreadable', () => {
    stubSystem('dark');
    localStorage.setItem(APPEARANCE_KEY, 'sepia');
    expect(TestBed.inject(Appearance).choice()).toBe('system');
  });

  it('takes a change made in another open copy of the app', () => {
    stubSystem('dark');
    const appearance = TestBed.inject(Appearance);
    window.dispatchEvent(new StorageEvent('storage', { key: APPEARANCE_KEY, newValue: 'light' }));
    TestBed.tick();
    expect(appearance.choice()).toBe('light');
    expect(shown()).toBe('light');
  });
});
