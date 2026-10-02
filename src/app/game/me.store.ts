import { DestroyRef, Injectable, effect, inject, signal } from '@angular/core';

import { copy } from '../copy';
import { randomName } from './me';
import { cleanLabel } from './state';
import { ME_KEY, loadProfile, readProfile, saveProfile } from './storage';

/**
 * The name this phone's person goes by. It is made up on first launch and can
 * be changed at any time; at a shared mesa it is how the others see them.
 */
@Injectable({ providedIn: 'root' })
export class MeStore {
  readonly name = signal(loadProfile()?.name ?? randomName(copy.me.names));

  constructor() {
    effect(() => saveProfile({ name: this.name() }));
    this.followOtherTabs();
  }

  rename(name: string): void {
    const clean = cleanLabel(name, '');
    if (clean !== '') this.name.set(clean);
  }

  private followOtherTabs(): void {
    if (typeof window === 'undefined') return;

    const onStorage = (event: StorageEvent) => {
      if (event.storageArea !== localStorage || event.key !== ME_KEY) return;
      const profile = readProfile(event.newValue);
      if (profile !== null && profile.name !== this.name()) this.name.set(profile.name);
    };

    window.addEventListener('storage', onStorage);
    inject(DestroyRef).onDestroy(() => window.removeEventListener('storage', onStorage));
  }
}
