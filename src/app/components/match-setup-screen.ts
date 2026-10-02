import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  output,
  untracked,
  viewChild,
} from '@angular/core';

import { copy } from '../copy';
import { FitText } from '../directives/fit-text';
import { GameStore } from '../game/game.store';
import { TEAM_IDS, TeamId, sharedPlayer } from '../game/state';
import { TablesStore } from '../game/tables.store';
import { Screen } from './screen';
import { Seat, Seats } from './seats';
import { SettingsFocus } from './settings-sheet';

/**
 * Personalizar partida, from Inicio: the two teams, the meta and the quick
 * points, each changed from its own sheet, then the start. The board is clean,
 * so what is chosen here is written to it straight away and kept on the way back.
 */
@Component({
  selector: 'app-match-setup-screen',
  imports: [Screen, Seats, FitText],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-screen [heading]="copy.setup.title">
      <p class="lead" id="match-setup-lead">{{ lead() }}</p>

      <app-seats
        [seats]="seats()"
        [showWins]="showWins()"
        [icon]="atTable() ? 'swap' : 'edit'"
        describedBy="match-setup-lead"
        (pick)="editSide.emit($event)"
      />

      @if (shared(); as player) {
        <p class="shared" role="status">{{ copy.tournament.shared(player) }}</p>
      }

      <section class="rules" aria-labelledby="match-setup-rules">
        <h3 class="heading" id="match-setup-rules">{{ copy.setup.rules }}</h3>
        <div class="values">
          <button
            type="button"
            class="slab slab--compact lean value"
            [attr.aria-label]="copy.setup.targetA11y(target())"
            (click)="editValue.emit('target')"
          >
            <span class="value__text">
              <span class="value__label">{{ copy.setup.target }}</span>
              <span class="value__number numerals" [appFitText]="target()">{{ target() }}</span>
            </span>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 20l1-4.5L16.5 4 20 7.5 8.5 19z" />
              <path d="M14 6.5l3.5 3.5" />
            </svg>
          </button>
          <button
            type="button"
            class="slab slab--compact lean value"
            [attr.aria-label]="copy.setup.quickA11y(quick())"
            (click)="editValue.emit('quick')"
          >
            <span class="value__text">
              <span class="value__label">{{ copy.setup.quick }}</span>
              <span class="value__number numerals" [appFitText]="copy.bar.quick(quick())">{{
                copy.bar.quick(quick())
              }}</span>
            </span>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 20l1-4.5L16.5 4 20 7.5 8.5 19z" />
              <path d="M14 6.5l3.5 3.5" />
            </svg>
          </button>
        </div>
      </section>

      <button
        screenFooter
        type="button"
        class="slab slab--filled lean start"
        [disabled]="shared() !== null"
        (click)="start()"
      >
        <span class="slab__label" [appFitText]="copy.tournament.startMatch">{{
          copy.tournament.startMatch
        }}</span>
      </button>
    </app-screen>
  `,
  styles: `
    .lead {
      margin: 0;
      padding: 0 var(--s-sm);
      max-width: 34ch;
      color: var(--c-muted);
    }

    .shared {
      margin: 0;
      padding: 0 var(--s-sm);
      max-width: 40ch;
      color: var(--c-danger);
      line-height: 1.35;
    }

    .rules {
      display: flex;
      flex-direction: column;
      gap: var(--s-sm);
    }

    .heading {
      margin: 0;
      padding: 0 var(--s-sm);
      color: var(--c-muted);
      font: italic 600 var(--t-label) / 1.3 var(--font);
      text-transform: uppercase;
    }

    /* Side by side; one above the other once large text needs the room. */
    /*
     * The row's outer corners sit on the seat slabs' corners above: their layer is
     * inset 18 and leans across 120, these are inset 5 and lean across 64.
     */
    .values {
      display: flex;
      flex-wrap: wrap;
      gap: var(--s-sm);
      padding: 0 7px;
    }

    .value {
      --lean-inset: 5px;

      flex: 1 1 8rem;
      justify-content: flex-start;
      min-height: 64px;
      padding: var(--s-xs) var(--s-lg) var(--s-xs) var(--s-xl);
    }

    /* The label over its value, so both labels keep one size at any width. */
    .value__text {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }

    .value__text > * {
      max-width: 100%;
    }

    .value__label {
      color: var(--c-muted);
      font: italic 600 var(--t-label) / 1.3 var(--font);
      letter-spacing: 0;
    }

    .value__number {
      font-size: var(--t-title);
      line-height: 1.1;
      letter-spacing: 0;
    }

    .value svg {
      flex: none;
      width: 16px;
      height: 16px;
      margin-left: auto;
      fill: none;
      stroke: var(--c-muted);
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .start:not(:disabled) {
      --fill: var(--c-text);
      --label: var(--c-ground);
    }
  `,
})
export class MatchSetupScreen {
  protected readonly copy = copy;
  private readonly store = inject(GameStore);
  private readonly tables = inject(TablesStore);

  /** Asks for a side to be changed: its team, or at a mesa another team. */
  readonly editSide = output<TeamId>();
  /** Asks for the meta or the quick points. */
  readonly editValue = output<SettingsFocus>();

  private readonly screen = viewChild.required(Screen);
  private readonly seatSlabs = viewChild.required(Seats);

  protected readonly atTable = computed(() => this.tables.active() !== null);
  protected readonly target = computed(() => this.store.state().target);
  protected readonly quick = computed(() => this.store.state().quickValue);

  protected readonly seats = computed<Seat[]>(() => {
    const { teams } = this.store.state();
    return TEAM_IDS.map((side) => ({
      side,
      name: teams[side].name,
      players: teams[side].players,
      won: teams[side].roundsWon,
      enters: false,
    }));
  });

  // Wins matter where they were won: at a mesa, or for teams that have already played.
  protected readonly showWins = computed(
    () => this.atTable() || this.seats().some((seat) => seat.won > 0),
  );

  protected readonly lead = computed(() =>
    this.atTable() ? copy.setup.leadTable : copy.setup.lead,
  );

  protected readonly shared = computed(() => {
    const { a, b } = this.store.state().teams;
    return sharedPlayer(a.players, b.players);
  });

  constructor() {
    // Once a match starts, from here or anywhere else, there is nothing left to set up.
    effect(() => {
      if (!this.store.atHome()) untracked(() => this.screen().close());
    });
  }

  open(): void {
    const screen = this.screen();
    if (screen.isOpen) return;
    screen.open();
    requestAnimationFrame(() => this.seatSlabs().faceOff());
    queueMicrotask(() => this.seatSlabs().focusFirst());
  }

  protected start(): void {
    if (this.shared() !== null) return;
    this.screen().close();
    this.store.startMatch();
  }
}
