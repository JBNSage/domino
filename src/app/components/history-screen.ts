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
import { MatchRecord, TournamentRecord, isEmpty } from '../game/history';
import { HistoryStore } from '../game/history.store';
import { TeamId } from '../game/state';
import { Choice, ChoiceGroup } from './choice-group';
import { MatchEntry } from './match-entry';
import { Screen } from './screen';
import { Sheet } from './sheet';
import { Slashes } from './slashes';

type Filter = 'all' | 'matches' | 'tournaments';

type Entry =
  | { kind: 'match'; id: string; endedAt: number; match: MatchRecord }
  | {
      kind: 'tournament';
      id: string;
      endedAt: number;
      record: TournamentRecord;
      date: string;
      champion: string | null;
      tone: TeamId | null;
      label: string;
    };

/** Finished matches and tournaments, newest first. */
@Component({
  selector: 'app-history-screen',
  imports: [Screen, Sheet, ChoiceGroup, MatchEntry, Slashes, FitText],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-screen [heading]="copy.history.title">
      @if (!empty()) {
        <app-choice-group [label]="copy.history.filter" [options]="filters" [(value)]="filter" />
      }

      @if (entries().length === 0) {
        <div class="empty">
          <app-slashes [size]="22" />
          <h3 class="empty-title">{{ emptyCopy().title }}</h3>
          <p class="empty-body">{{ emptyCopy().body }}</p>
        </div>
      } @else {
        <ol class="entries">
          @for (entry of entries(); track entry.id) {
            <li>
              @if (entry.kind === 'match') {
                <app-match-entry [match]="entry.match" (open)="openMatch.emit(entry.match)" />
              } @else {
                <button
                  type="button"
                  class="tournament lean"
                  [attr.aria-label]="entry.label"
                  (click)="openTournament.emit(entry.record)"
                >
                  <span class="when numerals">{{ entry.date }}</span>
                  <svg class="chevron" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M10 5l6 7-6 7" />
                  </svg>
                  <span class="line">
                    <app-slashes class="mark" [size]="14" />
                    <span class="kind">{{ copy.history.tournamentTitle }}</span>
                    <span class="summary numerals">{{
                      copy.history.summary(entry.record.ranking.length, entry.record.results.length)
                    }}</span>
                  </span>
                  <span class="line">
                    @if (entry.champion; as champion) {
                      <span class="role">{{ copy.history.champion }}</span>
                      <span class="champion lean" [class]="'champion--' + (entry.tone ?? 'none')">
                        <span class="champion-name" [appFitText]="champion">{{ champion }}</span>
                      </span>
                    } @else {
                      <span class="role">{{ copy.history.noChampion }}</span>
                    }
                  </span>
                </button>
              }
            </li>
          }
        </ol>

        <button type="button" class="slab slab--compact slab--warn lean clear" (click)="ask.open()">
          <span class="slab__label" [appFitText]="copy.history.clear">{{
            copy.history.clear
          }}</span>
        </button>
      }
    </app-screen>

    <app-sheet #ask accent="var(--c-danger)" labelledBy="clear-sheet-title">
      <h2 class="title" id="clear-sheet-title">{{ copy.history.clearTitle }}</h2>
      <div class="facts">
        <p>{{ clearBody() }}</p>
        <p class="strong">{{ copy.history.clearUndo }}</p>
      </div>
      <div class="actions">
        <button type="button" class="slab slab--danger lean" (click)="clear()">
          <span class="slab__label" [appFitText]="copy.history.clear">{{
            copy.history.clear
          }}</span>
        </button>
        <button type="button" class="slab slab--compact lean" (click)="ask.close()">
          <span class="slab__label" [appFitText]="copy.common.cancel">{{
            copy.common.cancel
          }}</span>
        </button>
      </div>
    </app-sheet>
  `,
  styles: `
    app-choice-group {
      padding: 0 var(--s-sm);
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

    .entries {
      display: flex;
      flex-direction: column;
      gap: var(--s-sm);
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .tournament {
      --fill: var(--c-raised);
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

    .tournament:active::before {
      opacity: var(--pressed);
    }

    @media (hover: hover) {
      .tournament:hover::before {
        filter: brightness(1.12);
      }
    }

    .when,
    .summary,
    .role {
      color: var(--c-muted);
      font: italic 600 var(--t-label) / 1.3 var(--font);
      text-transform: uppercase;
    }

    .line {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--s-xs) var(--s-md);
      min-height: 36px;
    }

    .mark {
      color: var(--c-text);
    }

    .kind {
      font: italic 800 var(--t-button) / 1.2 var(--font);
      text-transform: uppercase;
    }

    .summary {
      margin-left: auto;
    }

    .champion {
      --fill: var(--c-text);
      --lean-inset: 3px;

      flex: 1 1 8rem;
      min-width: 0;
      padding: var(--s-xs) var(--s-lg);
      color: var(--c-ground);
    }

    .champion--a,
    .champion--b {
      --edge: var(--c-team-edge);

      color: var(--c-ink);
    }

    .champion--a {
      --fill: var(--c-team-a);
    }

    .champion--b {
      --fill: var(--c-team-b);
    }

    .champion-name {
      font: italic 800 var(--t-button) / 1.3 var(--font);
      text-transform: uppercase;
    }

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

    .title {
      margin: 0;
      font: italic 800 var(--t-title) / 1.15 var(--font);
      text-transform: uppercase;
      text-wrap: balance;
    }

    .facts {
      display: flex;
      flex-direction: column;
      gap: var(--s-sm);
      max-width: 65ch;
      color: var(--c-muted);
      line-height: 1.35;
    }

    .facts p {
      margin: 0;
    }

    .facts .strong {
      color: var(--c-text);
    }

    .actions {
      display: flex;
      flex-direction: column;
      gap: var(--s-md);
      padding: 0 var(--s-sm);
    }

    .clear {
      align-self: flex-start;
      max-width: calc(100% - var(--s-lg));
      margin: 0 var(--s-sm);
    }
  `,
})
export class HistoryScreen {
  protected readonly copy = copy;
  protected readonly store = inject(GameStore);
  protected readonly filters: Choice<Filter>[] = [
    { value: 'all', label: copy.history.all },
    { value: 'matches', label: copy.history.matches },
    { value: 'tournaments', label: copy.history.tournaments },
  ];

  readonly openMatch = output<MatchRecord>();
  readonly openTournament = output<TournamentRecord>();

  private readonly history = inject(HistoryStore);
  private readonly screen = viewChild.required(Screen);
  private readonly ask = viewChild.required<Sheet>('ask');

  protected readonly filter = signal<Filter>('all');
  protected readonly empty = computed(() => isEmpty(this.history.history()));

  // A match played in a tournament is listed inside that tournament.
  protected readonly entries = computed<Entry[]>(() => {
    const { matches, tournaments } = this.history.history();
    const filter = this.filter();
    const single: Entry[] =
      filter === 'tournaments'
        ? []
        : matches
            .filter((match) => match.tournament === null)
            .map((match) => ({ kind: 'match', id: match.id, endedAt: match.endedAt, match }));
    const whole: Entry[] =
      filter === 'matches'
        ? []
        : tournaments.map((record) => {
            const date = copy.date(record.endedAt);
            const champion =
              record.ranking.find((team) => team.id === record.champion)?.name ?? null;
            return {
              kind: 'tournament',
              id: record.id,
              endedAt: record.endedAt,
              record,
              date,
              champion,
              tone: record.championSeat,
              label: copy.history.tournamentA11y(
                date,
                record.ranking.length,
                record.results.length,
                champion,
              ),
            };
          });
    return [...single, ...whole].sort((one, other) => other.endedAt - one.endedAt);
  });

  protected readonly emptyCopy = computed(() => {
    const { history } = copy;
    if (this.empty()) return { title: history.emptyTitle, body: history.emptyBody };
    return this.filter() === 'tournaments'
      ? { title: history.noTournamentsTitle, body: history.noTournamentsBody }
      : { title: history.noMatchesTitle, body: history.noMatchesBody };
  });

  protected readonly clearBody = computed(() => {
    const { matches, tournaments } = this.history.history();
    const single = matches.filter((match) => match.tournament === null).length;
    return copy.history.clearBody(single, tournaments.length);
  });

  open(): void {
    this.filter.set('all');
    this.screen().open();
  }

  protected clear(): void {
    this.ask().close();
    this.store.clearHistory();
  }
}
