import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { copy } from '../copy';
import { FitText } from '../directives/fit-text';
import { Standing } from '../game/tournament';

/** A tournament's teams in order: most matches won first. */
@Component({
  selector: 'app-ranking-list',
  imports: [FitText],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="head" aria-hidden="true">
      <span class="head-team">{{ copy.tournament.columnTeam }}</span>
      <span class="count">{{ copy.tournament.columnWon }}</span>
      <span class="count">{{ copy.tournament.columnLost }}</span>
    </div>
    <p class="sr-only">{{ copy.tournament.columnsA11y }}</p>
    <ol class="rows">
      @for (team of standings(); track team.id; let index = $index) {
        <li
          class="row lean"
          [class.row--first]="team.won > 0 && team.won === standings()[0].won"
          [attr.aria-label]="copy.tournament.rankA11y(index + 1, team.name, team.won, team.lost)"
        >
          <span class="position numerals" aria-hidden="true">{{ index + 1 }}</span>
          <span class="who" aria-hidden="true">
            <span class="name" [appFitText]="team.name">{{ team.name }}</span>
            @if (team.players; as players) {
              <span class="players" [appFitText]="copy.players.pair(players)">{{
                copy.players.pair(players)
              }}</span>
            }
          </span>
          <span class="count won numerals" aria-hidden="true">{{ team.won }}</span>
          <span class="count lost numerals" aria-hidden="true">{{ team.lost }}</span>
        </li>
      }
    </ol>
  `,
  styles: `
    :host {
      /* Columns follow the reader's text size until the name would lose its room. */
      --position: min(2.25rem, 11vw);
      --count: min(2.5rem, 11vw);
      --figure: min(var(--t-title), 8vw);

      display: flex;
      flex-direction: column;
      gap: var(--s-xs);
      color: var(--c-text);
    }

    .head,
    .row {
      display: flex;
      align-items: center;
      gap: var(--s-sm);
      padding: 0 min(var(--s-xl), 6vw) 0 min(var(--s-lg), 4vw);
    }

    .head {
      color: var(--rank-head, var(--c-muted));
      font: italic 600 var(--t-label) / 1.3 var(--font);
      text-transform: uppercase;
    }

    .head-team {
      flex: 1;
      padding-left: calc(var(--position) + var(--s-sm));
    }

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
      --lean-inset: 8px;

      min-height: calc(var(--min-target) + 12px);
      padding-block: var(--s-sm);
    }

    .row--first {
      --fill: var(--c-raised);
      --edge: var(--c-text);
    }

    .position {
      flex: none;
      width: var(--position);
      color: var(--c-muted);
      font: italic 800 var(--figure) / 1 var(--font);
      text-align: center;
    }

    .row--first .position {
      color: var(--c-text);
    }

    .who {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
    }

    .name {
      font: italic 800 var(--t-button) / 1.2 var(--font);
      text-transform: uppercase;
    }

    .players {
      color: var(--c-muted);
      font: italic 600 var(--t-label) / 1.3 var(--font);
      text-transform: uppercase;
    }

    .count {
      flex: none;
      width: var(--count);
      text-align: center;
    }

    .won,
    .lost {
      font: italic 800 var(--figure) / 1 var(--font);
    }

    .lost {
      color: var(--c-muted);
      font-weight: 600;
    }
  `,
})
export class RankingList {
  protected readonly copy = copy;

  readonly standings = input.required<Standing[]>();
}
