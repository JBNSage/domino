import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';

import { copy } from '../copy';
import { GameStore } from '../game/game.store';
import { SharingStore } from '../game/sharing.store';
import { Update } from '../platform/update';

/**
 * The board's one transient bar, on an inverse surface so it reads as a layer
 * in both appearances. It first says when a shared mesa was taken away, until
 * dismissed; then it offers to undo; with nothing to undo and no round under
 * way, it can say that a new version is waiting.
 */
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
    @if (sharing.notice(); as notice) {
      <div class="bar lean">
        <span class="message">{{ notice }}</span>
        <button type="button" class="action" (click)="sharing.dismissNotice()">
          {{ copy.tables.lostDismiss }}
        </button>
      </div>
    } @else if (offer(); as undo) {
      <div class="bar lean">
        <span class="message">{{ undo.message }}</span>
        <button
          type="button"
          class="action"
          [attr.aria-label]="copy.undo.action + ': ' + undo.message"
          (click)="restore()"
        >
          {{ copy.undo.action }}
        </button>
      </div>
    } @else if (offerUpdate()) {
      <div class="bar lean">
        <span class="message">{{ copy.update.ready }}</span>
        <button type="button" class="action" (click)="update.apply()">
          {{ copy.update.action }}
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
      flex-wrap: wrap;
      align-items: center;
      justify-content: flex-end;
      min-height: calc(var(--min-target) + 4px);
      padding: var(--s-xs) var(--s-sm) var(--s-xs) var(--s-xl);
      color: var(--c-ground);
    }

    /* With large text the action moves under the message instead of squeezing it. */
    .message {
      flex: 1 1 9rem;
      min-width: 0;
      line-height: 1.25;
      overflow-wrap: anywhere;
    }

    .action {
      flex: none;
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

    /* Drawn inside the button, so the whole ring sits on the bar's own fill. */
    .action:focus-visible {
      outline-offset: -5px;
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
  protected readonly update = inject(Update);
  protected readonly sharing = inject(SharingStore);

  /**
   * On the screens above the board: only entries removed from the history or
   * the mesas are offered back, and the update notice is left to the board.
   */
  readonly historyOnly = input(false);

  /** Undo is done; carries the hand that came back, or null to return to the board. */
  readonly restored = output<string | null>();

  // Reloading mid-round would interrupt the game, so the notice waits for a clean board.
  protected readonly offerUpdate = computed(
    () => !this.historyOnly() && this.update.ready() && this.store.state().rows.length === 0,
  );

  protected readonly offer = computed(() => {
    const undo = this.store.undo();
    return this.historyOnly() && !this.store.screenUndo() ? null : undo;
  });

  protected restore(): void {
    this.restored.emit(this.store.restore());
  }
}
