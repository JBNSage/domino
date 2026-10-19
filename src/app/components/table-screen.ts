import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';

import { copy } from '../copy';
import { FitText } from '../directives/fit-text';
import { GameStore } from '../game/game.store';
import { renameTable } from '../game/tables';
import { SharingStore } from '../game/sharing.store';
import { TablesStore } from '../game/tables.store';
import { NameSheet } from './name-sheet';
import { Screen } from './screen';
import { Sheet } from './sheet';
import { TeamEdit } from './team-sheet';
import { TablePlayersScreen } from './table-players-screen';
import { TableTeamsScreen } from './table-teams-screen';

/** One mesa: its name, its sharing, and the way to its players and its saved teams. */
@Component({
  selector: 'app-table-screen',
  imports: [Screen, Sheet, NameSheet, TablePlayersScreen, TableTeamsScreen, FitText],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-screen [heading]="mesa()?.name ?? copy.tables.title">
      @if (mesa(); as mesa) {
        @if (mesa.shared; as shared) {
          <p class="note shared-note">
            {{ copy.tables.sharedSummary(shared.members.length) }}
            @if (!shared.owner) {
              <br />{{ copy.tables.watchOnly }}
            }
          </p>
        }
        @if (owner()) {
          <div class="tools">
            <button
              type="button"
              class="slab slab--compact lean"
              [attr.aria-label]="copy.tables.nameA11y(mesa.name)"
              (click)="rename()"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 20l1-4.5L16.5 4 20 7.5 8.5 19z" />
                <path d="M14 6.5l3.5 3.5" />
              </svg>
              <span class="slab__label" [appFitText]="copy.tables.rename">{{
                copy.tables.rename
              }}</span>
            </button>
            <button
              type="button"
              class="slab slab--compact lean"
              [attr.aria-label]="copy.share.startA11y(mesa.name)"
              [disabled]="sharing()"
              (click)="share()"
            >
              <!-- Three linked dots: this mesa goes to other phones. -->
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M7 12l9-5M7 12l9 5" />
                <circle cx="6" cy="12" r="2.5" />
                <circle cx="17.5" cy="6" r="2.5" />
                <circle cx="17.5" cy="18" r="2.5" />
              </svg>
              <span class="slab__label" [appFitText]="shareLabel()">{{ shareLabel() }}</span>
            </button>
          </div>
          <p class="note error" role="status">{{ shareFailed() ? copy.share.failed : '' }}</p>
        }

        <ul class="rows">
          <li>
            <button type="button" class="entry lean" (click)="players.open()">
              <span class="entry-name numerals">{{
                copy.tables.players(mesa.players.length)
              }}</span>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 5l6 7-6 7" /></svg>
            </button>
          </li>
          <li>
            <button type="button" class="entry lean" (click)="teams.open()">
              <span class="entry-name numerals">{{ copy.tables.teams(mesa.teams.length) }}</span>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 5l6 7-6 7" /></svg>
            </button>
          </li>
        </ul>
      }

      @if (owner()) {
        <button
          screenFooter
          type="button"
          class="slab slab--compact slab--warn lean"
          (click)="askRemove()"
        >
          <span class="slab__label" [appFitText]="copy.tables.remove">{{
            copy.tables.remove
          }}</span>
        </button>
      } @else {
        <button
          screenFooter
          type="button"
          class="slab slab--compact slab--warn lean"
          (click)="askLeave()"
        >
          <span class="slab__label" [appFitText]="copy.tables.leaveMesa">{{
            copy.tables.leaveMesa
          }}</span>
        </button>
      }
      <button
        screenFooter
        type="button"
        class="slab slab--filled lean play"
        [attr.aria-label]="copy.tables.playA11y(mesa()?.name ?? '')"
        (click)="play()"
      >
        <span class="slab__label" [appFitText]="playLabel()">{{ playLabel() }}</span>
      </button>
    </app-screen>

    <app-name-sheet />
    <app-table-players-screen #players [mesa]="mesa()" [owner]="owner()" />
    <app-table-teams-screen
      #teams
      [mesa]="mesa()"
      [owner]="owner()"
      (editTeam)="editTeam.emit($event)"
    />

    <app-sheet #ask accent="var(--c-danger)" labelledBy="table-remove-title">
      @if (asking() === 'leave') {
        <h2 class="title" id="table-remove-title">
          {{ copy.tables.leaveTitle(mesa()?.name ?? '') }}
        </h2>
        <div class="facts">
          <p>{{ copy.tables.leaveBody }}</p>
        </div>
      } @else {
        <h2 class="title" id="table-remove-title">
          {{ copy.tables.removeTitle(mesa()?.name ?? '') }}
        </h2>
        <div class="facts">
          <p>
            {{ copy.tables.removeBody(mesa()?.players?.length ?? 0, mesa()?.teams?.length ?? 0) }}
          </p>
          <p class="strong">
            {{ mesa()?.shared ? copy.tables.removeShared : copy.tables.removeUndo }}
          </p>
        </div>
      }
      <div class="actions">
        <button
          type="button"
          class="slab slab--danger lean"
          (click)="asking() === 'leave' ? leave() : remove()"
        >
          <span
            class="slab__label"
            [appFitText]="asking() === 'leave' ? copy.tables.leaveMesa : copy.tables.remove"
            >{{ asking() === 'leave' ? copy.tables.leaveMesa : copy.tables.remove }}</span
          >
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
    .tools {
      display: flex;
      flex-wrap: wrap;
      gap: var(--s-sm);
      padding: 0 var(--s-sm);
    }

    .tools .slab {
      flex: 0 1 auto;
      padding: 0 var(--s-lg);
    }

    .shared-note {
      color: var(--c-text);
    }

    .play {
      --fill: var(--c-text);
      --label: var(--c-ground);
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

    .rows {
      display: flex;
      flex-direction: column;
      gap: var(--s-sm);
      margin: 0;
      padding: 0;
      list-style: none;
    }

    /* Same row as a mesa in the list: it opens what it names. */
    .entry {
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

    .entry:active::before {
      opacity: var(--pressed);
    }

    @media (hover: hover) {
      .entry:hover::before {
        filter: brightness(1.12);
      }
    }

    .entry-name {
      flex: 1;
      min-width: 0;
      font: italic 800 var(--t-button) / 1.2 var(--font);
      text-transform: uppercase;
      overflow-wrap: break-word;
    }

    .entry svg {
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
  `,
})
export class TableScreen {
  protected readonly copy = copy;

  /** Asks for the team sheet, which the shell owns. */
  readonly editTeam = output<TeamEdit>();
  /** Asks for the screen that shares the mesa, which the shell owns. */
  readonly openShare = output<string>();
  /** The mesa is now played at: the screens above the board close. */
  readonly played = output<void>();

  private readonly store = inject(GameStore);
  private readonly tables = inject(TablesStore);
  private readonly sharingStore = inject(SharingStore);
  private readonly screen = viewChild.required(Screen);
  private readonly names = viewChild.required(NameSheet);
  private readonly ask = viewChild.required<Sheet>('ask');

  private readonly id = signal<string | null>(null);

  protected readonly mesa = computed(
    () => this.tables.tables().tables.find((table) => table.id === this.id()) ?? null,
  );

  /** Owners change a shared mesa; a mesa kept on this phone is always this phone's. */
  protected readonly owner = computed(() => {
    const mesa = this.mesa();
    return mesa !== null && (mesa.shared === undefined || mesa.shared.owner);
  });
  protected readonly sharing = signal(false);
  protected readonly shareFailed = signal(false);
  protected readonly shareLabel = computed(() =>
    this.sharing() ? copy.share.starting : copy.share.start,
  );
  protected readonly playLabel = computed(() =>
    this.mesa()?.shared?.scores === false ? copy.tables.view : copy.tables.play,
  );
  protected readonly asking = signal<'remove' | 'leave'>('remove');

  constructor() {
    // Deleted or left, here or on another phone: the screens of the mesa close together.
    // While it is being shared it moves to a new id, so it is briefly not found.
    effect(() => {
      if (this.id() !== null && this.mesa() === null && !this.sharing()) {
        untracked(() => this.screen().close());
      }
    });
  }

  open(id: string): void {
    this.id.set(id);
    this.shareFailed.set(false);
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

  /** Plays at this mesa; at a clean board its first two teams are chosen next. */
  protected play(): void {
    const mesa = this.mesa();
    if (mesa === null) return;
    this.screen().close();
    this.store.chooseTable(mesa.id);
    this.store.announce(copy.tables.announce(mesa.name));
    this.played.emit();
  }

  /** Moves the mesa to the cloud the first time, then opens the screen that shares it. */
  protected async share(): Promise<void> {
    const mesa = this.mesa();
    if (mesa === null || this.sharing()) return;
    if (mesa.shared) {
      this.openShare.emit(mesa.id);
      return;
    }
    this.sharing.set(true);
    this.shareFailed.set(false);
    const shared = await this.sharingStore.share(mesa.id);
    this.sharing.set(false);
    if (shared === null) {
      this.shareFailed.set(true);
      return;
    }
    // In the cloud the mesa has a new id; this screen and the next follow it.
    this.id.set(shared);
    this.openShare.emit(shared);
  }

  protected askRemove(): void {
    const mesa = this.mesa();
    if (mesa === null) return;
    this.asking.set('remove');
    if (!mesa.shared && mesa.players.length === 0 && mesa.teams.length === 0) this.remove();
    else this.ask().open();
  }

  protected askLeave(): void {
    this.asking.set('leave');
    this.ask().open();
  }

  protected async remove(): Promise<void> {
    const mesa = this.mesa();
    this.ask().close();
    if (mesa === null) return;
    if (!mesa.shared) {
      this.screen().close();
      this.store.removeTable(mesa.id);
      return;
    }
    // A shared mesa goes for everyone, at once.
    if (await this.sharingStore.deleteMesa(mesa.id)) this.screen().close();
    else this.store.announce(copy.tables.removeFailed);
  }

  protected async leave(): Promise<void> {
    const mesa = this.mesa();
    this.ask().close();
    if (mesa === null) return;
    this.screen().close();
    await this.sharingStore.leave(mesa.id);
    this.store.announce(copy.tables.leaving(mesa.name));
  }
}
