import { ChangeDetectionStrategy, Component, inject, viewChild } from '@angular/core';

import { copy } from '../copy';
import { FitText } from '../directives/fit-text';
import { GameStore } from '../game/game.store';
import { Sheet } from './sheet';

/** Asks how much to clear. Both answers can be undone from the board. */
@Component({
  selector: 'app-reset-sheet',
  imports: [Sheet, FitText],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-sheet accent="var(--c-danger)" labelledBy="reset-sheet-title">
      <h2 class="title" id="reset-sheet-title">{{ copy.reset.title }}</h2>
      <p class="body">{{ copy.reset.body }}</p>
      <div class="actions">
        <button type="button" class="slab lean" (click)="hands()">
          <span class="slab__label" [appFitText]="copy.reset.hands">{{ copy.reset.hands }}</span>
        </button>
        <button type="button" class="slab slab--danger lean" (click)="all()">
          <span class="slab__label" [appFitText]="copy.reset.all">{{ copy.reset.all }}</span>
        </button>
        <button type="button" class="slab slab--compact lean" (click)="sheet().close()">
          <span class="slab__label" [appFitText]="copy.reset.cancel">{{ copy.reset.cancel }}</span>
        </button>
      </div>
    </app-sheet>
  `,
  styles: `
    .title {
      margin: 0;
      font: italic 800 var(--t-title) / 1.15 var(--font);
      text-transform: uppercase;
      text-wrap: balance;
    }

    .body {
      margin: 0;
      max-width: 65ch;
      color: var(--c-muted);
      white-space: pre-line;
    }

    .actions {
      display: flex;
      flex-direction: column;
      gap: var(--s-md);
      padding: 0 var(--s-sm);
    }
  `,
})
export class ResetSheet {
  protected readonly copy = copy;

  private readonly store = inject(GameStore);
  protected readonly sheet = viewChild.required(Sheet);

  open(): void {
    this.sheet().open();
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
