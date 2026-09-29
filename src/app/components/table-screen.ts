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
import { MAX_PLAYER_LENGTH, cleanPlayer, sameName } from '../game/state';
import {
  MAX_SAVED_TEAMS,
  MAX_TABLE_PLAYERS,
  SavedTeam,
  addPlayer,
  playerNamed,
  renamePlayer,
  renameTable,
  teamsUsing,
} from '../game/tables';
import { TablesStore } from '../game/tables.store';
import { NameSheet } from './name-sheet';
import { PlayerPair } from './player-pair';
import { Screen } from './screen';
import { Sheet } from './sheet';
import { TeamEdit } from './team-sheet';
import { TeamEdits } from './team-edits';

/** One mesa: its name, the people who play there, and the teams they form. */
@Component({
  selector: 'app-table-screen',
  imports: [Screen, Sheet, NameSheet, PlayerPair, FitText],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-screen [heading]="mesa()?.name ?? copy.tables.title">
      @if (mesa(); as mesa) {
        <button
          type="button"
          class="rename lean"
          [attr.aria-label]="copy.tables.nameA11y(mesa.name)"
          (click)="rename()"
        >
          <span class="who">
            <span class="label">{{ copy.tables.nameLabel }}</span>
            <span class="value" [appFitText]="mesa.name">{{ mesa.name }}</span>
          </span>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 20l1-4.5L16.5 4 20 7.5 8.5 19z" />
            <path d="M14 6.5l3.5 3.5" />
          </svg>
        </button>

        <section class="part">
          <h3 class="heading numerals">{{ copy.tables.players(mesa.players.length) }}</h3>
          @if (mesa.players.length === 0) {
            <p class="note">{{ copy.tables.noPlayers }}</p>
          } @else {
            <ul class="chips">
              @for (player of mesa.players; track player) {
                <li>
                  <button
                    type="button"
                    class="chip lean"
                    [attr.aria-label]="copy.tables.playerA11y(player)"
                    (click)="editPlayer(player)"
                  >
                    {{ player }}
                  </button>
                </li>
              }
            </ul>
          }

          @if (playersFull()) {
            <p class="note">{{ copy.tables.playersFull }}</p>
          } @else {
            <div class="new-player">
              <div class="field">
                <label class="label" for="table-new-player">{{ copy.tables.addPlayer }}</label>
                <input
                  #field
                  id="table-new-player"
                  class="input"
                  type="text"
                  autocomplete="off"
                  autocapitalize="words"
                  autocorrect="off"
                  spellcheck="false"
                  enterkeyhint="done"
                  aria-describedby="table-new-player-message"
                  [class.invalid]="playerTaken()"
                  [attr.aria-invalid]="playerTaken() ? 'true' : null"
                  [attr.maxlength]="maxPlayer"
                  [value]="newPlayer()"
                  (input)="newPlayer.set(field.value)"
                  (keydown.enter)="$event.preventDefault(); addNewPlayer()"
                />
              </div>
              <button
                type="button"
                class="slab slab--compact lean add-player"
                [attr.aria-label]="copy.tables.addPlayer"
                [disabled]="!canAddPlayer()"
                (click)="addNewPlayer()"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
              </button>
            </div>
            <p
              class="note"
              id="table-new-player-message"
              role="status"
              [class.error]="playerTaken()"
            >
              {{ playerTaken() ? copy.tables.playerTaken : '' }}
            </p>
          }
        </section>

        <section class="part">
          <h3 class="heading numerals">{{ copy.tables.teams(mesa.teams.length) }}</h3>
          @if (mesa.teams.length === 0) {
            <p class="note">{{ copy.tables.noTeams }}</p>
          } @else {
            <ol class="teams">
              @for (team of teams(); track team.id) {
                <li>
                  <button
                    type="button"
                    class="team lean"
                    [attr.aria-label]="copy.tables.teamA11y(team.name, team.players, team.won)"
                    (click)="editTeam.emit(edits.saved(mesa.id, team, team.name))"
                  >
                    <span class="who">
                      <span class="team-name" [appFitText]="team.name">{{ team.name }}</span>
                      @if (team.players; as players) {
                        <app-player-pair class="team-players" [players]="players" />
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
          @if (teamsFull()) {
            <p class="note">{{ copy.tables.teamsFull }}</p>
          } @else {
            <button type="button" class="slab slab--compact lean add" (click)="addTeam()">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
              <span class="slab__label" [appFitText]="copy.tables.addTeam">{{
                copy.tables.addTeam
              }}</span>
            </button>
          }
        </section>
      }

      <button
        screenFooter
        type="button"
        class="slab slab--compact slab--warn lean"
        (click)="askRemove()"
      >
        <span class="slab__label" [appFitText]="copy.tables.remove">{{ copy.tables.remove }}</span>
      </button>
    </app-screen>

    <app-name-sheet />

    <app-sheet #ask accent="var(--c-danger)" labelledBy="table-remove-title">
      <h2 class="title" id="table-remove-title">
        {{ copy.tables.removeTitle(mesa()?.name ?? '') }}
      </h2>
      <div class="facts">
        <p>
          {{ copy.tables.removeBody(mesa()?.players?.length ?? 0, mesa()?.teams?.length ?? 0) }}
        </p>
        <p class="strong">{{ copy.tables.removeUndo }}</p>
      </div>
      <div class="actions">
        <button type="button" class="slab slab--danger lean" (click)="remove()">
          <span class="slab__label" [appFitText]="copy.tables.remove">{{
            copy.tables.remove
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
    .rename {
      --fill: var(--c-surface);
      --lean-inset: 8px;

      width: 100%;
      min-height: calc(var(--min-target) + 16px);
      display: flex;
      align-items: center;
      gap: var(--s-md);
      padding: var(--s-sm) min(var(--s-xl), 6vw);
      border: 0;
      background: none;
      color: var(--c-text);
      text-align: left;
    }

    .rename:active::before,
    .team:active::before,
    .chip:active::before {
      opacity: var(--pressed);
    }

    @media (hover: hover) {
      .rename:hover::before,
      .team:hover::before,
      .chip:hover::before {
        filter: brightness(1.12);
      }
    }

    .who {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
    }

    .label,
    .heading {
      margin: 0;
      color: var(--c-muted);
      font: italic 600 var(--t-label) / 1.3 var(--font);
      text-transform: uppercase;
    }

    .heading {
      padding: 0 var(--s-sm);
    }

    .value {
      font: italic 800 var(--t-button) / 1.2 var(--font);
      text-transform: uppercase;
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

    .rename svg {
      stroke: var(--c-muted);
    }

    .part {
      display: flex;
      flex-direction: column;
      gap: var(--s-md);
    }

    .note {
      margin: 0;
      padding: 0 var(--s-sm);
      max-width: 40ch;
      color: var(--c-muted);
      line-height: 1.35;
    }

    .note:empty {
      display: none;
    }

    .note.error {
      color: var(--c-danger);
    }

    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: var(--s-sm) var(--s-xs);
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .chip {
      --fill: var(--c-surface);
      --lean-inset: 4px;

      min-height: var(--min-target);
      max-width: 100%;
      padding: var(--s-xs) var(--s-lg);
      border: 0;
      background: none;
      color: var(--c-text);
      font: italic 800 var(--t-body) / 1.2 var(--font);
      text-transform: uppercase;
      overflow-wrap: anywhere;
    }

    .new-player {
      display: flex;
      align-items: flex-end;
      gap: var(--s-md);
      padding: 0 var(--s-sm);
    }

    .field {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
    }

    .label {
      margin-bottom: var(--s-xs);
    }

    /* 16px or more, or iOS zooms the page. */
    .input {
      width: 100%;
      min-height: var(--min-target);
      padding: var(--s-xs) 0;
      border: 0;
      border-bottom: 2px solid var(--c-line);
      border-radius: 0;
      background: none;
      color: var(--c-text);
      caret-color: var(--c-text);
      font: italic 800 max(16px, var(--t-button)) / 1.2 var(--font);
      text-transform: uppercase;
    }

    .input:focus {
      border-bottom-color: var(--c-text);
    }

    .input.invalid {
      border-bottom-color: var(--c-danger);
    }

    .input:focus-visible {
      outline-offset: 0;
    }

    .add-player {
      flex: none;
      width: calc(var(--min-target) + 16px);
      padding: 0;
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

    .team-name {
      font: italic 800 var(--t-button) / 1.2 var(--font);
      text-transform: uppercase;
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

    .title {
      margin: 0;
      font: italic 800 var(--t-title) / 1.15 var(--font);
      text-transform: uppercase;
      text-wrap: balance;
      overflow-wrap: anywhere;
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
  `,
})
export class TableScreen {
  protected readonly copy = copy;
  protected readonly maxPlayer = MAX_PLAYER_LENGTH;
  protected readonly edits = inject(TeamEdits);

  /** Asks for the team sheet, which the shell owns. */
  readonly editTeam = output<TeamEdit>();

  private readonly store = inject(GameStore);
  private readonly tables = inject(TablesStore);
  private readonly screen = viewChild.required(Screen);
  private readonly names = viewChild.required(NameSheet);
  private readonly ask = viewChild.required<Sheet>('ask');

  private readonly id = signal<string | null>(null);
  protected readonly newPlayer = signal('');

  protected readonly mesa = computed(
    () => this.tables.tables().tables.find((table) => table.id === this.id()) ?? null,
  );

  protected readonly teams = computed(() => {
    const { tally } = this.store.state();
    return (this.mesa()?.teams ?? []).map((team) => ({ ...team, won: tally[team.id] ?? 0 }));
  });

  protected readonly playersFull = computed(
    () => (this.mesa()?.players.length ?? 0) >= MAX_TABLE_PLAYERS,
  );
  protected readonly teamsFull = computed(
    () => (this.mesa()?.teams.length ?? 0) >= MAX_SAVED_TEAMS,
  );
  protected readonly playerTaken = computed(() => {
    const mesa = this.mesa();
    return mesa !== null && playerNamed(mesa, this.newPlayer()) !== null;
  });
  protected readonly canAddPlayer = computed(
    () => cleanPlayer(this.newPlayer()) !== '' && !this.playerTaken(),
  );

  open(id: string): void {
    this.id.set(id);
    this.newPlayer.set('');
    this.screen().open();
  }

  protected rename(): void {
    const mesa = this.mesa();
    if (mesa === null) return;
    this.names().open({
      title: copy.tables.nameTitle,
      label: copy.tables.nameLabel,
      value: mesa.name,
      placeholder: null,
      taken: this.tables
        .tables()
        .tables.filter((table) => table.id !== mesa.id)
        .map((table) => table.name),
      takenMessage: copy.tables.nameTaken,
      emptyMessage: copy.tables.nameEmpty,
      confirm: copy.players.save,
      save: (name) => this.tables.change((tables) => renameTable(tables, mesa.id, name)),
    });
  }

  protected addNewPlayer(): void {
    const mesa = this.mesa();
    if (mesa === null || !this.canAddPlayer()) return;
    const name = cleanPlayer(this.newPlayer());
    this.tables.changeTable(mesa.id, (table) => addPlayer(table, name));
    this.newPlayer.set('');
    this.store.announce(copy.tables.playerAdded(name));
  }

  protected editPlayer(player: string): void {
    const mesa = this.mesa();
    if (mesa === null) return;
    const using = teamsUsing(mesa, player).map((team) => team.name);
    this.names().open({
      title: copy.tables.playerTitle,
      label: copy.tables.playerLabel,
      value: player,
      placeholder: null,
      taken: mesa.players.filter((other) => !sameName(other, player)),
      takenMessage: copy.tables.playerTaken,
      emptyMessage: copy.tables.playerEmpty,
      confirm: copy.players.save,
      save: (name) =>
        this.tables.changeTable(mesa.id, (table) => renamePlayer(table, player, name)),
      remove: {
        label: copy.tables.removePlayer,
        run: () => this.store.removeTablePlayer(mesa.id, player),
      },
      kept: using.length > 0 ? copy.tables.playerInUse(using) : null,
    });
  }

  protected addTeam(): void {
    const mesa = this.mesa();
    if (mesa === null) return;
    this.editTeam.emit(this.edits.saved(mesa.id, null, this.freeName(mesa.teams)));
  }

  protected askRemove(): void {
    const mesa = this.mesa();
    if (mesa === null) return;
    if (mesa.players.length === 0 && mesa.teams.length === 0) this.remove();
    else this.ask().open();
  }

  protected remove(): void {
    const mesa = this.mesa();
    this.ask().close();
    this.screen().close();
    if (mesa !== null) this.store.removeTable(mesa.id);
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
