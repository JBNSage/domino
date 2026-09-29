import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  output,
  viewChild,
} from '@angular/core';

import { copy } from '../copy';
import { FitText } from '../directives/fit-text';
import { Players } from '../game/state';
import { MIN_MATCHES, PlayerStat, Tally, places, sharedPlaces, split } from '../game/stats';

type Row = Tally & {
  key: string;
  name: string;
  players: Players | null;
  player: PlayerStat | null;
};
import { Choice, ChoiceGroup } from './choice-group';
import { Screen } from './screen';
import { Slashes } from './slashes';
import { StatRow } from './stat-row';
import { StatsFilterSheet } from './stats-filter-sheet';
import { StatsTab, StatsView } from './stats-view';

/** Who wins most: each player, and each couple, worked out from the history. */
@Component({
  selector: 'app-stats-screen',
  imports: [Screen, ChoiceGroup, StatRow, StatsFilterSheet, Slashes, FitText],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-screen [heading]="copy.stats.title">
      @if (view.empty() || view.noPlayers()) {
        <div class="empty">
          <app-slashes [size]="22" />
          <h3 class="empty-title">
            {{ view.empty() ? copy.stats.emptyTitle : copy.stats.noPlayersTitle }}
          </h3>
          <p class="empty-body">
            {{ view.empty() ? copy.stats.emptyBody : copy.stats.noPlayersBody }}
          </p>
        </div>
      } @else {
        <div class="controls">
          <div class="filters">
            <button
              type="button"
              class="slab slab--compact lean filter"
              [class.filter--on]="view.filter().table.kind !== 'all'"
              [attr.aria-label]="copy.stats.tableA11y(view.tableLabel())"
              (click)="filters.open('table')"
            >
              <span class="slab__label" [appFitText]="copy.stats.table(view.tableLabel())">{{
                copy.stats.table(view.tableLabel())
              }}</span>
            </button>
            <button
              type="button"
              class="slab slab--compact lean filter"
              [class.filter--on]="view.filter().from !== null || view.filter().to !== null"
              [attr.aria-label]="copy.stats.datesA11y(view.datesLabel())"
              (click)="filters.open('dates')"
            >
              <span class="slab__label" [appFitText]="copy.stats.dates(view.datesLabel())">{{
                copy.stats.dates(view.datesLabel())
              }}</span>
            </button>
          </div>

          <app-choice-group [label]="copy.stats.view" [options]="tabs" [(value)]="view.tab" />
        </div>

        @if (rows().length === 0) {
          <div class="empty">
            <h3 class="empty-title">{{ copy.stats.nothingTitle }}</h3>
            <p class="empty-body">{{ copy.stats.nothingBody }}</p>
            <button type="button" class="slab slab--compact lean clear" (click)="view.clear()">
              <span class="slab__label" [appFitText]="copy.stats.clear">{{
                copy.stats.clear
              }}</span>
            </button>
          </div>
        } @else {
          <p class="facts numerals">{{ facts() }}</p>
          @if (sections().ranked.length > 0) {
            <ol class="rows">
              @for (row of sections().ranked; track row.key; let index = $index) {
                <li>
                  <app-stat-row
                    [place]="sections().places[index]"
                    [shared]="sections().shared[index]"
                    [name]="row.name"
                    [players]="row.players"
                    [won]="row.won"
                    [played]="row.played"
                    [rate]="row.rate"
                    [action]="row.player !== null"
                    (open)="row.player && openPlayer.emit(row.player)"
                  />
                </li>
              }
            </ol>
          }
          @if (sections().few.length > 0) {
            <section class="few">
              <h3 class="heading">{{ copy.stats.few(minMatches) }}</h3>
              <p class="note">{{ copy.stats.fewNote }}</p>
              <ol class="rows">
                @for (row of sections().few; track row.key) {
                  <li>
                    <app-stat-row
                      [place]="null"
                      [name]="row.name"
                      [players]="row.players"
                      [won]="row.won"
                      [played]="row.played"
                      [rate]="row.rate"
                      [action]="row.player !== null"
                      (open)="row.player && openPlayer.emit(row.player)"
                    />
                  </li>
                }
              </ol>
            </section>
          }
        }
      }
    </app-screen>

    <app-stats-filter-sheet #filters />
  `,
  styles: `
    .filters {
      display: flex;
      flex-wrap: wrap;
      gap: var(--s-sm);
      padding: 0 var(--s-sm);
    }

    .filter {
      --lean-inset: 5px;

      flex: 1 1 9rem;
      padding: 0 var(--s-md);
    }

    /* A filter in use looks chosen, so a narrowed list never passes for the whole. */
    .filter--on {
      --fill: var(--c-text);
      --edge: transparent;
      --label: var(--c-ground);
    }

    app-choice-group {
      padding: 0 var(--s-sm);
    }

    .controls {
      display: flex;
      flex-direction: column;
      gap: var(--s-xl);
    }

    /* Short and wide: filters and the toggle share one row, leaving room for the list. */
    @media (max-height: 36em) and (min-width: 30em) {
      .controls {
        flex-direction: row;
        align-items: flex-end;
        gap: var(--s-md);
      }

      .controls > * {
        flex: 1 1 0;
        min-width: 0;
      }
    }

    .few {
      display: flex;
      flex-direction: column;
      gap: var(--s-sm);
    }

    .heading {
      margin: var(--s-md) 0 0;
      padding: 0 var(--s-sm);
      color: var(--c-muted);
      font: italic 600 var(--t-label) / 1.3 var(--font);
      text-transform: uppercase;
    }

    .note {
      margin: 0 0 var(--s-xs);
      padding: 0 var(--s-sm);
      max-width: 40ch;
      color: var(--c-muted);
      line-height: 1.35;
    }

    .facts {
      margin: 0 0 calc(var(--s-lg) * -1);
      padding: 0 var(--s-sm);
      color: var(--c-muted);
      font: italic 600 var(--t-label) / 1.3 var(--font);
      text-transform: uppercase;
    }

    .rows {
      display: flex;
      flex-direction: column;
      gap: var(--s-sm);
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .empty {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: center;
      gap: var(--s-sm);
      padding: var(--s-lg);
    }

    .empty-title {
      margin: var(--s-sm) 0 0;
      font: italic 800 var(--t-title) / 1.15 var(--font);
      text-transform: uppercase;
      text-wrap: balance;
    }

    .empty-body {
      margin: 0;
      max-width: 34ch;
      color: var(--c-muted);
    }

    .clear {
      margin-top: var(--s-sm);
      max-width: 100%;
    }
  `,
})
export class StatsScreen {
  protected readonly copy = copy;
  protected readonly view = inject(StatsView);
  protected readonly tabs: Choice<StatsTab>[] = [
    { value: 'players', label: copy.stats.players },
    { value: 'couples', label: copy.stats.couples },
  ];

  /** Asks for one player's detail. */
  readonly openPlayer = output<PlayerStat>();

  private readonly screen = viewChild.required(Screen);

  protected readonly minMatches = MIN_MATCHES;

  /** The rows of the chosen list: those with enough matches to rank, then the rest. */
  protected readonly sections = computed(() => {
    const rows: Row[] =
      this.view.tab() === 'players'
        ? this.view.players().map((player) => ({ ...player, players: null, player }))
        : this.view.couples().map((couple) => ({ ...couple, name: '', player: null }));
    const { ranked, few } = split(rows);
    return { ranked, few, places: places(ranked), shared: sharedPlaces(ranked) };
  });

  protected readonly rows = computed(() =>
    this.view.tab() === 'players' ? this.view.players() : this.view.couples(),
  );

  protected readonly facts = computed(() =>
    copy.stats.facts(this.view.counted(), this.rows().length, this.view.tab()),
  );

  open(): void {
    this.screen().open();
  }
}
