import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';

import { copy } from '../copy';
import { FitText } from '../directives/fit-text';
import { MIN_MATCHES, PlayerStat, partnersOf, places, sharedPlaces, split } from '../game/stats';
import { Screen } from './screen';
import { StatRow } from './stat-row';
import { StatsView } from './stats-view';

/** One player: how often they win, and how often with each partner. */
@Component({
  selector: 'app-player-stats-screen',
  imports: [Screen, StatRow, FitText],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-screen [heading]="stat()?.name ?? name()">
      @if (stat(); as stat) {
        <p class="facts">{{ copy.stats.filtered(view.tableLabel(), view.datesLabel()) }}</p>

        <div class="total lean">
          <span class="rate numerals" [appFitText]="percent()">{{ percent() }}</span>
          <span class="detail numerals">{{ copy.stats.detail(stat.won, stat.lost) }}</span>
          <span class="meter lean" aria-hidden="true">
            <span class="fill" [style.width.%]="stat.rate * 100"></span>
          </span>
        </div>

        <section class="part">
          <h3 class="heading">{{ copy.stats.partners }}</h3>
          @if (partners().ranked.length > 0) {
            <ol class="rows">
              @for (partner of partners().ranked; track partner.key; let index = $index) {
                <li>
                  <app-stat-row
                    [place]="partners().places[index]"
                    [shared]="partners().shared[index]"
                    [name]="partner.name"
                    [won]="partner.won"
                    [played]="partner.played"
                    [rate]="partner.rate"
                  />
                </li>
              }
            </ol>
          }
          @if (partners().few.length > 0) {
            <h3 class="heading">{{ copy.stats.few(minMatches) }}</h3>
            <ol class="rows">
              @for (partner of partners().few; track partner.key) {
                <li>
                  <app-stat-row
                    [place]="null"
                    [name]="partner.name"
                    [won]="partner.won"
                    [played]="partner.played"
                    [rate]="partner.rate"
                  />
                </li>
              }
            </ol>
          }
        </section>
      } @else {
        <div class="empty">
          <h3 class="empty-title">{{ copy.stats.playerMissingTitle }}</h3>
          <p class="empty-body">{{ copy.stats.playerMissingBody(name()) }}</p>
        </div>
      }
    </app-screen>
  `,
  styles: `
    .facts,
    .heading {
      margin: 0;
      padding: 0 var(--s-sm);
      color: var(--c-muted);
      font: italic 600 var(--t-label) / 1.3 var(--font);
      text-transform: uppercase;
    }

    .total {
      --fill: var(--c-text);
      --lean-inset: 16px;

      display: flex;
      flex-direction: column;
      align-items: flex-start;
      padding: var(--s-lg) min(var(--s-xxl) + var(--s-lg), 11vw) var(--s-xl);
      color: var(--c-ground);
    }

    .total > * {
      max-width: 100%;
    }

    .rate {
      font: italic 800 var(--t-hull) / 1 var(--font);
    }

    .detail {
      font: italic 600 var(--t-meta) / 1.3 var(--font);
      letter-spacing: 0.4px;
      text-transform: uppercase;
    }

    .meter {
      --fill: var(--c-ground);
      --lean-inset: 2px;

      width: 100%;
      height: 10px;
      margin-top: var(--s-md);
      overflow: hidden;
    }

    .meter::before {
      border: 0;
      opacity: 0.35;
    }

    .fill {
      position: absolute;
      inset: 0 auto 0 2px;
      max-width: calc(100% - 4px);
      background: var(--c-ground);
      transform: skewX(-12deg);
      transform-origin: bottom left;
    }

    .empty {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: var(--s-sm);
      padding: var(--s-lg);
    }

    .empty-title {
      margin: 0;
      font: italic 800 var(--t-title) / 1.15 var(--font);
      text-transform: uppercase;
      text-wrap: balance;
    }

    .empty-body {
      margin: 0;
      max-width: 34ch;
      color: var(--c-muted);
    }

    .part {
      display: flex;
      flex-direction: column;
      gap: var(--s-md);
    }

    .rows {
      display: flex;
      flex-direction: column;
      gap: var(--s-sm);
      margin: 0;
      padding: 0;
      list-style: none;
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
export class PlayerStatsScreen {
  protected readonly copy = copy;
  protected readonly view = inject(StatsView);

  private readonly screen = viewChild.required(Screen);
  private readonly key = signal<string | null>(null);
  /** The name as it was opened, for when the filters leave the player out. */
  protected readonly name = signal('');
  protected readonly minMatches = MIN_MATCHES;

  /** The player under the current filters; gone if the filters leave them out. */
  protected readonly stat = computed(
    () => this.view.players().find((player) => player.key === this.key()) ?? null,
  );
  protected readonly percent = computed(() => copy.stats.percent(this.stat()?.rate ?? 0));
  protected readonly partners = computed(() => {
    const key = this.key();
    const { ranked, few } = split(key === null ? [] : partnersOf(this.view.matches(), key));
    return { ranked, few, places: places(ranked), shared: sharedPlaces(ranked) };
  });

  open(player: PlayerStat): void {
    this.key.set(player.key);
    this.name.set(player.name);
    this.screen().open();
  }
}
