import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  effect,
  inject,
  output,
  signal,
} from '@angular/core';

import { copy } from '../copy';
import { FitText } from '../directives/fit-text';
import { GameStore } from '../game/game.store';
import { Row } from '../game/state';
import { prefersReducedMotion } from '../platform/motion';
import { InstallHint } from './install-hint';
import { Slashes } from './slashes';

/** How close to the end still counts as "reading the newest hands". */
const NEAR_END = 80;

@Component({
  selector: 'app-score-list',
  imports: [Slashes, FitText, NgTemplateOutlet, InstallHint],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.with-undo]': 'store.undo() !== null' },
  template: `
    <ng-template #cells let-row let-index="index" let-last="last">
      @for (team of teams; track team) {
        @if (team === 'b') {
          <span class="hand numerals" [class.hand--latest]="last">{{ hand(index) }}</span>
        }
        <span class="cell">
          @if (row.team === team) {
            <span class="chip lean numerals" [class]="'chip--' + team">{{ row.points }}</span>
          } @else {
            <span class="zero numerals">0</span>
          }
        </span>
      }
    </ng-template>

    @if (rows().length === 0) {
      <div class="empty">
        <app-slashes [size]="22" />
        <h2 class="empty-title">{{ copy.list.emptyTitle }}</h2>
        <p class="empty-body">
          {{ store.canScore() ? copy.list.emptyBody : copy.list.watchingBody }}
        </p>

        <app-install-hint class="install" />
      </div>
    } @else {
      <ol class="rows">
        @for (row of rows(); track row.id; let index = $index, last = $last) {
          <li [class]="isNew(row) ? 'enter enter--' + row.team : ''" [attr.data-row]="row.id">
            @if (selected() === row.id) {
              <!-- The hand stays in view, so it is clear what is about to change. -->
              <div
                class="selected"
                role="group"
                [attr.aria-label]="label(row, index)"
                (keydown.escape)="keep(row)"
              >
                <div class="row row--selected lean">
                  <ng-container
                    [ngTemplateOutlet]="cells"
                    [ngTemplateOutletContext]="{ $implicit: row, index: index, last: true }"
                  />
                </div>
                <div class="options">
                  <button type="button" class="slab slab--compact lean keep" (click)="keep(row)">
                    <span class="slab__label" [appFitText]="copy.list.keep">{{
                      copy.list.keep
                    }}</span>
                  </button>
                  <button
                    type="button"
                    class="slab slab--compact slab--filled lean edit"
                    [attr.aria-label]="copy.list.editA11y(index + 1)"
                    (click)="edit.emit({ row: row, index: index })"
                  >
                    <span class="slab__label" [appFitText]="copy.list.edit">{{
                      copy.list.edit
                    }}</span>
                  </button>
                  <button
                    type="button"
                    class="slab slab--compact slab--danger lean"
                    [attr.aria-label]="copy.list.deleteA11y(index + 1)"
                    (click)="remove(row, index)"
                  >
                    <span class="slab__label" [appFitText]="copy.list.delete">{{
                      copy.list.delete
                    }}</span>
                  </button>
                </div>
              </div>
            } @else {
              <button
                type="button"
                class="row lean"
                [class.row--latest]="last"
                [attr.aria-label]="
                  store.canScore()
                    ? label(row, index) + '. ' + copy.list.rowHint
                    : label(row, index)
                "
                [disabled]="!store.canScore()"
                (click)="select(row)"
              >
                <ng-container
                  [ngTemplateOutlet]="cells"
                  [ngTemplateOutletContext]="{ $implicit: row, index: index, last: last }"
                />
              </button>
            }
          </li>
        }
      </ol>
    }
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
      overflow-y: auto;
      overscroll-behavior: contain;
      scrollbar-width: thin;
      scrollbar-color: var(--c-raised) transparent;
    }

    .empty {
      min-height: 100%;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: center;
      gap: var(--s-sm);
      padding: var(--s-lg) var(--s-xxl);
    }

    .empty-title {
      margin: var(--s-sm) 0 0;
      font: italic 800 var(--t-title) / 1.15 var(--font);
      text-transform: uppercase;
    }

    .empty-body {
      margin: 0;
      max-width: 34ch;
      color: var(--c-muted);
    }

    /* It renders nothing once installed or declined, so the rule comes with it. */
    .install.shown {
      margin-top: var(--s-xl);
      padding-top: var(--s-lg);
      border-top: 1px solid var(--c-line);
    }

    .rows {
      display: flex;
      flex-direction: column;
      gap: var(--s-sm);
      margin: 0;
      padding: var(--s-md) var(--s-lg);
      list-style: none;
    }

    :host(.with-undo) .rows {
      padding-bottom: calc(var(--s-md) + var(--undo-height));
    }

    .row {
      --fill: var(--c-surface);

      width: 100%;
      min-height: calc(var(--min-target) + 4px);
      display: flex;
      align-items: center;
      padding: 0;
      border: 0;
      background: none;
      color: inherit;
    }

    .row--latest,
    .row--selected {
      --fill: var(--c-raised);
    }

    .row--selected {
      --edge: var(--c-text);
    }

    button.row:not(:disabled):active::before {
      opacity: var(--pressed);
    }

    @media (hover: hover) {
      button.row:not(:disabled):hover::before {
        filter: brightness(1.12);
      }
    }

    .selected {
      display: flex;
      flex-direction: column;
      gap: var(--s-sm);
      padding-bottom: var(--s-sm);
    }

    .options {
      display: flex;
      gap: var(--s-sm);
    }

    .options .slab {
      --lean-inset: 5px;

      flex: 1 1 0;
      padding: 0 var(--s-md);
    }

    .edit {
      --fill: var(--c-text);
      --label: var(--c-ground);
    }

    .hand {
      flex: none;
      width: 44px;
      text-align: center;
      color: var(--c-muted);
      font: italic 600 var(--t-label) / 1.2 var(--font);
    }

    .hand--latest {
      color: var(--c-text);
      font-weight: 800;
    }

    .cell {
      flex: 1;
      display: grid;
      place-items: center;
    }

    .chip {
      --edge: var(--c-team-edge);
      --lean-inset: 3px;

      min-width: 64px;
      padding: var(--s-xs) var(--s-md);
      color: var(--c-ink);
      font: italic 800 var(--t-button) / 1.3 var(--font);
      text-align: center;
    }

    .chip--a {
      --fill: var(--c-team-a);
    }

    .chip--b {
      --fill: var(--c-team-b);
    }

    .zero {
      color: var(--c-muted);
      font: italic 600 var(--t-button) / 1.3 var(--font);
    }

    @media (prefers-reduced-motion: no-preference) {
      .enter {
        animation: enter 200ms var(--ease-out) backwards;
      }

      .enter--a {
        --from: -56px;
      }

      .enter--b {
        --from: 56px;
      }

      @keyframes enter {
        from {
          transform: translateX(var(--from));
        }
      }
    }
  `,
})
export class ScoreList {
  protected readonly copy = copy;
  protected readonly teams = ['a', 'b'] as const;
  protected readonly store = inject(GameStore);

