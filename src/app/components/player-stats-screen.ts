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
import { PlayerStat, partnersOf, places } from '../game/stats';
import { Screen } from './screen';
import { StatRow } from './stat-row';
import { StatsView } from './stats-view';

/** One player: how often they win, and how often with each partner. */
@Component({
  selector: 'app-player-stats-screen',
  imports: [Screen, StatRow, FitText],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-screen [heading]="stat()?.name ?? copy.stats.title">
      @if (stat(); as stat) {
        <p class="facts">{{ copy.stats.filtered(view.tableLabel(), view.datesLabel()) }}</p>

        <div class="total lean">
          <span class="rate numerals" [appFitText]="percent()">{{ percent() }}</span>
          <span class="detail numerals">{{
            copy.stats.detail(stat.won, stat.lost, stat.played)
          }}</span>
          <span class="meter lean" aria-hidden="true">
            <span class="fill" [style.width.%]="stat.rate * 100"></span>
          </span>
        </div>

        <section class="part">
          <h3 class="heading">{{ copy.stats.partners }}</h3>
          <ol class="rows">
            @for (partner of partners(); track partner.key; let index = $index) {
              <li>
                <app-stat-row
                  [place]="partnerPlaces()[index]"
                  [name]="partner.name"
                  [won]="partner.won"
                  [played]="partner.played"
                  [rate]="partner.rate"
                />
              </li>
            }
          </ol>
        </section>
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

  /** The player under the current filters; gone if the filters leave them out. */
  protected readonly stat = computed(
    () => this.view.players().find((player) => player.key === this.key()) ?? null,
  );
  protected readonly percent = computed(() => copy.stats.percent(this.stat()?.rate ?? 0));
  protected readonly partners = computed(() => {
    const key = this.key();
    return key === null ? [] : partnersOf(this.view.matches(), key);
  });
  protected readonly partnerPlaces = computed(() => places(this.partners()));

  open(player: PlayerStat): void {
    this.key.set(player.key);
    this.screen().open();
  }
}
