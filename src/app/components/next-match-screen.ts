import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  output,
  viewChild,
} from '@angular/core';

import { copy } from '../copy';
import { FitText } from '../directives/fit-text';
import { GameStore } from '../game/game.store';
import { TEAM_IDS, TeamId, sharedPlayer } from '../game/state';
import { available, standings, teamOf } from '../game/tournament';
import { Screen } from './screen';
import { SeatSheet } from './seat-sheet';
import { Seat, Seats } from './seats';
import { TeamEdit } from './team-sheet';

/**
 * Before a match: between two matches of a tournament, where the winner stays
 * and the team that has waited longest comes in, or at a mesa, where any team
 * can sit and any player can change. Tapping a side changes it.
 */
@Component({
  selector: 'app-next-match-screen',
  imports: [Screen, SeatSheet, Seats, FitText],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-screen [heading]="heading()" [locked]="true" (closed)="reopen()">
      <p class="lead" id="next-match-lead">{{ lead() }}</p>

      <app-seats
        [seats]="seats()"
        [fixed]="fixed()"
        describedBy="next-match-lead"
        (pick)="pick($event)"
      />

      @if (shared(); as player) {
        <p class="shared" role="status">{{ copy.tournament.shared(player) }}</p>
      }

      @if (waiting().length > 0) {
        <section class="queue">
          <h3 class="heading">{{ copy.tournament.waiting }}</h3>
          <ol class="line">
            @for (team of waiting(); track team.id) {
              <li class="numerals">{{ team.name }}</li>
            }
          </ol>
        </section>
      }

      <ng-container screenFooter>
        <div class="slab-row others">
          @if (store.canGoBack()) {
            <button
              type="button"
              class="slab slab--compact lean"
              [attr.aria-label]="copy.tournament.undoA11y(store.undo()?.message ?? '')"
              (click)="undo()"
              (pointerenter)="store.holdUndo()"
              (pointerleave)="store.releaseUndo()"
              (focus)="store.holdUndo()"
              (blur)="store.releaseUndo()"
            >
              <span class="slab__label" [appFitText]="copy.undo.action">{{
                copy.undo.action
              }}</span>
            </button>
          }
          @if (inTournament()) {
            <button
              type="button"
              class="slab slab--compact lean"
              [attr.aria-label]="copy.tournament.tableA11y"
              (click)="table.emit()"
            >
              <span class="slab__label" [appFitText]="copy.tournament.table">{{
                copy.tournament.table
              }}</span>
            </button>
          }
        </div>
        <button
          type="button"
          class="slab slab--filled lean start"
          [disabled]="shared() !== null"
          (click)="start()"
        >
          <span class="slab__label" [appFitText]="copy.tournament.startMatch">{{
            copy.tournament.startMatch
          }}</span>
        </button>
      </ng-container>
    </app-screen>

    <app-seat-sheet (editTeam)="editTeam.emit($event)" />
  `,
  styles: `
    .lead {
      margin: 0;
      padding: 0 var(--s-sm);
      max-width: 34ch;
      color: var(--c-muted);
    }

    .queue {
      display: flex;
      flex-direction: column;
      gap: var(--s-xs);
      padding: 0 var(--s-sm);
    }

    .heading {
      margin: 0;
      color: var(--c-muted);
      font: italic 600 var(--t-label) / 1.3 var(--font);
      text-transform: uppercase;
    }

    .line {
      display: flex;
      flex-wrap: wrap;
      gap: 0 var(--s-lg);
      margin: 0;
      padding: 0;
      list-style: none;
      font: italic 800 var(--t-button) / 1.4 var(--font);
      text-transform: uppercase;
      overflow-wrap: anywhere;
    }

    .start:not(:disabled) {
      --fill: var(--c-text);
      --label: var(--c-ground);
    }

    .shared {
      margin: 0;
      padding: 0 var(--s-sm);
      max-width: 40ch;
      color: var(--c-danger);
      line-height: 1.35;
    }

    .others {
      padding: 0;
    }
  `,
})
export class NextMatchScreen {
  protected readonly copy = copy;
  protected readonly store = inject(GameStore);

  /** Asks for the tournament's table. */
  readonly table = output<void>();
  /** The start of the tournament was taken back: its teams are waiting in the setup. */
  readonly setup = output<void>();
  /** Asks for the team sheet, which the shell owns. */
  readonly editTeam = output<TeamEdit>();

  private readonly screen = viewChild.required(Screen);
  private readonly seatSheet = viewChild.required(SeatSheet);
  private readonly seatSlabs = viewChild.required(Seats);

  protected readonly inTournament = computed(() => this.store.tournament() !== null);
  private readonly visible = computed(() => {
    const tournament = this.store.tournament();
    if (tournament !== null) return tournament.phase === 'between';
    // Only those who may score choose the next teams; the others watch the board.
    return this.store.state().between !== null && this.store.canScore();
  });

  protected readonly heading = computed(() => {
    const tournament = this.store.tournament();
    if (tournament === null) {
      return this.store.state().between === 'start'
        ? copy.tournament.firstTitle
        : copy.tournament.nextTitle;
    }
    if (tournament.tieBreak) return copy.tournament.tieBreakTitle;
    return tournament.results.length === 0 ? copy.tournament.firstTitle : copy.tournament.nextTitle;
  });

  private readonly table$ = computed(() => {
    const tournament = this.store.tournament();
    return tournament === null ? [] : standings(tournament);
  });

  protected readonly seats = computed<Seat[]>(() => {
    const tournament = this.store.tournament();
    if (tournament === null) {
      const { teams } = this.store.state();
      return TEAM_IDS.map((side) => ({
        side,
        ...teams[side],
        won: teams[side].roundsWon,
        enters: false,
      }));
    }
    const table = this.table$();
    return TEAM_IDS.map((side) => {
      const team = teamOf(tournament, tournament.seats[side]);
      const last = tournament.results[tournament.results.length - 1];
      // Anyone who did not sit at the last match comes in from the queue.
      const enters = last !== undefined && !TEAM_IDS.some((seat) => last.seats[seat] === team.id);
      return { side, ...team, won: table.find((row) => row.id === team.id)?.won ?? 0, enters };
    });
  });

  /** The teams that can come in, longest wait first. */
  protected readonly waiting = computed(() => {
    const tournament = this.store.tournament();
    if (tournament === null) return [];
    const table = this.table$();
    return available(tournament).flatMap((id) => table.filter((row) => row.id === id));
  });

  /** Nothing to change: a tournament with no one waiting. */
  protected readonly fixed = computed(() => this.inTournament() && this.waiting().length === 0);

  /** A player in both teams, who cannot play against themselves. */
  protected readonly shared = computed(() => {
    const [a, b] = this.seats();
    return a === undefined || b === undefined ? null : sharedPlayer(a.players, b.players);
  });

  protected readonly lead = computed(() => {
    if (!this.inTournament()) return copy.tournament.tableBody;
    if (this.waiting().length === 0) return copy.tournament.nextFixed;
    return this.store.tournament()?.results.length === 0
      ? copy.tournament.firstBody
      : copy.tournament.nextBody;
  });

  constructor() {
    effect(() => {
      const screen = this.screen();
      if (this.visible()) {
        if (screen.isOpen) return;
        screen.open();
        requestAnimationFrame(() => this.seatSlabs().faceOff());
        // The choice on this screen is the two teams, so reading starts there.
        queueMicrotask(() => this.seatSlabs().focusFirst());
      } else {
        this.seatSheet().close();
        screen.close();
      }
    });
  }

  protected undo(): void {
    const inTournament = this.inTournament();
    this.store.restore();
    // Taking back the start of a tournament returns to its setup.
    if (inTournament && this.store.tournament() === null) this.setup.emit();
  }

  protected pick(side: TeamId): void {
    this.seatSheet().open(side);
  }

  protected start(): void {
    if (this.shared() !== null) return;
    if (this.inTournament()) this.store.startNextMatch();
    else this.store.startMatch();
  }

  // System Back can close a dialog whatever the page says; the step is still owed.
  protected reopen(): void {
    queueMicrotask(() => {
      if (this.visible()) this.screen().open();
    });
  }
}