  readonly edit = output<{ row: Row; index: number }>();

  protected readonly rows = computed(() => this.store.state().rows);
  protected readonly selected = signal<string | null>(null);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  // Hands already on the board at launch arrive without moving.
  private readonly present = new Set(this.rows().map((row) => row.id));
  private newest: string | null = null;
  private offering = false;

  constructor() {
    // A new hand, or the list changing under a selection, drops the selection.
    effect(() => {
      this.rows();
      this.selected.set(null);
    });

    afterRenderEffect(() => {
      const rows = this.rows();
      const offering = this.store.undo() !== null;
      const newest = rows.length > 0 ? rows[rows.length - 1].id : null;

      // Follow a new hand to the end of the list. A change further up stays
      // where the reader is looking, unless the undo bar would now cover the end.
      const added = newest !== null && newest !== this.newest;
      const covered = offering && !this.offering && this.nearEnd();
      this.newest = newest;
      this.offering = offering;
      if (added || covered) this.scrollToEnd();
    });
  }

  protected isNew(row: Row): boolean {
    return !this.present.has(row.id);
  }

  protected hand(index: number): string {
    return String(index + 1).padStart(2, '0');
  }

  protected label(row: Row, index: number): string {
    return copy.list.rowA11y(index + 1, this.store.state().teams[row.team].name, row.points);
  }

  protected select(row: Row): void {
    // Only watching: hands are read, not changed.
    if (!this.store.canScore()) return;
    this.selected.set(row.id);
    this.focusIn(row, '.keep');
  }

  protected keep(row: Row): void {
    this.selected.set(null);
    this.focusIn(row, 'button.row');
  }

  protected remove(row: Row, index: number): void {
    this.store.deleteRow(row, index);
    // The row is gone; the way back is the next thing within reach.
    setTimeout(() => document.querySelector<HTMLElement>('app-undo-snackbar .action')?.focus());
  }

  /** Moves focus to a hand, such as one that an undo just brought back. */
  focusRow(id: string): void {
    setTimeout(() =>
      this.host.querySelector<HTMLElement>(`[data-row="${CSS.escape(id)}"] button`)?.focus(),
    );
  }

  /** The pressed button is replaced, so focus moves to what took its place. */
  private focusIn(row: Row, selector: string): void {
    setTimeout(() =>
      this.host
        .querySelector<HTMLElement>(`[data-row="${CSS.escape(row.id)}"] ${selector}`)
        ?.focus({ preventScroll: selector !== '.keep' }),
    );
  }

  private nearEnd(): boolean {
    const { scrollTop, clientHeight, scrollHeight } = this.host;
    return scrollHeight - scrollTop - clientHeight < NEAR_END;
  }

  private scrollToEnd(): void {
    this.host.scrollTo({
      top: this.host.scrollHeight,
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });
  }
}
