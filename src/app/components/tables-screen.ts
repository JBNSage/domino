import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  output,
  viewChild,
} from '@angular/core';

import { copy } from '../copy';
import { FitText } from '../directives/fit-text';
import { GameStore } from '../game/game.store';
import { newId } from '../game/ids';
import { MAX_TABLES, addTable } from '../game/tables';
import { TablesStore } from '../game/tables.store';
import { NameSheet } from './name-sheet';
import { ScanScreen } from './scan-screen';
import { Screen } from './screen';

/** Where the match is played: at one of the mesas, or at none. */
@Component({
  selector: 'app-tables-screen',
  imports: [Screen, NameSheet, FitText],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-screen [heading]="copy.tables.title">
      <p class="intro">{{ copy.tables.intro }}</p>

      <div class="now">
        <p class="now-text">
          {{ active() ? copy.tables.playingAt(active()!.name) : copy.tables.playingNone }}
        </p>
        @if (active()) {
          <button type="button" class="slab slab--compact lean leave" (click)="choose(null)">
            <span class="slab__label" [appFitText]="copy.tables.leave">{{
              copy.tables.leave
            }}</span>
          </button>
        }
      </div>

      @if (rows().length > 0) {
        <ul class="rows">
          @for (table of rows(); track table.id) {
            <li>
              <button
                type="button"
                class="choice lean"
                [class.choice--on]="table.active"
                [attr.aria-label]="copy.tables.openA11y(table.name, table.summary, table.active)"
                (click)="edit.emit(table.id)"
              >
                <span class="who">
                  <span class="name">{{ table.name }}</span>
                  <span class="meta numerals">{{ table.summary }}</span>
                  @if (table.active) {
                    <span class="in-use">{{ copy.tables.inUse }}</span>
                  }
                </span>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 5l6 7-6 7" /></svg>
              </button>
            </li>
          }
        </ul>
      }

      @if (full()) {
        <p class="intro">{{ copy.tables.full }}</p>
      } @else {
        <button type="button" class="slab slab--compact lean add" (click)="create()">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
          <span class="slab__label" [appFitText]="copy.tables.add">{{ copy.tables.add }}</span>
        </button>
      }
      <!-- A mesa someone else shared: its code read here, in the app, or its link pasted. -->
      @if (canScan) {
        <button type="button" class="slab slab--compact lean add" (click)="scan.emit()">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 9V5h4M16 5h4v4M20 15v4h-4M8 19H4v-4M8 12h8" />
          </svg>
          <span class="slab__label" [appFitText]="copy.join.scan">{{ copy.join.scan }}</span>
        </button>
      }
      <button type="button" class="slab slab--compact lean add" (click)="joinLink.emit()">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1" />
          <path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1" />
        </svg>
        <span class="slab__label" [appFitText]="copy.join.byLink">{{ copy.join.byLink }}</span>
      </button>
    </app-screen>

    <app-name-sheet />
  `,
  styles: `
    .intro {
      margin: 0;
      padding: 0 var(--s-sm);
      max-width: 40ch;
      color: var(--c-muted);
      line-height: 1.35;
    }

    .rows {
      display: flex;
      flex-direction: column;
      gap: var(--s-sm);
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .now {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: var(--s-sm);
      padding: 0 var(--s-sm);
    }

    .now-text {
      margin: 0;
      max-width: 40ch;
      line-height: 1.35;
    }

    .leave {
      max-width: 100%;
    }

    .choice {
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

    .choice--on {
      --fill: var(--c-text);

      color: var(--c-ground);
    }

    .choice:active::before {
      opacity: var(--pressed);
    }

    @media (hover: hover) {
      .choice:not(.choice--on):hover::before {
        filter: brightness(1.12);
      }
    }

    .who {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
    }

    /* A mesa's name wraps rather than being cut. */
    .name {
      font: italic 800 var(--t-button) / 1.2 var(--font);
      text-transform: uppercase;
      overflow-wrap: break-word;
      hyphens: auto;
    }

    .meta {
      font: italic 600 var(--t-label) / 1.3 var(--font);
      text-transform: uppercase;
      opacity: 0.8;
    }

    .in-use {
      margin-top: var(--s-xs);
      font: italic 800 var(--t-label) / 1.3 var(--font);
      letter-spacing: 0.4px;
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

    .add {
      align-self: flex-start;
      max-width: calc(100% - var(--s-lg));
      margin: 0 var(--s-sm);
    }
  `,
})
export class TablesScreen {
  protected readonly copy = copy;

  /** Asks for one mesa, to change its players and teams. */
  readonly edit = output<string>();
  /** Asks for the screen that reads a mesa's QR with the camera, which the shell owns. */
  readonly scan = output<void>();
  protected readonly canScan = ScanScreen.available;
  /** Asks for the sheet that joins a mesa from a pasted link, which the shell owns. */
  readonly joinLink = output<void>();

  private readonly store = inject(GameStore);
  private readonly tables = inject(TablesStore);
  private readonly screen = viewChild.required(Screen);
  private readonly names = viewChild.required(NameSheet);

  protected readonly activeId = computed(() => this.tables.tables().active);
  protected readonly active = computed(() => this.tables.active());
  protected readonly full = computed(() => this.tables.tables().tables.length >= MAX_TABLES);
  protected readonly rows = computed(() =>
    this.tables.tables().tables.map((table) => ({
      id: table.id,
      name: table.name,
      summary: table.shared
        ? `${copy.tables.summary(table.players.length, table.teams.length)} · ${copy.tables.shared}`
        : copy.tables.summary(table.players.length, table.teams.length),
      active: table.id === this.activeId(),
    })),
  );

  open(): void {
    this.screen().open();
  }

  close(): void {
    this.screen().close();
  }

  /** Plays without a mesa from now on. */
  protected choose(id: string | null): void {
    this.screen().close();
    this.store.chooseTable(id);
    this.store.announce(copy.tables.announce(this.tables.active()?.name ?? null));
  }

  protected create(): void {
    const taken = this.tables.tables().tables.map((table) => table.name);
    this.names().open({
      title: copy.tables.newTitle,
      label: copy.tables.nameLabel,
      value: '',
      placeholder: copy.tables.namePlaceholder,
      taken,
      takenMessage: copy.tables.nameTaken,
      emptyMessage: copy.tables.nameEmpty,
      confirm: copy.tables.create,
      save: (name) => {
        const id = newId('m');
        this.tables.change((tables) => addTable(tables, id, name));
        // A new mesa is empty: straight to adding its players, then to playing there.
        this.edit.emit(id);
      },
    });
  }
}
