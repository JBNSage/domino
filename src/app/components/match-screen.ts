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
import { GameStore } from '../game/game.store';
import { MatchRecord } from '../game/history';
import { TEAM_IDS, totalsOf } from '../game/state';
import { HandTable } from './hand-table';
import { PlayerPair } from './player-pair';
import { Screen } from './screen';

/** One finished match: who played, the score, and every hand in order. */
@Component({
  selector: 'app-match-screen',
  imports: [Screen, HandTable, FitText, PlayerPair],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-screen [heading]="copy.history.matchTitle">
      @if (match(); as match) {
        <p class="facts numerals">
          <span>{{ copy.date(match.endedAt) }}</span>
          <span>{{ copy.history.target(match.target) }}</span>
          <span>{{ copy.history.hands(match.rows.length) }}</span>
          @if (match.tournament !== null) {
            <span>{{ match.tieBreak ? copy.history.tieBreak : copy.history.inTournament }}</span>
          }
        </p>

        <div class="score">
          @for (team of teams(); track team.id) {
            <div class="side lean" [class]="'side--' + team.id">
              <span class="name" [appFitText]="team.name">{{ team.name }}</span>
              @if (team.players; as players) {
                <app-player-pair class="players" [players]="players" />
              }
              <span class="total numerals" [appFitText]="team.total">{{ team.total }}</span>
              <span class="won lean" [class.hidden]="!team.won">
                <span [appFitText]="copy.history.winner">{{ copy.history.winner }}</span>
              </span>
            </div>
          }
        </div>

        <app-hand-table [rows]="match.rows" [names]="names()" />
      }

      <!-- A tournament's matches go with the tournament, so its table stays true. -->
      @if (match()?.tournament === null) {
        <button
          screenFooter
          type="button"
          class="slab slab--compact slab--warn lean"
          (click)="remove()"
        >
          <span class="slab__label" [appFitText]="copy.history.delete">{{
            copy.history.delete
          }}</span>
        </button>
      }
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

    .score {
      display: flex;
    }

    .side {
      --edge: var(--c-team-edge);
      --lean-inset: 18px;

      flex: 1 1 0;
      min-width: 0;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      padding: var(--s-md) min(var(--s-xl) + var(--s-md), 9vw);
      color: var(--c-ink);
    }

    .side > * {
      max-width: 100%;
    }

    .side--a {
      --fill: var(--c-team-a);
      --team: var(--c-team-a);
    }

    .side--b {
      --fill: var(--c-team-b);
      --team: var(--c-team-b);
    }

    .name {
      font: italic 800 var(--t-button) / 1.2 var(--font);
      text-transform: uppercase;
    }

    .players {
      font: italic 600 var(--t-label) / 1.3 var(--font);
      text-transform: uppercase;
    }

    .total {
      font: italic 800 var(--t-display) / 1.1 var(--font);
    }

    .won {
      --fill: var(--c-ink);
      --lean-inset: 3px;

      min-width: 0;
      margin-top: var(--s-xs);
      padding: 2px var(--s-md);
      color: var(--team);
      font: italic 600 var(--t-meta) / 1.3 var(--font);
      letter-spacing: 0.4px;
      text-transform: uppercase;
    }

    .hidden {
      visibility: hidden;
    }
  `,
})
export class MatchScreen {
  protected readonly copy = copy;

  private readonly store = inject(GameStore);
  private readonly screen = viewChild.required(Screen);

  protected readonly match = signal<MatchRecord | null>(null);

  protected readonly teams = computed(() => {
    const match = this.match();
    if (match === null) return [];
    const totals = totalsOf(match.rows);
    return TEAM_IDS.map((id) => ({
      id,
      ...match.teams[id],
      total: totals[id],
      won: match.winner === id,
    }));
  });

  protected readonly names = computed(() => {
    const match = this.match();
    return { a: match?.teams.a.name ?? '', b: match?.teams.b.name ?? '' };
  });

  open(match: MatchRecord): void {
    this.match.set(match);
    this.screen().open();
  }

  protected remove(): void {
    const match = this.match();
    if (match === null) return;
    this.screen().close();
    this.store.deleteMatch(match.id);
  }
}
