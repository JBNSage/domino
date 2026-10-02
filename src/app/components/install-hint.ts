import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';

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
  host: { '[class.shown]': 'install.hint() !== null', '[class.compact]': 'compact()' },
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
        @if (compact()) {
          <button
            type="button"
            class="close"
            [attr.aria-label]="copy.install.dismiss"
            (click)="install.dismiss()"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        } @else {
          <button type="button" class="later" (click)="install.dismiss()">
            {{ copy.install.dismiss }}
          </button>
        }
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

    /* Its words line up with the sentence above; the target keeps its padding. */
    .later {
      min-height: var(--min-target);
      margin-inline-start: calc(var(--s-sm) * -1);
      padding: 0 var(--s-sm);
      border: 0;
      background: none;
      color: var(--c-text);
      font: italic 800 var(--t-body) / 1.2 var(--font);
      text-transform: uppercase;
      text-decoration: underline;
      text-underline-offset: 0.2em;
    }

    .later:active,
    .close:active {
      opacity: var(--pressed);
    }

    /* One line beside its actions, where the hint must not take the room of what it sits with. */
    :host(.shown.compact) {
      flex-direction: row;
      align-items: center;
      gap: var(--s-sm);
    }

    :host(.compact) .text {
      flex: 1;
      min-width: 0;
      max-width: none;
      font: italic 600 var(--t-label) / 1.3 var(--font);
    }

    :host(.compact) .actions {
      flex: none;
      flex-wrap: nowrap;
      gap: var(--s-xs);
    }

    .close {
      flex: none;
      display: grid;
      place-items: center;
      width: var(--min-target);
      height: var(--min-target);
      padding: 0;
      border: 0;
      background: none;
    }

    .close svg {
      width: 20px;
      height: 20px;
      fill: none;
      stroke: var(--c-muted);
      stroke-width: 2;
      stroke-linecap: round;
    }
  `,
})
export class InstallHint {
  protected readonly copy = copy;
  protected readonly install = inject(Install);

  /** One line with its actions at the right, and a cross in place of "Ahora no". */
  readonly compact = input(false);
}
