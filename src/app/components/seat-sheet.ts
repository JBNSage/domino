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
import { Players, TeamId } from '../game/state';
import { TablesStore } from '../game/tables.store';
import { available, standings, teamOf } from '../game/tournament';
import { PlayerPair } from './player-pair';
import { Sheet } from './sheet';
import { TeamEdit } from './team-sheet';
import { TeamEdits } from './team-edits';

type Option = { id: string; name: string; players: Players | null; won: number };

/**
 * Who sits at one side: the same team with other players, another team of the
 * mesa, or a waiting team of the tournament.
 */
@Component({
  selector: 'app-seat-sheet',
  imports: [Sheet, FitText, PlayerPair],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-sheet [accent]="accent()" labelledBy="seat-sheet-title">
      <h2 class="title" id="seat-sheet-title">{{ title() }}</h2>

      <button type="button" class="slab slab--compact lean players" (click)="changePlayers()">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 20l1-4.5L16.5 4 20 7.5 8.5 19z" />
          <path d="M14 6.5l3.5 3.5" />
        </svg>
        <span class="slab__label" [appFitText]="copy.seat.changePlayers">{{
          copy.seat.changePlayers
        }}</span>
      </button>

      @if (options().length > 0 || !inTournament()) {
        <section class="group">
          <h3 class="heading">{{ inTournament() ? copy.seat.waiting : copy.seat.saved }}</h3>
          @if (options().length === 0) {
            <p class="note">{{ copy.seat.noSaved }}</p>
          } @else {
            <ol class="options">
              @for (team of options(); track team.id) {
                <li>
                  <button
                    type="button"
                    class="option lean"
                    [attr.aria-label]="copy.seat.optionA11y(team.name, team.players, team.won)"
                    (click)="choose(team)"
                  >
                    <span class="who">
                      <span class="option-name" [appFitText]="team.name">{{ team.name }}</span>
                      @if (team.players; as players) {
                        <app-player-pair class="option-players" [players]="players" />
                      }
                    </span>
                    <span class="option-wins numerals">{{ copy.tournament.wins(team.won) }}</span>
                  </button>
                </li>
              }
            </ol>
          }
        </section>
      }

      <div class="slab-row">
        <button type="button" class="slab slab--compact lean" (click)="sheet().close()">
          <span class="slab__label" [appFitText]="copy.common.cancel">{{
            copy.common.cancel
          }}</span>
        </button>
        @if (!inTournament()) {
          <button type="button" class="slab slab--compact lean" (click)="newTeam()">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
            <span class="slab__label" [appFitText]="copy.seat.newTeam">{{
              copy.seat.newTeam
            }}</span>
          </button>
        }
      </div>
    </app-sheet>
  `,
  styles: `
    .title {
      margin: 0;
      font: italic 800 var(--t-title) / 1.15 var(--font);
      text-transform: uppercase;
      text-wrap: balance;
      overflow-wrap: break-word;
      hyphens: auto;
    }

    .players {
      align-self: flex-start;
      max-width: calc(100% - var(--s-lg));
      margin: 0 var(--s-sm);
    }

    svg {
      flex: none;
      width: 18px;
      height: 18px;
      fill: none;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .group {
      display: flex;
      flex-direction: column;
      gap: var(--s-sm);
    }

    .heading {
      margin: 0;
      color: var(--c-muted);
      font: italic 600 var(--t-label) / 1.3 var(--font);
      text-transform: uppercase;
    }

    .note {
      margin: 0;
      color: var(--c-muted);
      line-height: 1.35;
    }

    .options {
      display: flex;
      flex-direction: column;
      gap: var(--s-sm);
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .option {
      --fill: var(--c-surface);
      --lean-inset: 8px;

      width: 100%;
      min-height: calc(var(--min-target) + 12px);
      display: flex;
      align-items: center;
      gap: var(--s-md);
      padding: var(--s-sm) var(--s-xl);
      border: 0;
      background: none;
      color: var(--c-text);
      text-align: left;
    }

    .option:active::before {
      opacity: var(--pressed);
    }

    @media (hover: hover) {
      .option:hover::before {
        filter: brightness(1.12);
      }
    }

    .who {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
    }

    .option-name {
      font: italic 800 var(--t-button) / 1.2 var(--font);
      text-transform: uppercase;
    }

    .option-players {
      color: var(--c-muted);
      font: italic 600 var(--t-label) / 1.3 var(--font);
      text-transform: uppercase;
    }

    /* The wins are why a team is picked, so they read first after the name. */
    .option-wins {
      flex: none;
      font: italic 800 var(--t-meta) / 1.3 var(--font);
      text-transform: uppercase;
    }
  `,
})
export class SeatSheet {
  protected readonly copy = copy;

  /** Asks for the team sheet, which the shell owns. */
  readonly editTeam = output<TeamEdit>();

  private readonly store = inject(GameStore);
  private readonly tables = inject(TablesStore);
  private readonly edits = inject(TeamEdits);
  protected readonly sheet = viewChild.required(Sheet);

  private readonly side = signal<TeamId>('a');

  protected readonly accent = computed(() => `var(--c-team-${this.side()})`);
  protected readonly inTournament = computed(() => this.store.tournament() !== null);

  private readonly current = computed(() => {
    const tournament = this.store.tournament();
    if (tournament !== null) return teamOf(tournament, tournament.seats[this.side()]).name;
    return this.store.state().teams[this.side()].name;
  });

  protected readonly title = computed(() => copy.tournament.pickTitle(this.current()));

  protected readonly options = computed<Option[]>(() => {
    const tournament = this.store.tournament();
    if (tournament !== null) {
      const table = standings(tournament);
      return available(tournament).flatMap((id) => table.filter((row) => row.id === id));
    }
    const { teams, tally } = this.store.state();
    const seated = [teams.a.saved, teams.b.saved];
    // Most wins first: the teams that play most come to hand first.
    return (this.tables.active()?.teams ?? [])
      .filter((team) => !seated.includes(team.id))
      .map((team) => ({ ...team, won: tally[team.id] ?? 0 }))
      .sort(
        (one, other) =>
          other.won - one.won || one.name.localeCompare(other.name, 'es', { sensitivity: 'base' }),
      );
  });

  /** Called straight from the tap. */
  open(side: TeamId): void {
    this.side.set(side);
    this.sheet().open();
  }

  close(): void {
    this.sheet().close();
  }

  protected changePlayers(): void {
    this.sheet().close();
    this.editTeam.emit(this.edits.side(this.side()));
  }

  protected newTeam(): void {
    this.sheet().close();
    this.editTeam.emit(this.edits.newAtSide(this.side()));
  }

  protected choose(team: Option): void {
    this.sheet().close();
    if (this.store.tournament() !== null) {
      this.store.setSeat(this.side(), team.id);
      return;
    }
    this.store.seatTeam(this.side(), { name: team.name, players: team.players, saved: team.id });
  }
}
