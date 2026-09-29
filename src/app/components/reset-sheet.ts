import { ChangeDetectionStrategy, Component, inject, output, viewChild } from '@angular/core';

import { copy } from '../copy';
import { FitText } from '../directives/fit-text';
import { GameStore } from '../game/game.store';
import { Sheet } from './sheet';

/**
 * Asks how much to clear. Each answer says what it keeps, and both can be
 * undone. A tournament is ended from its table, so here it only clears hands.
 */
@Component({
  selector: 'app-reset-sheet',
  imports: [Sheet, FitText],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-sheet accent="var(--c-danger)" labelledBy="reset-sheet-title">
      <h2 class="title" id="reset-sheet-title">{{ copy.reset.title }}</h2>

      <div class="choice">
        <button
          type="button"
          class="slab lean"
          aria-describedby="reset-sheet-hands"
          (click)="hands()"
        >
          <span class="slab__label" [appFitText]="copy.reset.hands">{{ copy.reset.hands }}</span>
        </button>
        <p class="help" id="reset-sheet-hands">{{ copy.reset.handsHelp }}</p>
      </div>

      @if (store.tournament() === null) {
        <div class="choice">
          <button
            type="button"
            class="slab slab--danger lean"
            aria-describedby="reset-sheet-all"
            (click)="all()"
          >
            <span class="slab__label" [appFitText]="copy.reset.all">{{ copy.reset.all }}</span>
          </button>
          <p class="help" id="reset-sheet-all">{{ copy.reset.allHelp }}</p>
        </div>
      }

      <p class="note">
        {{ store.tournament() === null ? copy.reset.undoNote : copy.reset.undoNoteOne }}
      </p>
      @if (store.tournament() !== null) {
        <div class="choice">
          <p class="help">{{ copy.reset.tournament }}</p>
          <button type="button" class="slab slab--compact lean" (click)="openTable()">
            <span class="slab__label" [appFitText]="copy.reset.openTable">{{
              copy.reset.openTable
            }}</span>
          </button>
        </div>
      }

      <button type="button" class="slab slab--compact lean cancel" (click)="sheet().close()">
        <span class="slab__label" [appFitText]="copy.reset.cancel">{{ copy.reset.cancel }}</span>
      </button>
    </app-sheet>
  `,
  styles: `
    .title {
      margin: 0;
      font: italic 800 var(--t-title) / 1.15 var(--font);
      text-transform: uppercase;
      text-wrap: balance;
    }

    .choice {
      display: flex;
      flex-direction: column;
      gap: var(--s-sm);
    }

    .slab {
      margin: 0 var(--s-sm);
    }

    .help,
    .note {
      margin: 0;
      max-width: 65ch;
      color: var(--c-muted);
      line-height: 1.35;
    }

    .help {
      padding: 0 var(--s-sm);
    }

    .note {
      color: var(--c-text);
    }
  `,
})
export class ResetSheet {
  protected readonly copy = copy;

  /** Asks for the table of the tournament, where it can be ended. */
  readonly table = output<void>();

  protected readonly store = inject(GameStore);
  protected readonly sheet = viewChild.required(Sheet);

  open(): void {
    this.sheet().open();
  }

  protected openTable(): void {
    this.sheet().close();
    this.table.emit();
  }

  protected hands(): void {
    this.sheet().close();
    this.store.clearRows();
  }

  protected all(): void {
    this.sheet().close();
    this.store.resetAll();
  }
}
