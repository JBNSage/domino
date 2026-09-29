import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { copy } from '../copy';
import { FitText } from '../directives/fit-text';
import { Players } from '../game/state';
import { PlayerPair } from './player-pair';

/**
 * One line of the statistics: a player or a couple, how often they won, and a
 * leaning meter filled to that share, so a list of rows reads as a chart.
 */
@Component({
  selector: 'app-stat-row',
  imports: [NgTemplateOutlet, FitText, PlayerPair],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-template #content>
      <span class="place numerals" aria-hidden="true">{{ place() ?? '' }}</span>
      <span class="who">
        <span class="head">
          @if (players(); as pair) {
            <app-player-pair class="name couple" [players]="pair" [wrap]="true" />
          } @else {
            <span class="name" [appFitText]="name()">{{ name() }}</span>
          }
          <span class="rate numerals">{{ percent() }}</span>
        </span>
        <span class="record numerals">{{ copy.stats.record(won(), played()) }}</span>
        <span class="meter lean" aria-hidden="true">
          <span class="fill" [style.width.%]="rate() * 100"></span>
        </span>
      </span>
    </ng-template>

    @if (action()) {
      <button
        type="button"
        class="row lean"
        [class.row--lead]="lead()"
        [attr.aria-label]="spoken() + '. ' + copy.stats.open"
        (click)="open.emit()"
      >
        <ng-container *ngTemplateOutlet="content" />
        <svg class="chevron" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M10 5l6 7-6 7" />
        </svg>
      </button>
    } @else {
      <div class="row lean" [class.row--lead]="lead()">
        <span class="sr-only">{{ spoken() }}</span>
        <span class="shown" aria-hidden="true">
          <ng-container *ngTemplateOutlet="content" />
        </span>
      </div>
    }
  `,
  styles: `
    .row {
      --fill: var(--c-surface);
      --lean-inset: 8px;

      width: 100%;
      min-height: 72px;
      display: flex;
      align-items: center;
      gap: var(--s-sm);
      padding: var(--s-sm) min(var(--s-xl), 6vw) var(--s-sm) min(var(--s-lg), 4vw);
      border: 0;
      background: none;
      color: var(--c-text);
      text-align: left;
    }

    .shown {
      display: contents;
    }

    /* First place, as in a tournament's table. */
    .row--lead {
      --fill: var(--c-raised);
      --edge: var(--c-text);
    }

    button.row:active::before {
      opacity: var(--pressed);
    }

    @media (hover: hover) {
      button.row:hover::before {
        filter: brightness(1.12);
      }
    }

    .place {
      flex: none;
      width: min(2.25rem, 10vw);
      color: var(--c-muted);
      font: italic 800 min(var(--t-title), 8vw) / 1 var(--font);
      text-align: center;
    }

    .row--lead .place {
      color: var(--c-text);
    }

    .who {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }

    .who > * {
      max-width: 100%;
    }

    /* The name and its share on one line; the rate never gives way. */
    .head {
      width: 100%;
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: 0 var(--s-md);
    }

    /* With little room the rate moves under the name, which never breaks mid-word. */
    .head .name {
      flex: 1 1 9rem;
      min-width: 0;
    }

    .head .rate {
      margin-left: auto;
    }

    .name {
      font: italic 800 var(--t-button) / 1.2 var(--font);
      text-transform: uppercase;
    }

    /* Two names share the line, so a couple is set one step smaller. */
    .couple {
      font-size: var(--t-compact);
    }

    .record {
      overflow-wrap: anywhere;
      color: var(--c-muted);
      font: italic 600 var(--t-label) / 1.3 var(--font);
      text-transform: uppercase;
    }

    /* The share won, as a leaning bar under the name. */
    .meter {
      --fill: var(--c-line);
      --lean-inset: 2px;

      width: 100%;
      height: 8px;
      margin-top: var(--s-xs);
      overflow: hidden;
    }

    .meter::before {
      border: 0;
      opacity: 0.45;
    }

    .fill {
      position: absolute;
      inset: 0 auto 0 2px;
      max-width: calc(100% - 4px);
      background: var(--c-text);
      transform: skewX(-12deg);
      transform-origin: bottom left;
    }

    .rate {
      flex: none;
      font: italic 800 min(var(--t-title), 9vw) / 1 var(--font);
      text-align: right;
    }

    .chevron {
      flex: none;
      width: 20px;
      height: 20px;
      fill: none;
      stroke: var(--c-muted);
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    @media (prefers-reduced-motion: no-preference) {
      .fill {
        animation: grow 420ms var(--ease-out) backwards;
      }

      @keyframes grow {
        from {
          width: 0;
        }
      }
    }
  `,
})
export class StatRow {
  protected readonly copy = copy;

  /** The place in the ranking; null for a row with too few matches to rank. */
  readonly place = input.required<number | null>();
  /** Whether another row has the same place. */
  readonly shared = input(false);
  /** A player's name; a couple gives its players instead. */
  readonly name = input('');
  readonly players = input<Players | null>(null);
  readonly won = input.required<number>();
  readonly played = input.required<number>();
  readonly rate = input.required<number>();
  /** Whether the row opens a detail. */
  readonly action = input(false);
  readonly open = output<void>();

  protected readonly lead = computed(() => this.place() === 1 && this.won() > 0);
  protected readonly spoken = computed(() =>
    copy.stats.rowA11y(
      copy.stats.place(this.place(), this.shared()),
      this.label(),
      this.rate(),
      this.won(),
      this.played(),
    ),
  );
  protected readonly percent = computed(() => copy.stats.percent(this.rate()));
  protected readonly label = computed(() => {
    const pair = this.players();
    return pair === null ? this.name() : `${pair[0]} y ${pair[1]}`;
  });
}
