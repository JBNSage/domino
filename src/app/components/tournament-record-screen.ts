import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  output,
  signal,
  viewChild,
} from '@angular/core';

import { copy } from '../copy';
import { FitText } from '../directives/fit-text';
import { GameStore } from '../game/game.store';
import { MatchRecord, TournamentRecord, matchesOf } from '../game/history';
import { HistoryStore } from '../game/history.store';
import { ChampionSlab } from './champion-slab';
import { MatchEntry } from './match-entry';
import { RankingList } from './ranking-list';
import { Screen } from './screen';

/** A finished tournament: its champion, the final order, and the matches played. */
@Component({
  selector: 'app-tournament-record-screen',
  imports: [Screen, ChampionSlab, RankingList, MatchEntry, FitText],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-screen [heading]="copy.history.tournamentTitle">
      @if (record(); as record) {
        <p class="facts numerals">
          <span>{{ copy.date(record.endedAt) }}</span>
          <span>{{ copy.tournament.rule(record.rule) }}</span>
          <span>{{ copy.history.summary(record.ranking.length, record.results.length) }}</span>
        </p>

        @if (champion(); as champion) {
          <app-champion-slab
            [name]="champion.name"
            [players]="champion.players"
            [won]="champion.won"
            [tone]="record.championSeat"
          />
        } @else {
          <p class="level">{{ copy.history.noChampion }}</p>
        }

        <section class="part">
          <h3 class="heading">{{ copy.history.ranking }}</h3>
          <app-ranking-list [standings]="record.ranking" />
        </section>

        <section class="part">
          <h3 class="heading">{{ copy.history.matchesHeading }}</h3>
          @for (match of matches(); track match.id) {
            <app-match-entry [match]="match" (open)="openMatch.emit(match)" />
          } @empty {
            <p class="missing">{{ copy.history.missing }}</p>
          }
        </section>
      }

      <button
        screenFooter
        type="button"
        class="slab slab--compact slab--danger lean"
        (click)="remove()"
      >
        <span class="slab__label" [appFitText]="copy.history.delete">{{
          copy.history.delete
        }}</span>
      </button>
    </app-screen>
  `,
  styles: `
    .facts {
      display: flex;
      flex-wrap: wrap;
      gap: 0 var(--s-lg);
      margin: 0;
      padding: 0 var(--s-sm);
      color: var(--c-muted);
      font: italic 600 var(--t-label) / 1.5 var(--font);
      text-transform: uppercase;
    }

    .level {
      margin: 0;
      padding: 0 var(--s-sm);
      font: italic 800 var(--t-title) / 1.2 var(--font);
      text-transform: uppercase;
    }

    .part {
      display: flex;
      flex-direction: column;
      gap: var(--s-sm);
    }

    .heading {
      margin: 0;
      padding: 0 var(--s-sm);
      font: italic 800 var(--t-button) / 1.2 var(--font);
      text-transform: uppercase;
    }

    .missing {
      margin: 0;
      padding: 0 var(--s-sm);
      max-width: 34ch;
      color: var(--c-muted);
    }
  `,
})
export class TournamentRecordScreen {
  protected readonly copy = copy;

  readonly openMatch = output<MatchRecord>();

  private readonly store = inject(GameStore);
  private readonly history = inject(HistoryStore);
  private readonly screen = viewChild.required(Screen);

  protected readonly record = signal<TournamentRecord | null>(null);

  protected readonly champion = computed(() => {
    const record = this.record();
    return record?.ranking.find((team) => team.id === record.champion) ?? null;
  });

  protected readonly matches = computed(() => {
    const record = this.record();
    return record === null ? [] : matchesOf(this.history.history(), record.id);
  });

  open(record: TournamentRecord): void {
    this.record.set(record);
    this.screen().open();
  }

  protected remove(): void {
    const record = this.record();
    if (record === null) return;
    this.screen().close();
    this.store.deleteTournament(record.id);
  }
}
