import { TestBed } from '@angular/core/testing';

import { copy } from '../copy';
import { parseProfile, randomName } from './me';
import { MeStore } from './me.store';
import { ME_KEY } from './storage';

describe('randomName', () => {
  it('picks from the list, at both ends', () => {
    expect(randomName(['Uno', 'Dos', 'Tres'], () => 0)).toBe('Uno');
    expect(randomName(['Uno', 'Dos', 'Tres'], () => 0.999)).toBe('Tres');
  });

  it('only offers names that fit a name field', () => {
    for (const name of copy.me.names) expect(Array.from(name).length).toBeLessThanOrEqual(16);
  });
});

describe('parseProfile', () => {
  it('keeps a tidy name and refuses anything else', () => {
    expect(parseProfile({ name: '  Ana  María ' })).toEqual({ name: 'Ana María' });
    expect(parseProfile({ name: '   ' })).toBeNull();
    expect(parseProfile({ name: 3 })).toBeNull();
    expect(parseProfile(null)).toBeNull();
  });
});

describe('MeStore', () => {
  beforeEach(() => localStorage.clear());

  it('makes up a name on first launch and keeps it', () => {
    const store = TestBed.inject(MeStore);
    expect(copy.me.names).toContain(store.name());
    TestBed.tick();
    expect(JSON.parse(localStorage.getItem(ME_KEY) ?? '{}')).toEqual({ name: store.name() });
  });

  it('takes a new name, tidied, and ignores an empty one', () => {
    const store = TestBed.inject(MeStore);
    store.rename('  Juan  ');
    expect(store.name()).toBe('Juan');
    store.rename('   ');
    expect(store.name()).toBe('Juan');
  });

  it('keeps the name saved before', () => {
    localStorage.setItem(ME_KEY, JSON.stringify({ name: 'Marta' }));
    expect(TestBed.inject(MeStore).name()).toBe('Marta');
  });
});
