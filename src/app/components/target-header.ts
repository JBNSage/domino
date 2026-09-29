import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';

import { copy } from '../copy';
import { FitText } from '../directives/fit-text';
import { GameStore } from '../game/game.store';

@Component({
  selector: 'app-target-header',
  imports: [FitText],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.in-tournament]': 'store.tournament() !== null' },
  template: `
    <button
      type="button"
      class="slab slab--compact lean target"
      [attr.aria-label]="copy.target.edit(target())"
      (click)="editTarget.emit()"
    >
      <span class="label" [appFitText]="copy.target.label" [minScale]="0.5">{{
        copy.target.label
      }}</span>
      <span class="value numerals">{{ target() }}</span>
      <svg class="pencil" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 20l1-4.5L16.5 4 20 7.5 8.5 19z" />
        <path d="M14 6.5l3.5 3.5" />
      </svg>
    </button>
    <div class="tools">
      @if (store.tournament() !== null) {
        <button
          type="button"
          class="slab slab--compact lean table"
          [attr.aria-label]="copy.tournament.tableA11y"
          (click)="table.emit()"
        >
          <span class="slab__label" [appFitText]="copy.tournament.table">{{
            copy.tournament.table
          }}</span>
        </button>
      }
      <button type="button" class="tool" [attr.aria-label]="copy.menu.a11y" (click)="menu.emit()">
        <!-- Three bars that lean like everything else. -->
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6.5 6.5h14M5 12h14M3.5 17.5h14" />
        </svg>
      </button>
    </div>
  `,
  styles: `
    :host {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--s-sm);
      padding: var(--s-md) var(--s-sm) var(--s-md) calc(var(--s-lg) + var(--s-sm));
    }

    .target {
      flex-shrink: 1;
    }

    @media (max-height: 36em) {
      :host {
        padding-block: var(--s-xs);
      }
    }

    .label {
      min-width: 0;
      color: var(--c-muted);
      font: italic 600 var(--t-body) / 1.2 var(--font);
      letter-spacing: 0;
    }

    .value {
      font-size: var(--t-title);
      letter-spacing: 0;
    }

    svg {
      flex: none;
      fill: none;
      stroke: var(--c-muted);
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .pencil {
      width: 16px;
      height: 16px;
    }

    .tools {
      flex: 0 1 auto;
      min-width: 0;
      display: flex;
      align-items: center;
      gap: var(--s-xs);
    }

    .table {
      --lean-inset: 5px;

      flex: none;
      padding: 0 min(var(--s-lg), 4vw);
      font-size: min(var(--t-compact), 5.5vw);
    }

    /* Three controls on a narrow screen: the value speaks for itself. */
    @media (max-width: 24em) {
      /* The fitting directive sets its own display on the element. */
      :host(.in-tournament) .label {
        display: none !important;
      }
    }

    .tool {
      flex: none;
      display: grid;
      place-items: center;
      width: var(--min-target);
      height: var(--min-target);
      padding: 0;
      border: 0;
      background: none;
    }

    .tool svg {
      width: 24px;
      height: 24px;
    }

    .tool:active {
      opacity: var(--pressed);
    }

    @media (hover: hover) {
      .tool:hover svg {
        stroke: var(--c-text);
      }
    }
  `,
})
export class TargetHeader {
  protected readonly copy = copy;

  protected readonly store = inject(GameStore);

  readonly target = input.required<number>();
  readonly editTarget = output<void>();
  readonly menu = output<void>();
  /** The table of the tournament being played. */
  readonly table = output<void>();
}
