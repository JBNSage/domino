import { Injectable, computed, signal } from '@angular/core';

const DISMISSED_KEY = 'domino/install-hint/v1';

/** Chrome's install event, which is not in the DOM typings yet. */
type InstallEvent = Event & { prompt: () => Promise<unknown> };

/** Running as the installed app, not in a browser tab. */
export function isInstalled(): boolean {
  const standalone =
    typeof matchMedia === 'function' && matchMedia('(display-mode: standalone)').matches;
  return standalone || (navigator as { standalone?: boolean }).standalone === true;
}

function isIos(): boolean {
  const agent = navigator.userAgent;
  // iPadOS reports itself as a Mac, but only it has a touch screen.
  return (
    /iPhone|iPad|iPod/.test(agent) || (/Macintosh/.test(agent) && navigator.maxTouchPoints > 1)
  );
}

function wasDismissed(): boolean {
  try {
    return localStorage.getItem(DISMISSED_KEY) !== null;
  } catch {
    return false;
  }
}

/** Knows whether to suggest installing, and how this browser does it. */
@Injectable({ providedIn: 'root' })
export class Install {
  private readonly event = signal<InstallEvent | null>(null);
  private readonly hidden = signal(isInstalled() || wasDismissed());

  /** 'prompt' when the browser can install on request, 'ios' when it takes the share menu. */
  readonly hint = computed<'prompt' | 'ios' | null>(() => {
    if (this.hidden()) return null;
    if (this.event() !== null) return 'prompt';
    return isIos() ? 'ios' : null;
  });

  constructor() {
    if (typeof window === 'undefined') return;
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      this.event.set(event as InstallEvent);
    });
    window.addEventListener('appinstalled', () => this.hidden.set(true));
  }

  async install(): Promise<void> {
    const event = this.event();
    if (event === null) return;
    // The browser allows one prompt per event.
    this.event.set(null);
    await event.prompt().catch(() => {});
  }

  dismiss(): void {
    this.hidden.set(true);
    try {
      localStorage.setItem(DISMISSED_KEY, '1');
    } catch {
      // Without storage the hint comes back next time, which is harmless.
    }
  }
}
