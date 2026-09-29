import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  viewChild,
} from '@angular/core';

import { copy } from '../copy';
import { FitText } from '../directives/fit-text';
import { GameStore } from '../game/game.store';
import { champion, lastWinningSeat, leaders, standings } from '../game/tournament';
import { haptics } from '../platform/haptics';
import { burst, play } from '../platform/motion';
import { ChampionSlab } from './champion-slab';
import { RankingList } from './ranking-list';
import { Screen } from './screen';

/**
 * The end of a tournament: the champion in its colour and the final order.
 * "Guardar y salir" keeps it in the history; "Deshacer" takes back what ended it.
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
          <button
            type="button"
            class="slab slab--compact lean back"
            [attr.aria-label]="copy.tournament.undoA11y(store.undo()?.message ?? '')"
            (click)="store.restore()"
            (pointerenter)="store.holdUndo()"
            (pointerleave)="store.releaseUndo()"
            (focus)="store.holdUndo()"
            (blur)="store.releaseUndo()"
          >
            <span class="slab__label" [appFitText]="copy.undo.action">{{ copy.undo.action }}</span>
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
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

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
    // A tournament that was already over when the app opened is shown, not celebrated.
    let quiet = this.ended() !== null;
    effect(() => {
      const screen = this.screen();
      if (this.ended() === null) {
        quiet = false;
        screen.close();
        return;
      }
      if (screen.isOpen) return;
      screen.open();
      if (!quiet) requestAnimationFrame(() => this.celebrate());
      quiet = false;
    });
  }

  /** The champion lands, the bars fly, and the table follows in order. */
  private celebrate(): void {
    haptics.champion();
    const slab = this.host.querySelector<HTMLElement>('app-champion-slab');
    play(
      slab?.querySelector('.slab-box'),
      [
        { transform: 'scale(1.35)', opacity: 0 },
        { transform: 'scale(0.97)', opacity: 1, offset: 0.6 },
        { transform: 'none' },
      ],
      { duration: 420, fill: 'backwards' },
    );
    if (slab) {
      setTimeout(() => burst(slab, ['var(--c-ink)', 'var(--c-on-ink)', 'var(--team)'], 36), 220);
    }
    this.host.querySelectorAll('app-ranking-list .row').forEach((row, index) =>
      play(
        row,
        [
          { transform: 'translateY(16px)', opacity: 0 },
          { transform: 'none', opacity: 1 },
        ],
        { duration: 300, delay: 380 + index * 50, fill: 'backwards' },
      ),
    );
  }

  // System Back can close a dialog whatever the page says; the step is still owed.
  protected reopen(): void {
    queueMicrotask(() => {
      if (this.ended() !== null) this.screen().open();
    });
  }
}
