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
import { Screen } from './screen';

/** Where the match is played: at one of the mesas, or at none. */
@Component({
  selector: 'app-tables-screen',
  imports: [Screen, NameSheet, FitText],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-screen [heading]="copy.tables.title">
      <p class="intro">{{ copy.tables.intro }}</p>

      <ul class="rows">
        <li class="row">
          <button
            type="button"
            class="choice lean"
            [class.choice--on]="activeId() === null"
            [attr.aria-current]="activeId() === null ? 'true' : null"
            [attr.aria-label]="copy.tables.noneA11y"
            (click)="choose(null)"
          >
            <span class="who">
              <span class="name">{{ copy.tables.none }}</span>
              <span class="meta">{{ copy.tables.noneHelp }}</span>
            </span>
            @if (activeId() === null) {
              <span class="in-use">{{ copy.tables.inUse }}</span>
            }
          </button>
        </li>
        @for (table of rows(); track table.id) {
          <li class="row">
            <button
              type="button"
              class="choice lean"
              [class.choice--on]="table.active"
              [attr.aria-current]="table.active ? 'true' : null"
              [attr.aria-label]="copy.tables.chooseA11y(table.name, table.summary)"
              (click)="choose(table.id)"
            >
              <span class="who">
                <span class="name" [appFitText]="table.name">{{ table.name }}</span>
                <span class="meta numerals">{{ table.summary }}</span>
              </span>
              @if (table.active) {
                <span class="in-use">{{ copy.tables.inUse }}</span>
              }
            </button>
            <button
              type="button"
              class="edit"
              [attr.aria-label]="copy.tables.editA11y(table.name)"
              (click)="edit.emit(table.id)"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 20l1-4.5L16.5 4 20 7.5 8.5 19z" />
                <path d="M14 6.5l3.5 3.5" />
              </svg>
            </button>
          </li>
        }
      </ul>

      @if (full()) {
        <p class="intro">{{ copy.tables.full }}</p>
      } @else {
        <button type="button" class="slab slab--compact lean add" (click)="create()">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
          <span class="slab__label" [appFitText]="copy.tables.add">{{ copy.tables.add }}</span>
        </button>
      }
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

    .row {
      display: flex;
      align-items: center;
      gap: var(--s-xs);
    }

    .choice {
      --fill: var(--c-surface);
      --lean-inset: 8px;

      flex: 1;
      min-width: 0;
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

    .name {
      font: italic 800 var(--t-button) / 1.2 var(--font);
      text-transform: uppercase;
    }

    .meta {
      font: italic 600 var(--t-label) / 1.3 var(--font);
      text-transform: uppercase;
      opacity: 0.8;
    }

    .in-use {
      flex: none;
      font: italic 800 var(--t-label) / 1.3 var(--font);
      letter-spacing: 0.4px;
      text-transform: uppercase;
    }

    .edit {
      flex: none;
      display: grid;
      place-items: center;
      width: var(--min-target);
      height: var(--min-target);
      padding: 0;
      border: 0;
      background: none;
    }

    .edit:active {
      opacity: var(--pressed);
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

    .edit svg {
      stroke: var(--c-muted);
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

  private readonly store = inject(GameStore);
  private readonly tables = inject(TablesStore);
  private readonly screen = viewChild.required(Screen);
  private readonly names = viewChild.required(NameSheet);

  protected readonly activeId = computed(() => this.tables.tables().active);
  protected readonly full = computed(() => this.tables.tables().tables.length >= MAX_TABLES);
  protected readonly rows = computed(() =>
    this.tables.tables().tables.map((table) => ({
      id: table.id,
      name: table.name,
      summary: copy.tables.summary(table.players.length, table.teams.length),
      active: table.id === this.activeId(),
    })),
  );

  open(): void {
    this.screen().open();
  }

  close(): void {
    this.screen().close();
  }

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
        this.store.announce(copy.tables.announce(name));
        // A new mesa is empty: straight to adding its players.
        this.edit.emit(id);
      },
    });
  }
}
