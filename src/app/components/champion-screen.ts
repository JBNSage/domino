import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  viewChild,
} from '@angular/core';

import { copy } from '../copy';
import { FitText } from '../directives/fit-text';
import { GameStore } from '../game/game.store';
import { champion, lastWinningSeat, leaders, standings } from '../game/tournament';
import { ChampionSlab } from './champion-slab';
import { RankingList } from './ranking-list';
import { Screen } from './screen';

/**
 * The end of a tournament: the champion in its colour and the final order.
 * "Guardar y salir" keeps it in the history; "Volver atrás" undoes what ended it.
 */
@Component({
  selector: 'app-champion-screen',
  imports: [Screen, ChampionSlab, RankingList, FitText],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.flooded]': 'tone() !== null' },
  template: `
    <app-screen [heading]="heading()" [locked]="true" [tone]="tone()" (closed)="reopen()">
      @if (winner(); as winner) {
        <app-champion-slab
          [name]="winner.name"
          [players]="winner.players"
          [won]="winner.won"
          [tone]="tone()"
          [onFlood]="tone() !== null"
          [labelled]="false"
        />
      } @else {
        <p class="level">{{ level() }}</p>
      }

      <section class="part">
        <h3 class="heading">{{ copy.history.ranking }}</h3>
        <app-ranking-list [standings]="table()" />
      </section>

      <ng-container screenFooter>
        @if (store.canGoBack()) {
          <button type="button" class="slab slab--compact lean back" (click)="store.restore()">
            <span class="slab__label" [appFitText]="copy.tournament.goBack">{{
              copy.tournament.goBack
            }}</span>
          </button>
        }
        <button type="button" class="slab lean finish" (click)="store.finishTournament()">
          <span class="slab__label" [appFitText]="copy.tournament.finish">{{
            copy.tournament.finish
          }}</span>
        </button>
      </ng-container>
    </app-screen>
  `,
  styles: `
    :host(.flooded) {
      --rank-head: var(--c-ink);
    }

    .level {
      margin: 0;
      padding: 0 var(--s-sm);
      max-width: 34ch;
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

    .finish {
      --fill: var(--c-text);
      --edge: transparent;
      --label: var(--c-ground);
    }

    :host(.flooded) .finish {
      --fill: var(--c-ink);
      --label: var(--c-on-ink);
    }

    :host(.flooded) .back {
      --fill: transparent;
      --edge: var(--c-ink);
      --label: var(--c-ink);
    }
  `,
})
export class ChampionScreen {
  protected readonly copy = copy;
  protected readonly store = inject(GameStore);

  private readonly screen = viewChild.required(Screen);

  private readonly ended = computed(() => {
    const tournament = this.store.tournament();
    return tournament?.phase === 'done' ? tournament : null;
  });

  protected readonly table = computed(() => {
    const tournament = this.ended();
    return tournament === null ? [] : standings(tournament);
  });

  protected readonly winner = computed(() => {
    const tournament = this.ended();
    return tournament === null ? null : champion(tournament);
  });

  protected readonly tone = computed(() => {
    const tournament = this.ended();
    const winner = this.winner();
    return tournament === null || winner === null ? null : lastWinningSeat(tournament, winner.id);
  });

  protected readonly heading = computed(() =>
    this.winner() === null ? copy.tournament.endedTitle : copy.tournament.championTitle,
  );

  protected readonly level = computed(() => {
    const tournament = this.ended();
    if (tournament === null) return '';
    return copy.tournament.tied(leaders(tournament).map((team) => team.name));
  });

  constructor() {
    effect(() => {
      const screen = this.screen();
      if (this.ended() !== null) screen.open();
      else screen.close();
    });
  }

  // System Back can close a dialog whatever the page says; the step is still owed.
  protected reopen(): void {
    queueMicrotask(() => {
      if (this.ended() !== null) this.screen().open();
    });
  }
}
