import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { copy } from '../copy';
import { Install } from '../platform/install';

/**
 * The suggestion to install the app, where the browser allows it and the reader
 * has not said "Ahora no". It renders nothing otherwise, so the place that
 * holds it sets the spacing around it.
 */
@Component({
  selector: 'app-install-hint',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.shown]': 'install.hint() !== null' },
  template: `
    @if (install.hint(); as hint) {
      <p class="text">
        {{ hint === 'ios' ? copy.install.ios : copy.install.prompt }}
      </p>
      <div class="actions">
        @if (hint === 'prompt') {
          <button type="button" class="slab slab--compact lean" (click)="install.install()">
            <span class="slab__label">{{ copy.install.action }}</span>
          </button>
        }
        <button type="button" class="later" (click)="install.dismiss()">
          {{ copy.install.dismiss }}
        </button>
      </div>
    }
  `,
  styles: `
    :host(.shown) {
      display: flex;
      flex-direction: column;
      gap: var(--s-sm);
    }

    .text {
      margin: 0;
      max-width: 34ch;
      color: var(--c-muted);
    }

    .actions {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--s-sm) var(--s-lg);
    }

    .later {
      min-height: var(--min-target);
      padding: 0 var(--s-sm);
      border: 0;
      background: none;
      color: var(--c-text);
      font: italic 800 var(--t-body) / 1.2 var(--font);
      text-transform: uppercase;
      text-decoration: underline;
      text-underline-offset: 0.2em;
    }

    .later:active {
      opacity: var(--pressed);
    }
  `,
})
export class InstallHint {
  protected readonly copy = copy;
  protected readonly install = inject(Install);
}
