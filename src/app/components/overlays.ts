import { Injectable, computed, signal } from '@angular/core';

/** Counts open sheets, so the winner screen waits until the task in hand is closed. */
@Injectable({ providedIn: 'root' })
export class Overlays {
  private readonly open = signal(0);
  readonly any = computed(() => this.open() > 0);

  opened(): void {
    this.open.update((count) => count + 1);
  }

  closed(): void {
    this.open.update((count) => Math.max(0, count - 1));
  }
}
