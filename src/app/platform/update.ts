import { Injectable, inject, signal } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';

/** Tells the board when a newer version has been downloaded and is waiting. */
@Injectable({ providedIn: 'root' })
export class Update {
  readonly ready = signal(false);

  // Absent in tests and wherever the service worker is not set up.
  private readonly updates = inject(SwUpdate, { optional: true });

  constructor() {
    const updates = this.updates;
    if (!updates?.isEnabled) return;
    updates.versionUpdates.subscribe((event) => {
      if (event.type === 'VERSION_READY') this.ready.set(true);
    });
    // The cached version can no longer be served whole; only a reload repairs it.
    updates.unrecoverable.subscribe(() => document.location.reload());
  }

  async apply(): Promise<void> {
    await this.updates?.activateUpdate().catch(() => false);
    document.location.reload();
  }
}
