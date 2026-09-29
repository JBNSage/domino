import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { copy } from '../copy';
import { FitText } from '../directives/fit-text';
import { PlayerPair } from './player-pair';
import { MatchRecord } from '../game/history';
import { TEAM_IDS, otherTeam, totalsOf } from '../game/state';

/** One finished match in a list: who played, the score, and who won it. */
@Component({
  selector: 'app-match-entry',
  imports: [FitText, PlayerPair],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button type="button" class="entry lean" [attr.aria-label]="label()" (click)="open.emit()">
      <span class="when numerals">
        <span>{{ heading() ?? date() }}</span>
        @if (match().tieBreak) {
          <span class="flag">{{ copy.history.tieBreak }}</span>
        }
      </span>
      @for (team of teams(); track team.id) {
        <span class="line" [class.line--won]="team.won">
          <span class="who">
            <span class="name" [appFitText]="team.name">{{ team.name }}</span>
            @if (team.players; as players) {
              <app-player-pair class="players" [players]="players" />
            }
          </span>
          @if (team.won) {
            <span class="total chip lean numerals" [class]="'chip--' + team.id">{{
              team.total
            }}</span>
          } @else {
            <span class="total numerals">{{ team.total }}</span>
          }
        </span>
      }
      <svg class="chevron" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M10 5l6 7-6 7" />
      </svg>
    </button>
  `,
  styles: `
    :host {
      display: block;
    }

    .entry {
      --fill: var(--c-surface);
      --lean-inset: 8px;

      position: relative;
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: var(--s-xs);
      padding: var(--s-md) calc(var(--s-xl) + 28px) var(--s-md) var(--s-xl);
      border: 0;
      background: none;
      color: var(--c-text);
      text-align: left;
    }

    .entry:active::before {
      opacity: var(--pressed);
    }

    @media (hover: hover) {
      .entry:hover::before {
        filter: brightness(1.12);
      }
    }

    .when {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 0 var(--s-md);
      color: var(--c-muted);
      font: italic 600 var(--t-label) / 1.3 var(--font);
      text-transform: uppercase;
    }

    .flag {
      color: var(--c-text);
    }

    .line {
      display: flex;
      align-items: center;
      gap: var(--s-md);
      min-height: 36px;
      color: var(--c-muted);
    }

    .line--won {
      color: var(--c-text);
    }

    /* Says the entry opens. */
    .chevron {
      position: absolute;
      top: 50%;
      right: var(--s-lg);
      width: 20px;
      height: 20px;
      margin-top: -10px;
      fill: none;
      stroke: var(--c-muted);
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .who {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
    }

    .players {
      font: italic 600 var(--t-label) / 1.3 var(--font);
      text-transform: uppercase;
    }

    .name {
      font: italic 800 var(--t-button) / 1.2 var(--font);
      text-transform: uppercase;
    }

    .total {
      flex: none;
      min-width: 64px;
      padding: var(--s-xs) var(--s-md);
      font: italic 600 var(--t-button) / 1.3 var(--font);
      text-align: center;
    }

    .chip {
      --edge: var(--c-team-edge);
      --lean-inset: 3px;

      color: var(--c-ink);
      font-weight: 800;
    }

    .chip--a {
      --fill: var(--c-team-a);
    }

    .chip--b {
      --fill: var(--c-team-b);
    }
  `,
})
export class MatchEntry {
  protected readonly copy = copy;

  readonly match = input.required<MatchRecord>();
  /** Shown in place of the date, such as the match's number in its tournament. */
  readonly heading = input<string | null>(null);
  readonly open = output<void>();

  protected readonly date = computed(() => copy.date(this.match().endedAt));

  protected readonly teams = computed(() => {
    const match = this.match();
    const totals = totalsOf(match.rows);
    return TEAM_IDS.map((id) => ({
      id,
      name: match.teams[id].name,
      players: match.teams[id].players,
      total: totals[id],
      won: match.winner === id,
    }));
  });

  protected readonly label = computed(() => {
    const { teams, winner, rows } = this.match();
    const totals = totalsOf(rows);
    const loser = otherTeam(winner);
    return copy.history.matchA11y(
      this.heading() ?? this.date(),
      teams[winner].name,
      totals[winner],
      teams[loser].name,
      totals[loser],
    );
  });
}
