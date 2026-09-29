import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { copy } from '../copy';
import { GameStore } from '../game/game.store';

/** Inverse surface, so it reads as a transient layer in both appearances. */
@Component({
  selector: 'app-undo-snackbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(pointerenter)': 'store.holdUndo()',
    '(pointerleave)': 'store.releaseUndo()',
    '(focusin)': 'store.holdUndo()',
    '(focusout)': 'store.releaseUndo()',
  },
  template: `
    @if (store.undo(); as undo) {
      <div class="bar lean">
        <span class="message">{{ undo.message }}</span>
        <button
          type="button"
          class="action"
          [attr.aria-label]="copy.undo.action + ': ' + undo.message"
          (click)="store.restore()"
        >
          {{ copy.undo.action }}
        </button>
      </div>
    }
  `,
  styles: `
    :host {
      position: absolute;
      left: var(--s-lg);
      right: var(--s-lg);
      bottom: var(--s-sm);
    }

    .bar {
      --fill: var(--c-text);
      --focus: var(--c-ground);

      display: flex;
      align-items: center;
      min-height: calc(var(--min-target) + 4px);
      padding: 0 var(--s-sm) 0 var(--s-xl);
      color: var(--c-ground);
    }

    .message {
      flex: 1;
      min-width: 0;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      overflow: hidden;
      line-height: 1.25;
    }

    .action {
      min-height: var(--min-target);
      padding: 0 var(--s-lg);
      border: 0;
      background: none;
      color: inherit;
      font: italic 800 var(--t-body) / 1.2 var(--font);
      text-transform: uppercase;
      text-decoration: underline;
      text-underline-offset: 0.2em;
    }

    .action:active {
      opacity: var(--pressed);
    }

    @media (prefers-reduced-motion: no-preference) {
      .bar {
        animation: rise 200ms var(--ease-out) backwards;
      }

      @keyframes rise {
        from {
          transform: translateY(12px);
          opacity: 0;
        }
      }
    }
  `,
})
export class UndoSnackbar {
  protected readonly copy = copy;
  protected readonly store = inject(GameStore);
}
