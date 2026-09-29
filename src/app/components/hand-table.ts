import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { copy } from '../copy';
import { Row, TeamId } from '../game/state';

/** The hands of a finished match, as they stood on the board. Nothing here can be changed. */
@Component({
  selector: 'app-hand-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ol class="rows">
      @for (row of rows(); track row.id; let index = $index) {
        <li class="row lean" [attr.aria-label]="label(row, index)">
          @for (team of teams; track team) {
            @if (team === 'b') {
              <span class="hand numerals" aria-hidden="true">{{ hand(index) }}</span>
            }
            <span class="cell" aria-hidden="true">
              @if (row.team === team) {
                <span class="chip lean numerals" [class]="'chip--' + team">{{ row.points }}</span>
              } @else {
                <span class="zero numerals">0</span>
              }
            </span>
          }
        </li>
      }
    </ol>
  `,
  styles: `
    .rows {
      display: flex;
      flex-direction: column;
      gap: var(--s-sm);
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .row {
      --fill: var(--c-surface);

      min-height: calc(var(--min-target) + 4px);
      display: flex;
      align-items: center;
    }

    .hand {
      flex: none;
      width: 44px;
      text-align: center;
      color: var(--c-muted);
      font: italic 600 var(--t-label) / 1.2 var(--font);
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
  `,
})
export class HandTable {
  protected readonly teams = ['a', 'b'] as const;

  readonly rows = input.required<Row[]>();
  readonly names = input.required<Record<TeamId, string>>();

  protected hand(index: number): string {
    return String(index + 1).padStart(2, '0');
  }

  protected label(row: Row, index: number): string {
    return copy.history.handA11y(index + 1, this.names()[row.team], row.points);
  }
}
