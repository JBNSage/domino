import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
  viewChild,
} from '@angular/core';

import { copy } from '../copy';
import { FitText } from '../directives/fit-text';
import { Member } from '../game/cloud';
import { GameStore } from '../game/game.store';
import { MAX_PLAYER_LENGTH, cleanPlayer, sameName } from '../game/state';
import { MAX_TABLE_PLAYERS, Table, addPlayer, playerNamed, teamsUsing } from '../game/tables';
import { TablesStore } from '../game/tables.store';
import { NameSheet } from './name-sheet';
import { Screen } from './screen';
import { Sheet } from './sheet';

/** The people who play at one mesa, one row each, and the field that adds the next. */
@Component({
  selector: 'app-table-players-screen',
  imports: [Screen, NameSheet, Sheet, FitText],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-screen [heading]="copy.tables.playersTitle">
      @if (mesa(); as mesa) {
        <p class="facts numerals">{{ copy.tables.playersFacts(mesa.name, mesa.players.length) }}</p>

        @if (mesa.players.length === 0) {
          <p class="note">{{ owner() ? copy.tables.noPlayers : copy.tables.noPlayersWatch }}</p>
        }

        <!-- First, where the thumb lands: a new name slots into the sorted list below. -->
        @if (!owner()) {
          <!-- Only owners add players. -->
        } @else if (full()) {
          <p class="note">{{ copy.tables.playersFull }}</p>
        } @else {
          <div class="add">
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
                  [class.invalid]="taken()"
                  [attr.aria-invalid]="taken() ? 'true' : null"
                  [attr.maxlength]="maxPlayer"
                  [value]="newPlayer()"
                  (input)="newPlayer.set(field.value)"
                  (keydown.enter)="$event.preventDefault(); add()"
                />
              </div>
              <button
                type="button"
                class="slab slab--compact lean add-player"
                [attr.aria-label]="copy.tables.addPlayer"
                [disabled]="!canAdd()"
                (click)="add()"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
              </button>
            </div>
            <p class="note" id="table-new-player-message" role="status" [class.error]="taken()">
              {{ taken() ? copy.tables.playerTaken : '' }}
            </p>
          </div>
        }

        @if (rows().length > 0) {
          <ul class="rows">
            @for (row of rows(); track row.name) {
              <li>
                @if (row.member; as member) {
                  <!-- A person in the mesa: their name is theirs to change. -->
                  <div class="row row--member lean">
                    <span class="who">
                      <span class="name">{{ row.name }}</span>
                      @if (row.teams) {
                        <span class="line">{{ row.teams }}</span>
                      }
                    </span>
                    <span class="role">{{ copy.tables.role(member.owner, member.scores) }}</span>
                  </div>
                } @else if (owner()) {
                  <button type="button" class="row lean" (click)="edit(row.name)">
                    <span class="who">
                      <span class="name">{{ row.name }}</span>
                      @if (row.teams) {
                        <span class="line">{{ row.teams }}</span>
                      }
                    </span>
                    <span class="sr-only">. {{ copy.tables.playerEdit }}</span>
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M4 20l1-4.5L16.5 4 20 7.5 8.5 19z" />
                      <path d="M14 6.5l3.5 3.5" />
                    </svg>
                  </button>
                } @else {
                  <div class="row lean">
                    <span class="who">
                      <span class="name">{{ row.name }}</span>
                      @if (row.teams) {
                        <span class="line">{{ row.teams }}</span>
                      }
                    </span>
                  </div>
                }
              </li>
            }
          </ul>
        }
      }
    </app-screen>

    <app-name-sheet />

    <!-- A name written by hand is a person who joined: asked before their matches are rewritten. -->
    <app-sheet #ask labelledBy="table-merge-title">
      @if (merging(); as merging) {
        <h2 class="title" id="table-merge-title">
          {{ copy.tables.mergeTitle(merging.from, merging.member.name) }}
        </h2>
        <div class="facts">
          <p>{{ copy.tables.mergeBody(merging.from, merging.member.name) }}</p>
          <p class="strong">{{ copy.tables.mergeIrreversible }}</p>
        </div>
      }
      <div class="actions">
        <button type="button" class="slab slab--primary lean confirm" (click)="merge()">
          <span class="slab__label" [appFitText]="copy.tables.mergeConfirm">{{
            copy.tables.mergeConfirm
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

    .note:empty {
      display: none;
    }

    .note.error {
      color: var(--c-danger);
    }

    .add {
      display: flex;
      flex-direction: column;
      gap: var(--s-sm);
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
      margin: 0 0 var(--s-xs);
      color: var(--c-muted);
      font: italic 600 var(--t-label) / 1.3 var(--font);
      text-transform: uppercase;
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

    .rows {
      display: flex;
      flex-direction: column;
      gap: var(--s-sm);
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .row {
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

    /* A person in the mesa, not a name written by hand: outlined, not filled. */
    .row--member {
      --fill: transparent;
      --edge: var(--c-line);
    }

    button.row:active::before {
      opacity: var(--pressed);
    }

    @media (hover: hover) {
      button.row:hover::before {
        filter: brightness(1.12);
      }
    }

    .who {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
    }

    .name {
      font: italic 800 var(--t-button) / 1.2 var(--font);
      text-transform: uppercase;
      overflow-wrap: anywhere;
    }

    .line,
    .role {
      color: var(--c-muted);
      font: italic 600 var(--t-label) / 1.3 var(--font);
      text-transform: uppercase;
    }

    .role {
      flex: none;
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

    .row svg {
      color: var(--c-muted);
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

    .confirm {
      --fill: var(--c-text);
      --edge: transparent;
      --label: var(--c-ground);
    }
  `,
})
export class TablePlayersScreen {
  protected readonly copy = copy;
  protected readonly maxPlayer = MAX_PLAYER_LENGTH;

  /** The mesa shown; null once it is gone, which closes the screen. */
  readonly mesa = input.required<Table | null>();
  /** Owners change a shared mesa; a mesa kept on this phone is always this phone's. */
  readonly owner = input.required<boolean>();

  private readonly store = inject(GameStore);
  private readonly tables = inject(TablesStore);
  private readonly screen = viewChild.required(Screen);
  private readonly names = viewChild.required(NameSheet);
  private readonly ask = viewChild.required<Sheet>('ask');

  protected readonly newPlayer = signal('');
  /** The written player and the person they are said to be, while the question is open. */
  protected readonly merging = signal<{ from: string; member: Member } | null>(null);

  protected readonly rows = computed(() => {
    const mesa = this.mesa();
    if (mesa === null) return [];
    return mesa.players.map((name) => {
      const teams = teamsUsing(mesa, name).map((team) => team.name);
      return {
        name,
        member: mesa.shared?.members.find((member) => sameName(member.name, name)) ?? null,
        teams: teams.length > 0 ? copy.tables.playerTeams(teams) : null,
      };
    });
  });

  protected readonly full = computed(() => (this.mesa()?.players.length ?? 0) >= MAX_TABLE_PLAYERS);
  protected readonly taken = computed(() => {
    const mesa = this.mesa();
    return mesa !== null && playerNamed(mesa, this.newPlayer()) !== null;
  });
  protected readonly canAdd = computed(() => cleanPlayer(this.newPlayer()) !== '' && !this.taken());

  constructor() {
    // Deleted or left, here or on another phone: there is nothing left to show.
    effect(() => {
      if (this.mesa() === null) untracked(() => this.screen().close());
    });
  }

  open(): void {
    this.newPlayer.set('');
    this.screen().open();
  }

  protected add(): void {
    const mesa = this.mesa();
    if (mesa === null || !this.canAdd()) return;
    const name = cleanPlayer(this.newPlayer());
    this.tables.changeTable(mesa.id, (table) => addPlayer(table, name));
    this.newPlayer.set('');
    this.store.announce(copy.tables.playerAdded(name));
  }

  protected edit(player: string): void {
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
      save: (name) => this.store.renameTablePlayer(mesa.id, player, name),
      remove: {
        label: copy.tables.removePlayer,
        run: () => this.store.removeTablePlayer(mesa.id, player),
      },
      kept: using.length > 0 ? copy.tables.playerInUse(using) : null,
      people: this.peopleFor(mesa, player),
    });
  }

  /** At a shared mesa, for an owner, the people a written name may turn out to be. */
  private peopleFor(mesa: Table, player: string) {
    const members = mesa.shared?.members ?? [];
    if (!this.owner() || members.length === 0) return null;
    return {
      heading: copy.tables.mergeHeading,
      help: copy.tables.mergeHelp,
      options: members.map((member) => ({
        label: copy.tables.mergeOption(member.name),
        pick: () => this.askMerge(player, member),
      })),
    };
  }

  /** Opened from the tap on the person, once the name sheet has closed. */
  private askMerge(from: string, member: Member): void {
    this.merging.set({ from, member });
    this.ask().open();
  }

  protected merge(): void {
    const mesa = this.mesa();
    const merging = this.merging();
    this.ask().close();
    if (mesa === null || merging === null) return;
    this.store.mergeTablePlayer(mesa.id, merging.from, merging.member.uid);
  }
}
