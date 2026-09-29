import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';

import { copy } from '../copy';
import { FitText } from '../directives/fit-text';
import { GameStore } from '../game/game.store';
import { TeamId } from '../game/state';
import { Overlays } from './overlays';
import { UndoSnackbar } from './undo-snackbar';

let nextId = 0;

/**
 * A full screen above the board, for what takes more than a moment: the
 * history, a tournament's table. Escape and system Back return to where the
 * reader came from. A `locked` screen has no way back: it shows a step that
 * has to be answered.
 */
@Component({
  selector: 'app-screen',
  imports: [FitText, UndoSnackbar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.with-undo]': 'store.undo()?.reversal?.kind === "history"' },
  template: `
    <dialog
      #dialog
      class="screen"
      [class]="tone() ? 'screen--' + tone() : ''"
      [attr.aria-labelledby]="id"
      (cancel)="onCancel($event)"
      (close)="onClose()"
    >
      @if (tone()) {
        <div class="flood"></div>
      }
      <div class="column">
        <header class="bar" [class.bar--locked]="locked()">
          @if (!locked()) {
            <button
              type="button"
              class="back"
              [attr.aria-label]="copy.common.back"
              (click)="close()"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M14 5l-6 7 6 7" />
              </svg>
            </button>
          }
          <h2 class="title" [id]="id" [appFitText]="heading()">{{ heading() }}</h2>
        </header>

        <div class="body">
          <ng-content />
        </div>

        <div class="undo">
          <app-undo-snackbar [historyOnly]="true" />
        </div>
        <div class="foot">
          <ng-content select="[screenFooter]" />
        </div>
      </div>
      <!-- The board's own live region is out of reach while a dialog is open. -->
      <p class="sr-only" role="status">{{ store.announcement() }}</p>
    </dialog>
  `,
  styles: `
    .screen {
      position: fixed;
      inset: 0;
      width: 100%;
      height: 100%;
      max-width: none;
      max-height: none;
      margin: 0;
      padding: 0;
      border: 0;
      overflow: hidden;
      background: var(--c-ground);
      color: var(--c-text);
    }

    .screen::backdrop {
      background: var(--c-ground);
    }

    /* A screen flooded with a team's colour carries ink, like the winner's. */
    .screen--a {
      --team: var(--c-team-a);
    }

    .screen--b {
      --team: var(--c-team-b);
    }

    .screen--a,
    .screen--b {
      --focus: var(--c-ink);

      color: var(--c-ink);
    }

    .flood {
      position: absolute;
      inset: 0 -60%;
      background: var(--team);
      transform: skewX(-12deg);
    }

    .column {
      position: relative;
      height: 100%;
      max-width: var(--column);
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      padding-top: env(safe-area-inset-top);
    }

    .bar {
      flex: none;
      display: flex;
      align-items: center;
      gap: var(--s-xs);
      padding: var(--s-md) var(--s-xl) var(--s-md) var(--s-sm);
    }

    .bar--locked {
      padding-left: var(--s-xl);
      padding-top: var(--s-xl);
    }

    .back {
      flex: none;
      display: grid;
      place-items: center;
      width: var(--min-target);
      height: var(--min-target);
      padding: 0;
      border: 0;
      background: none;
    }

    .back svg {
      width: 24px;
      height: 24px;
      fill: none;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .back:active {
      opacity: var(--pressed);
    }

    .title {
      flex: 1;
      min-width: 0;
      margin: 0;
      font: italic 800 var(--t-title) / 1.15 var(--font);
      text-transform: uppercase;
    }

    .body {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
      gap: var(--s-xl);
      padding: var(--s-sm) var(--s-lg) var(--s-xl);
      overflow-y: auto;
      overscroll-behavior: contain;
      scrollbar-width: thin;
      scrollbar-color: var(--c-raised) transparent;
    }

    .screen--a .body,
    .screen--b .body {
      scrollbar-color: var(--c-ink) transparent;
    }

    :host(.with-undo) .body {
      padding-bottom: calc(var(--s-xl) + var(--min-target) + var(--s-lg));
    }

    /* The undo bar floats over the end of the body, above the pinned actions. */
    .undo {
      position: relative;
      flex: none;
      height: 0;
    }

    .foot {
      flex: none;
      display: flex;
      flex-direction: column;
      gap: var(--s-md);
      padding: 0 calc(var(--s-xl) + var(--s-sm));
    }

    .foot:not(:empty) {
      padding-top: var(--s-md);
      padding-bottom: calc(max(env(safe-area-inset-bottom), var(--s-md)) + var(--s-xs));
      border-top: 1px solid var(--c-line);
    }

    .screen--a .foot,
    .screen--b .foot {
      border-top-color: var(--c-ink);
    }

    @media (max-height: 36em) {
      .bar {
        padding-block: var(--s-xs);
      }

      .bar--locked {
        padding-top: var(--s-md);
      }

      .body {
        gap: var(--s-lg);
      }

      .foot:not(:empty) {
        padding-top: var(--s-sm);
        padding-bottom: max(env(safe-area-inset-bottom), var(--s-sm));
      }
    }

    @media (max-height: 36em) and (min-width: 30em) {
      .foot {
        flex-direction: row;
        align-items: center;
      }

      .foot > * {
        flex: 1 1 0;
        min-width: 0;
        padding-inline: var(--s-md);
      }
    }

    @media (prefers-reduced-motion: no-preference) {
      .screen {
        transition:
          transform 220ms var(--ease-out),
          opacity 220ms ease-out,
          overlay 220ms allow-discrete,
          display 220ms allow-discrete;
        transform: translateX(24%);
        opacity: 0;
      }

      .screen[open] {
        transform: none;
        opacity: 1;
      }

      @starting-style {
        .screen[open] {
          transform: translateX(24%);
          opacity: 0;
        }
      }

      .flood {
        animation: flood 220ms var(--ease-out) backwards;
      }

      .screen--a .flood {
        --from: -160vw;
      }

      .screen--b .flood {
        --from: 160vw;
      }

      @keyframes flood {
        from {
          transform: translateX(var(--from)) skewX(-12deg);
        }
      }
    }
  `,
})
export class Screen {
  protected readonly copy = copy;
  protected readonly store = inject(GameStore);

  readonly heading = input.required<string>();
  /** No way back: the screen stays until its own action is taken. */
  readonly locked = input(false);
  /** Floods the screen with the colour of one side of the board. */
  readonly tone = input<TeamId | null>(null);
  readonly closed = output<void>();

  protected readonly id = `screen-${nextId++}`;

  private readonly overlays = inject(Overlays);
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  get isOpen(): boolean {
    return this.dialog().nativeElement.open;
  }

  open(): void {
    const dialog = this.dialog().nativeElement;
    if (dialog.open) return;
    dialog.showModal();
    this.overlays.opened();
  }

  close(): void {
    const dialog = this.dialog().nativeElement;
    if (dialog.open) dialog.close();
  }

  protected onCancel(event: Event): void {
    if (this.locked()) event.preventDefault();
  }

  protected onClose(): void {
    this.overlays.closed();
    this.closed.emit();
  }
}
