import { DestroyRef, Injectable, computed, effect, inject, signal } from '@angular/core';

export type AppearanceChoice = 'system' | 'light' | 'dark';
export type Scheme = 'light' | 'dark';

// index.html reads the same key before the app starts, so the first paint is already right.
export const APPEARANCE_KEY = 'domino/appearance/v1';

const THEME_COLOR: Record<Scheme, string> = { dark: '#0E1114', light: '#F1F2F4' };

export function readChoice(raw: string | null): AppearanceChoice {
  return raw === 'light' || raw === 'dark' ? raw : 'system';
}

function savedChoice(): AppearanceChoice {
  try {
    return readChoice(localStorage.getItem(APPEARANCE_KEY));
  } catch {
    return 'system';
  }
}

/**
 * Light, dark, or whatever the phone says. The answer is written on the root
 * element as `data-scheme`, which is the only thing the styles look at.
 */
@Injectable({ providedIn: 'root' })
export class Appearance {
  readonly choice = signal<AppearanceChoice>(savedChoice());

  private readonly system = signal<Scheme>('dark');

  /** What is showing now. */
  readonly scheme = computed<Scheme>(() => {
    const choice = this.choice();
    return choice === 'system' ? this.system() : choice;
  });

  constructor() {
    const destroyRef = inject(DestroyRef);

    if (typeof matchMedia === 'function') {
      const light = matchMedia('(prefers-color-scheme: light)');
      const follow = () => this.system.set(light.matches ? 'light' : 'dark');
      follow();
      light.addEventListener('change', follow);
      destroyRef.onDestroy(() => light.removeEventListener('change', follow));
    }

    // The installed app and a browser tab can both be open; they change together.
    const onStorage = (event: StorageEvent) => {
      if (event.key === APPEARANCE_KEY || event.key === null) {
        this.choice.set(readChoice(event.newValue));
      }
    };
    window.addEventListener('storage', onStorage);
    destroyRef.onDestroy(() => window.removeEventListener('storage', onStorage));

    effect(() => {
      const scheme = this.scheme();
      document.documentElement.dataset['scheme'] = scheme;
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute('content', THEME_COLOR[scheme]);
    });
  }

  set(choice: AppearanceChoice): void {
    this.choice.set(choice);
    try {
      if (choice === 'system') localStorage.removeItem(APPEARANCE_KEY);
      else localStorage.setItem(APPEARANCE_KEY, choice);
    } catch {
      // Without storage the choice lasts until the app is closed.
    }
  }

  /** Switches to the opposite of what is showing, whatever decided it. */
  toggle(): Scheme {
    const next: Scheme = this.scheme() === 'dark' ? 'light' : 'dark';
    this.set(next);
    return next;
  }
}
