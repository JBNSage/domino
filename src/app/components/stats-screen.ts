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
import { PlayerStat, places } from '../game/stats';
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
          <ol class="rows">
            @if (view.tab() === 'players') {
              @for (player of view.players(); track player.key; let index = $index) {
                <li>
                  <app-stat-row
                    [place]="playerPlaces()[index]"
                    [name]="player.name"
                    [won]="player.won"
                    [played]="player.played"
                    [rate]="player.rate"
                    [action]="true"
                    (open)="openPlayer.emit(player)"
                  />
                </li>
              }
            } @else {
              @for (couple of view.couples(); track couple.key; let index = $index) {
                <li>
                  <app-stat-row
                    [place]="couplePlaces()[index]"
                    [players]="couple.players"
                    [won]="couple.won"
                    [played]="couple.played"
                    [rate]="couple.rate"
                  />
                </li>
              }
            }
          </ol>
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

    .facts {
      margin: 0 0 calc(var(--s-md) * -1);
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

  protected readonly playerPlaces = computed(() => places(this.view.players()));
  protected readonly couplePlaces = computed(() => places(this.view.couples()));

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
