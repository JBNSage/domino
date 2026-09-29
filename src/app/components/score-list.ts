import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';

import { copy } from '../copy';
import { FitText } from '../directives/fit-text';
import { GameStore } from '../game/game.store';
import { Row } from '../game/state';
import { prefersReducedMotion } from '../platform/motion';
import { Slashes } from './slashes';

@Component({
  selector: 'app-score-list',
  imports: [Slashes, FitText],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.with-undo]': 'store.undo() !== null' },
  template: `
    @if (rows().length === 0) {
      <div class="empty">
        <app-slashes [size]="22" />
        <h2 class="empty-title">{{ copy.list.emptyTitle }}</h2>
        <p class="empty-body">{{ copy.list.emptyBody }}</p>
      </div>
    } @else {
      <ol class="rows">
        @for (row of rows(); track row.id; let index = $index, last = $last) {
          <li [class]="isNew(row) ? 'enter enter--' + row.team : ''" [attr.data-row]="row.id">
            @if (selected() === row.id) {
              <div class="row selected">
                <span class="hand hand--latest numerals" aria-hidden="true">{{ hand(index) }}</span>
                <button type="button" class="slab slab--compact lean keep" (click)="keep(row)">
                  <span class="slab__label" [appFitText]="copy.list.keep">{{
                    copy.list.keep
                  }}</span>
                </button>
                <button
                  type="button"
                  class="slab slab--compact slab--danger lean"
                  [attr.aria-label]="copy.list.deleteA11y(index + 1)"
                  (click)="store.deleteRow(row, index)"
                >
                  <span class="slab__label" [appFitText]="copy.list.delete">{{
                    copy.list.delete
                  }}</span>
                </button>
              </div>
            } @else {
              <button
                type="button"
                class="row lean"
                [class.row--latest]="last"
                [attr.aria-label]="label(row, index)"
                (click)="select(row)"
              >
                @for (team of ['a', 'b']; track team) {
                  @if (team === 'b') {
                    <span class="hand numerals" [class.hand--latest]="last">{{ hand(index) }}</span>
                  }
                  <span class="cell">
                    @if (row.team === team) {
                      <span class="chip lean numerals" [class]="'chip--' + team">
                        {{ row.points }}
                      </span>
                    } @else {
                      <span class="zero numerals">0</span>
                    }
                  </span>
                }
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

    .row--latest {
      --fill: var(--c-raised);
    }

    button.row:active::before {
      opacity: var(--pressed);
    }

    @media (hover: hover) {
      button.row:hover::before {
        filter: brightness(1.12);
      }
    }

    .selected {
      gap: var(--s-sm);
    }

    .selected .slab {
      flex: 1;
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

    .selected .hand {
      font-size: var(--t-meta);
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
  protected readonly store = inject(GameStore);

  protected readonly rows = computed(() => this.store.state().rows);
  protected readonly selected = signal<string | null>(null);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  // Hands already on the board at launch arrive without moving.
  private readonly present = new Set(this.rows().map((row) => row.id));

  constructor() {
    // A new hand, or the list changing under a selection, drops the selection.
    effect(() => {
      this.rows();
      this.selected.set(null);
    });

    afterRenderEffect(() => {
      const rows = this.rows();
      this.store.undo();
      if (rows.length === 0) return;
      untracked(() =>
        this.host.scrollTo({
          top: this.host.scrollHeight,
          behavior: prefersReducedMotion() ? 'auto' : 'smooth',
        }),
      );
    });
  }

  protected isNew(row: Row): boolean {
    return !this.present.has(row.id);
  }

  protected hand(index: number): string {
    return String(index + 1).padStart(2, '0');
  }

  protected label(row: Row, index: number): string {
    const name = this.store.state().teams[row.team].name;
    return `${copy.list.rowA11y(index + 1, name, row.points)}. ${copy.list.rowHint}`;
  }

  protected select(row: Row): void {
    this.selected.set(row.id);
    this.focusIn(row, '.keep');
  }

  protected keep(row: Row): void {
    this.selected.set(null);
    this.focusIn(row, 'button.row');
  }

  /** The pressed button is replaced, so focus moves to what took its place. */
  private focusIn(row: Row, selector: string): void {
    setTimeout(() =>
      this.host
        .querySelector<HTMLElement>(`[data-row="${CSS.escape(row.id)}"] ${selector}`)
        ?.focus({ preventScroll: true }),
    );
  }
}
