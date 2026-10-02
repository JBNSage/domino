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
import { TEAM_IDS, TeamId } from '../game/state';
import { TablesStore } from '../game/tables.store';
import { Appearance, AppearanceChoice } from '../platform/appearance';
import { Choice, ChoiceGroup } from './choice-group';
import { Sheet } from './sheet';

/**
 * Everything that is not scoring: the tournament, the history, the teams, the
 * appearance and the way to clear the board. Each entry closes the menu and
 * opens its own surface in the same tap.
 */
@Component({
  selector: 'app-menu-sheet',
  imports: [Sheet, ChoiceGroup, FitText],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-sheet labelledBy="menu-sheet-title">
      <h2 class="title" id="menu-sheet-title">{{ copy.menu.title }}</h2>

      <div class="entries">
        @if (offerHome()) {
          <button type="button" class="slab lean entry" (click)="go(home)">
            <span class="entry-text">
              <span class="slab__label">{{ copy.menu.home }}</span>
              <span class="entry-meta">{{ copy.menu.homeHelp }}</span>
            </span>
          </button>
        }
        <button type="button" class="slab lean entry" (click)="go(tournament)">
          <span class="slab__label" [appFitText]="tournamentLabel()">{{ tournamentLabel() }}</span>
        </button>
        <button type="button" class="slab lean entry" (click)="go(history)">
          <span class="slab__label" [appFitText]="copy.menu.history">{{ copy.menu.history }}</span>
        </button>
        <button type="button" class="slab lean entry" (click)="go(stats)">
          <span class="slab__label" [appFitText]="copy.menu.stats">{{ copy.menu.stats }}</span>
        </button>
        <button
          type="button"
          class="slab lean entry"
          [attr.aria-label]="copy.menu.mesaA11y(mesa())"
          (click)="go(tables)"
        >
          <span class="entry-text">
            <span class="slab__label">{{ copy.menu.mesas }}</span>
            <span class="entry-meta">{{ copy.menu.mesa(mesa()) }}</span>
          </span>
        </button>
      </div>

      <!-- At Inicio there is no board in view to change or clear. -->
      @if (!store.atHome()) {
        <div class="group">
          <span class="label">{{ copy.menu.teams }}</span>
          <div class="teams">
            @for (team of teams(); track team.id) {
              <button
                type="button"
                class="slab slab--compact slab--team lean team"
                [style.--fill]="'var(--c-team-' + team.id + ')'"
                [attr.aria-label]="copy.menu.teamA11y(team.name)"
                (click)="go(editTeam, team.id)"
              >
                <span class="slab__label" [appFitText]="team.name">{{ team.name }}</span>
              </button>
            }
          </div>
        </div>
      }

      <app-choice-group
        [label]="copy.appearance.label"
        [options]="appearances"
        [value]="appearance.choice()"
        (valueChange)="choose($event)"
      />

      <div class="slab-row" [class.alone]="store.atHome()">
        <button type="button" class="slab slab--compact lean" (click)="sheet().close()">
          <span class="slab__label" [appFitText]="copy.menu.close">{{ copy.menu.close }}</span>
        </button>
        @if (!store.atHome()) {
          <button
            type="button"
            class="slab slab--compact slab--warn lean clear"
            (click)="go(reset)"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 7h16" />
              <path d="M9 7V4h6v3" />
              <path d="M6 7l1 13h10l1-13" />
              <path d="M10 11v6M14 11v6" />
            </svg>
            <span class="slab__label" [appFitText]="copy.menu.reset">{{ copy.menu.reset }}</span>
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
    }

    .entries {
      display: flex;
      flex-direction: column;
      gap: var(--s-md);
    }

    .entry {
      justify-content: flex-start;
      margin: 0 var(--s-sm);
    }

    .entry-text {
      min-width: 0;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      padding: var(--s-xs) 0;
      white-space: normal;
      text-align: left;
    }

    /* The mesa in use, which may be long: it wraps, never cut. */
    .entry-meta {
      color: var(--c-muted);
      font: italic 600 var(--t-label) / 1.3 var(--font);
      overflow-wrap: break-word;
    }

    .group {
      display: flex;
      flex-direction: column;
      gap: var(--s-xs);
    }

    .label {
      color: var(--c-muted);
      font: italic 600 var(--t-label) / 1.3 var(--font);
      text-transform: uppercase;
    }

    /* Side by side; one above the other once large text needs the room. */
    .teams {
      display: flex;
      flex-wrap: wrap;
      gap: var(--s-sm);
    }

    .team {
      --lean-inset: 5px;

      flex: 1 1 9rem;
      padding: 0 var(--s-md);
    }

    @media (max-height: 36em) and (min-width: 30em) {
      .entries {
        flex-direction: row;
        flex-wrap: wrap;
      }

      .entry {
        flex: 1 1 10rem;
        min-height: var(--min-target);
      }
    }

    /* Alone, the closing slab sits at the left and is as wide as its label. */
    .alone .slab {
      flex: none;
      padding: 0 var(--s-lg);
    }

    .clear svg {
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
export class MenuSheet {
  protected readonly copy = copy;
  protected readonly appearance = inject(Appearance);
  protected readonly appearances: Choice<AppearanceChoice>[] = [
    { value: 'system', label: copy.appearance.system },
    { value: 'light', label: copy.appearance.light },
    { value: 'dark', label: copy.appearance.dark },
  ];

  /** A new tournament, or the table of the one being played. */
  readonly tournament = output<void>();
  readonly history = output<void>();
  readonly stats = output<void>();
  /** The mesas, to choose where the match is played. */
  readonly tables = output<void>();
  readonly editTeam = output<TeamId>();
  /** Back to Inicio, to choose how the next match is played. */
  readonly home = output<void>();
  // eslint-disable-next-line @angular-eslint/no-output-native
  readonly reset = output<void>();

  protected readonly store = inject(GameStore);
  private readonly mesas = inject(TablesStore);
  protected readonly sheet = viewChild.required(Sheet);

  protected readonly tournamentLabel = computed(() =>
    this.store.tournament() === null ? copy.menu.tournament : copy.menu.table,
  );
  /** Inicio is offered while nothing is being played and it is not already showing. */
  protected readonly offerHome = computed(() => this.store.idle() && !this.store.atHome());
  protected readonly mesa = computed(() => this.mesas.active()?.name ?? null);
  protected readonly teams = computed(() =>
    TEAM_IDS.map((id) => ({ id, name: this.store.state().teams[id].name })),
  );

  open(): void {
    this.sheet().open();
  }

  // The menu closes first, so focus comes back to the menu button when the next surface closes.
  protected go<T>(target: { emit: (value: T) => void }, value?: T): void {
    this.sheet().close();
    target.emit(value as T);
  }

  protected choose(choice: AppearanceChoice): void {
    this.appearance.set(choice);
    this.store.announce(copy.appearance.announce(copy.appearance[choice]));
  }
}
