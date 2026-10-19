import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  untracked,
  viewChild,
} from '@angular/core';

import { copy } from '../copy';
import { FitText } from '../directives/fit-text';
import { HistoryStore } from '../game/history.store';
import { sameName } from '../game/state';
import { MAX_SAVED_TEAMS, SavedTeam, Table } from '../game/tables';
import { teamWinsAt } from '../game/stats';
import { PlayerPair } from './player-pair';
import { Screen } from './screen';
import { TeamEdit } from './team-sheet';
import { TeamEdits } from './team-edits';

/** The teams kept at one mesa, with the matches each pair won there. */
@Component({
  selector: 'app-table-teams-screen',
  imports: [Screen, PlayerPair, FitText],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-screen [heading]="copy.tables.teamsTitle">
      @if (mesa(); as mesa) {
        <p class="facts numerals">{{ copy.tables.teamsFacts(mesa.name, mesa.teams.length) }}</p>

        @if (mesa.teams.length === 0) {
          <p class="note">{{ owner() ? copy.tables.noTeams : copy.tables.noTeamsWatch }}</p>
        } @else {
          <ol class="teams">
            @for (team of teams(); track team.id) {
              <li>
                <button
                  type="button"
                  class="team lean"
                  [attr.aria-label]="copy.tables.teamA11y(team.name, team.players, team.won)"
                  [disabled]="!owner()"
                  (click)="editTeam.emit(edits.saved(mesa.id, team, team.name))"
                >
                  <span class="who">
                    <span class="team-name">{{ team.name }}</span>
                    @if (team.players; as players) {
                      <app-player-pair class="team-players" [players]="players" [wrap]="true" />
                    } @else {
                      <span class="team-players">{{ copy.players.none }}</span>
                    }
                  </span>
                  <span class="team-wins numerals">{{ copy.tournament.wins(team.won) }}</span>
                </button>
              </li>
            }
          </ol>
        }

        @if (!owner()) {
          <!-- Only owners keep teams. -->
        } @else if (full()) {
          <p class="note">{{ copy.tables.teamsFull }}</p>
        } @else {
          <button type="button" class="slab slab--compact lean add" (click)="add()">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
            <span class="slab__label" [appFitText]="copy.tables.addTeam">{{
              copy.tables.addTeam
            }}</span>
          </button>
        }
      }
    </app-screen>
  `,
  styles: `
    .facts {
      margin: 0;
      padding: 0 var(--s-sm);
      color: var(--c-muted);
      font: italic 600 var(--t-label) / 1.5 var(--font);
      text-transform: uppercase;
      overflow-wrap: anywhere;
    }

    .note {
      margin: 0;
      padding: 0 var(--s-sm);
      max-width: 40ch;
      color: var(--c-muted);
      line-height: 1.35;
    }

    .teams {
      display: flex;
      flex-direction: column;
      gap: var(--s-sm);
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .team {
      --fill: var(--c-surface);
      --lean-inset: 8px;

      width: 100%;
      min-height: calc(var(--min-target) + 12px);
      display: flex;
      align-items: center;
      gap: var(--s-md);
      padding: var(--s-sm) min(var(--s-xl), 6vw);
      border: 0;
      background: none;
      color: var(--c-text);
      text-align: left;
    }

    .team:disabled {
      cursor: default;
    }

    button.team:not(:disabled):active::before {
      opacity: var(--pressed);
    }

    @media (hover: hover) {
      button.team:not(:disabled):hover::before {
        filter: brightness(1.12);
      }
    }

    .who {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
    }

    .team-name {
      font: italic 800 var(--t-button) / 1.2 var(--font);
      text-transform: uppercase;
      overflow-wrap: break-word;
    }

    .team-players,
    .team-wins {
      color: var(--c-muted);
      font: italic 600 var(--t-label) / 1.3 var(--font);
      text-transform: uppercase;
    }

    .team-wins {
      flex: none;
    }

    .add {
      align-self: flex-start;
      max-width: calc(100% - var(--s-lg));
      margin: 0 var(--s-sm);
    }

    svg {
      flex: none;
      width: 20px;
      height: 20px;
      fill: none;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
  `,
})
export class TableTeamsScreen {
  protected readonly copy = copy;
  protected readonly edits = inject(TeamEdits);

  /** The mesa shown; null once it is gone, which closes the screen. */
  readonly mesa = input.required<Table | null>();
  /** Owners change a shared mesa; a mesa kept on this phone is always this phone's. */
  readonly owner = input.required<boolean>();
  /** Asks for the team sheet, which the shell owns. */
  readonly editTeam = output<TeamEdit>();

  private readonly history = inject(HistoryStore);
  private readonly screen = viewChild.required(Screen);

  protected readonly teams = computed(() => {
    const mesa = this.mesa();
    if (mesa === null) return [];
    // A saved team's wins are those its two players won together here.
    const history = this.history.history();
    return mesa.teams.map((team) => ({ ...team, won: teamWinsAt(history, mesa, team) }));
  });

  protected readonly full = computed(() => (this.mesa()?.teams.length ?? 0) >= MAX_SAVED_TEAMS);

  constructor() {
    // Deleted or left, here or on another phone: there is nothing left to show.
    effect(() => {
      if (this.mesa() === null) untracked(() => this.screen().close());
    });
  }

  open(): void {
    this.screen().open();
  }

  protected add(): void {
    const mesa = this.mesa();
    if (mesa === null) return;
    this.editTeam.emit(this.edits.saved(mesa.id, null, this.freeName(mesa.teams)));
  }

  /** "Equipo 3", or the next number no saved team uses. */
  private freeName(teams: SavedTeam[]): string {
    let number = teams.length + 1;
    while (teams.some((team) => sameName(team.name, copy.tournament.defaultName(number)))) {
      number += 1;
    }
    return copy.tournament.defaultName(number);
  }
}
