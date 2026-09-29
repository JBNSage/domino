import { ChangeDetectionStrategy, Component, computed, inject, viewChild } from '@angular/core';

import { copy } from '../copy';
import { FitText } from '../directives/fit-text';
import { GameStore } from '../game/game.store';
import { leaders, standings, teamOf } from '../game/tournament';
import { RankingList } from './ranking-list';
import { Screen } from './screen';
import { Sheet } from './sheet';

/** The tournament so far: every team by matches won, and the way to end it. */
@Component({
  selector: 'app-standings-screen',
  imports: [Screen, Sheet, RankingList, FitText],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-screen [heading]="copy.tournament.table">
      @if (store.tournament(); as tournament) {
        <p class="facts numerals">
          <span>{{ copy.tournament.rule(tournament.rule) }}</span>
          <span>{{ copy.tournament.played(tournament.results.length) }}</span>
        </p>
        @if (tied(); as tied) {
          <p class="note">{{ copy.tournament.tieBreakNote(tied) }}</p>
        }
        <app-ranking-list [standings]="table()" [playing]="playing()" />
      }

      <button
        screenFooter
        type="button"
        class="slab slab--compact slab--warn lean"
        (click)="ask.open()"
      >
        <span class="slab__label" [appFitText]="copy.tournament.end">{{
          copy.tournament.end
        }}</span>
      </button>
    </app-screen>

    <app-sheet #ask accent="var(--c-danger)" labelledBy="end-sheet-title">
      <h2 class="title" id="end-sheet-title">{{ copy.tournament.endTitle }}</h2>
      <div class="body">
        <p>{{ outcome().text }}</p>
        @if (discards()) {
          <p>{{ copy.tournament.endDiscards }}</p>
        }
        <p class="strong">{{ copy.tournament.endUndo }}</p>
      </div>

      <div class="actions">
        @switch (outcome().kind) {
          @case ('stillTied') {
            <button type="button" class="slab slab--danger lean" (click)="end()">
              <span class="slab__label" [appFitText]="copy.tournament.endWithout">{{
                copy.tournament.endWithout
              }}</span>
            </button>
          }
          @case ('tie') {
            <button type="button" class="slab slab--filled lean primary" (click)="tieBreak()">
              <span class="slab__label" [appFitText]="copy.tournament.playTieBreak">{{
                copy.tournament.playTieBreak
              }}</span>
            </button>
            <button type="button" class="slab slab--danger lean" (click)="end()">
              <span class="slab__label" [appFitText]="copy.tournament.endWithout">{{
                copy.tournament.endWithout
              }}</span>
            </button>
          }
          @case ('empty') {
            <button type="button" class="slab slab--danger lean" (click)="end()">
              <span class="slab__label" [appFitText]="copy.tournament.cancelTournament">{{
                copy.tournament.cancelTournament
              }}</span>
            </button>
          }
          @default {
            <button type="button" class="slab slab--danger lean" (click)="end()">
              <span class="slab__label" [appFitText]="copy.tournament.end">{{
                copy.tournament.end
              }}</span>
            </button>
          }
        }
        <button type="button" class="slab slab--compact lean" (click)="ask.close()">
          <span class="slab__label" [appFitText]="copy.tournament.keep">{{
            copy.tournament.keep
          }}</span>
        </button>
      </div>
    </app-sheet>
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

    .note {
      margin: 0;
      padding: 0 var(--s-sm);
      max-width: 40ch;
    }

    .title {
      margin: 0;
      font: italic 800 var(--t-title) / 1.15 var(--font);
      text-transform: uppercase;
      text-wrap: balance;
    }

    .body {
      display: flex;
      flex-direction: column;
      gap: var(--s-sm);
      max-width: 65ch;
      color: var(--c-muted);
      line-height: 1.35;
    }

    .body p {
      margin: 0;
    }

    .body .strong {
      color: var(--c-text);
    }

    .actions {
      display: flex;
      flex-direction: column;
      gap: var(--s-md);
      padding: 0 var(--s-sm);
    }

    .primary {
      --fill: var(--c-text);
      --label: var(--c-ground);
    }
  `,
})
export class StandingsScreen {
  protected readonly copy = copy;
  protected readonly store = inject(GameStore);

  private readonly screen = viewChild.required(Screen);
  private readonly ask = viewChild.required<Sheet>('ask');

  protected readonly table = computed(() => {
    const tournament = this.store.tournament();
    return tournament === null ? [] : standings(tournament);
  });

  /** The teams breaking a tie, by name, while they do. */
  protected readonly tied = computed(() => {
    const tournament = this.store.tournament();
    if (tournament === null || tournament.tieBreak === null) return null;
    return tournament.tieBreak.map((id) => teamOf(tournament, id).name);
  });

  /** What ending now would mean. */
  protected readonly outcome = computed(() => {
    const tournament = this.store.tournament();
    if (tournament === null || tournament.results.length === 0) {
      return { kind: 'empty' as const, text: copy.tournament.endEmpty };
    }
    const first = leaders(tournament);
    const names = first.map((team) => team.name);
    if (first.length === 1) {
      return { kind: 'leader' as const, text: copy.tournament.endLeader(names[0]) };
    }
    // Already breaking the tie: playing on is the way to a champion.
    return tournament.tieBreak !== null
      ? { kind: 'stillTied' as const, text: copy.tournament.endStillTied(names) }
      : { kind: 'tie' as const, text: copy.tournament.endTie(names) };
  });

  protected readonly playing = computed(() => {
    const tournament = this.store.tournament();
    if (tournament === null || tournament.phase !== 'playing') return [];
    return [tournament.seats.a, tournament.seats.b];
  });

  protected readonly discards = computed(() => this.store.state().rows.length > 0);

  open(): void {
    this.screen().open();
  }

  protected end(): void {
    this.leave();
    this.store.endTournament();
  }

  protected tieBreak(): void {
    this.leave();
    this.store.startTieBreak();
  }

  private leave(): void {
    this.ask().close();
    this.screen().close();
  }
}
