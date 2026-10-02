import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  output,
  signal,
  viewChild,
} from '@angular/core';

import { copy } from '../copy';
import { FitText } from '../directives/fit-text';
import { GameStore } from '../game/game.store';
import {
  DEFAULT_NAMES,
  DEFAULT_QUICK_VALUE,
  DEFAULT_TARGET,
  TEAM_IDS,
  sharedPlayer,
} from '../game/state';
import { Update } from '../platform/update';
import { InstallHint } from './install-hint';
import { PlayerPair } from './player-pair';
import { TargetHeader } from './target-header';
import { UndoSnackbar } from './undo-snackbar';

/** Opening the app shows Inicio as it is; coming back to it later, it unfolds from the board. */
let shown = false;

/** The board's livery seam: a fixed lean across the lockup's height. */
const SEAM_LEAN = 36;

/**
 * Inicio, the starting grid: shown over the board while nothing is being
 * played. The two liveries are the quick match; under them, the ways to play
 * the last match again, set up a match or start a tournament.
 *
 * The grid's seam keeps the board's angle and starts where the board's does,
 * so the top of the grid is the board's lockup: leaving, Inicio folds up onto
 * it and the board is already there.
 */
@Component({
  selector: 'app-home-screen',
  imports: [TargetHeader, UndoSnackbar, InstallHint, PlayerPair, FitText],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.arrive]': 'arrive',
    '[style.--grid-seam.px]': 'seam()',
    '[style.--lockup-h.px]': 'lockupHeight()',
  },
  template: `
    <div class="column">
      <app-target-header
        [target]="0"
        [brand]="true"
        (menu)="menu.emit()"
        (tables)="tables.emit()"
      />

      <button #grid type="button" class="grid" [attr.aria-label]="match().a11y" (click)="play()">
        @for (side of match().sides; track side.id) {
          <span class="panel livery" [class]="'panel--' + side.id + ' livery--' + side.id">
            @if (side.letter; as letter) {
              <!-- "Equipo" over its letter, the letter at poster scale. -->
              <span class="who">
                <span class="name">{{ side.word }}</span>
                <span class="letter">{{ letter }}</span>
              </span>
            } @else {
              <span class="who">
                <span class="team">{{ side.word }}</span>
                @if (side.players; as players) {
                  <app-player-pair class="players" [players]="players" />
                }
              </span>
            }
          </span>
        }
        <span class="vs lean">{{ copy.moments.vs }}</span>
        <span class="go lean">
          <span class="go__label" [appFitText]="match().label">{{ match().label }}</span>
          <!-- An arrow, here and on any choice that plays at once; a chevron opens a screen. -->
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </span>
      </button>
      <!-- The undo bar takes the facts line's place while it shows. -->
      <div class="slot" [class.covered]="covered()">
        <p class="facts numerals" aria-hidden="true">{{ match().facts }}</p>
        <app-undo-snackbar />
      </div>

      <app-install-hint class="install" [compact]="true" />

      <div class="choices" role="group" [attr.aria-label]="copy.home.choices">
        @if (match().kind !== 'quick') {
          <!-- The grid holds their match, so the quick one waits here. -->
          <button
            type="button"
            class="slab lean entry"
            [attr.aria-label]="copy.home.quickChoiceA11y"
            (click)="store.startQuickMatch()"
          >
            <span class="entry-text">
              <span class="slab__label long" [appFitText]="copy.home.quick">{{
                copy.home.quick
              }}</span>
              <span class="slab__label short">{{ copy.home.quickShort }}</span>
              <span class="entry-meta">{{ copy.home.quickHelp }}</span>
            </span>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </button>
        }
        <button type="button" class="slab lean entry" (click)="custom.emit()">
          <span class="entry-text">
            <span class="slab__label long" [appFitText]="copy.home.custom">{{
              copy.home.custom
            }}</span>
            <span class="slab__label short">{{ copy.home.customShort }}</span>
            <span class="entry-meta">{{ copy.home.customHelp }}</span>
          </span>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 5l6 7-6 7" /></svg>
        </button>
        <button type="button" class="slab lean entry" (click)="tournament.emit()">
          <span class="entry-text">
            <span class="slab__label">{{ copy.home.tournament }}</span>
            <span class="entry-meta">{{ copy.home.tournamentHelp }}</span>
          </span>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 5l6 7-6 7" /></svg>
        </button>
      </div>
    </div>
  `,
  styles: `
    :host {
      position: fixed;
      inset: 0;
      display: block;
      background: var(--c-ground);
    }

    .column {
      height: 100%;
      max-width: var(--column);
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      padding-top: env(safe-area-inset-top);
    }

    /* The two liveries, nose to nose, own the screen: one button, the quick match. */
    .grid {
      --focus: var(--c-ink);

      position: relative;
      flex: 1 1 auto;
      min-height: 112px;
      container-type: size;
      display: flex;
      padding: 0;
      border: 0;
      background: none;
      color: var(--c-ink);
      text-align: left;
      overflow: hidden;
    }

    /* The liveries would paint over an outline, so the ring is a layer above them. */
    .grid:focus-visible {
      outline: none;
    }

    .grid:focus-visible::after {
      content: '';
      position: absolute;
      inset: var(--s-sm);
      z-index: 1;
      border: 3px solid var(--c-ink);
      pointer-events: none;
    }

    /* After a touch, as everywhere, the ring waits for the keyboard. */
    :host-context([data-input='touch']) .grid:focus-visible::after {
      display: none;
    }

    .panel {
      /* The board's angle over this height, measured from the board itself. */
      --seam-lean: var(--grid-seam, 36px);

      flex: 1;
      min-width: 0;
      display: flex;
      align-items: flex-start;
      padding: var(--s-lg);
    }

    .panel--a {
      padding-right: var(--s-xl);
    }

    .panel--b {
      padding-left: calc(var(--s-xl) + var(--s-sm));
    }

    /*
     * A steeper seam reaches further back, so the gap between the two stays the
     * board's, and each outer edge bleeds further out, so it never shows its lean.
     */
    .panel--a::before,
    .panel--a::after {
      left: calc(-12px - var(--seam-lean));
    }

    .panel--b::before,
    .panel--b::after {
      left: calc(21px - var(--seam-lean));
      right: calc(-12px - var(--seam-lean));
    }

    .who {
      min-width: 0;
      max-width: 100%;
      display: flex;
      flex-direction: column;
    }

    .name {
      font: italic 800 var(--t-title) / 1.15 var(--font);
      text-transform: uppercase;
    }

    /* A team's own name, as large as two or three words allow; a long word breaks. */
    .team {
      max-width: 100%;
      font: italic 800 min(9cqw, var(--t-display)) / 1.05 var(--font);
      text-transform: uppercase;
      overflow-wrap: break-word;
      hyphens: auto;
    }

    .players {
      margin-top: var(--s-xs);
      font: italic 600 var(--t-label) / 1.3 var(--font);
      text-transform: uppercase;
    }

    /* As large as the panel allows while staying clear of the VS. */
    .letter {
      font: italic 800 min(40cqw, 50cqh - 96px) / 0.95 var(--font);
      text-transform: uppercase;
    }

    .grid:active .panel::after,
    .grid:active .go::before {
      opacity: var(--pressed);
    }

    @media (hover: hover) {
      .grid:hover .panel::after {
        filter: brightness(1.06);
      }
    }

    .vs {
      --fill: var(--c-ink);
      --edge: var(--c-text);
      --lean-inset: 6px;

      position: absolute;
      top: 50%;
      left: 50%;
      padding: var(--s-sm) var(--s-xl);
      color: var(--c-on-ink);
      font: italic 800 var(--t-field) / 1 var(--font);
      transform: translate(-50%, -50%);
    }

    /* The band that says what the tap does, across both liveries. */
    .go {
      --fill: var(--c-ink);
      --lean-inset: 8px;

      position: absolute;
      left: var(--s-xl);
      right: var(--s-xl);
      bottom: var(--s-lg);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--s-sm);
      min-height: calc(var(--min-target) + 8px);
      padding: 0 var(--s-xl);
      overflow: hidden;
      color: var(--c-on-ink);
      font: italic 800 var(--t-button) / 1.1 var(--font);
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }

    .go__label {
      min-width: 0;
    }

    .go svg {
      flex: none;
      width: 24px;
      height: 24px;
      fill: none;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    /* Too short for a large letter or a large name: one line of Title beside "Equipo". */
    @container (max-height: 320px) {
      .who {
        flex-direction: row;
        flex-wrap: wrap;
        align-items: baseline;
        gap: 0 var(--s-sm);
      }

      .letter {
        font-size: var(--t-title);
        line-height: 1.15;
      }

      .team {
        font-size: var(--t-title);
        line-height: 1.15;
      }

      .players {
        display: none;
      }
    }

    /* A strip: everything tighter, the VS above the band. */
    @container (max-height: 240px) {
      .panel {
        padding-block: var(--s-sm);
      }

      .name,
      .letter {
        font-size: var(--t-button);
      }

      .team {
        font-size: var(--t-button);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .vs {
        top: 40%;
        padding: 2px var(--s-lg);
        font-size: var(--t-title);
      }

      .go {
        bottom: var(--s-sm);
        min-height: var(--min-target);
      }
    }

    .facts {
      margin: 0;
      padding: var(--s-md) var(--s-xl) var(--s-lg);
      color: var(--c-muted);
      font: italic 600 var(--t-meta) / 1.3 var(--font);
      letter-spacing: 0.4px;
      text-transform: uppercase;
    }

    .slot {
      position: relative;
    }

    /* While the undo bar shows, it takes the facts line's place at its own height. */
    .slot app-undo-snackbar {
      position: static;
      display: block;
      margin: var(--s-sm) var(--s-xl);
    }

    .slot:not(.covered) app-undo-snackbar,
    .covered .facts {
      display: none;
    }

    /* Below the facts line, over the choices, while the app is not installed. */
    .install.shown {
      padding: var(--s-xs) var(--s-sm) var(--s-xs) var(--s-xl);
      border-top: 1px solid var(--c-line);
    }

    .choices {
      container-type: inline-size;
      display: flex;
      flex-direction: column;
      gap: var(--s-md);
      padding: var(--s-md) var(--s-xl)
        calc(max(env(safe-area-inset-bottom), var(--s-md)) + var(--s-xs));
      border-top: 1px solid var(--c-line);
    }

    .short {
      display: none;
    }

    .entry {
      justify-content: space-between;
      min-height: 64px;
      padding: 0 var(--s-lg) 0 var(--s-xl);
    }

    .entry-text {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      padding: var(--s-xs) 0;
      white-space: normal;
      text-align: left;
    }

    .entry-text > * {
      max-width: 100%;
    }

    .entry-meta {
      color: var(--c-muted);
      font: italic 600 var(--t-label) / 1.3 var(--font);
      letter-spacing: 0;
      text-transform: none;
      overflow-wrap: break-word;
    }

    .entry svg {
      flex: none;
      width: 20px;
      height: 20px;
      fill: none;
      stroke: var(--c-muted);
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    @media (max-height: 36em) {
      .facts {
        padding-block: var(--s-sm);
      }

      .choices {
        gap: var(--s-sm);
        padding-block: var(--s-sm) max(env(safe-area-inset-bottom), var(--s-sm));
      }

      .entry {
        min-height: var(--min-target);
      }

      .entry-meta {
        display: none;
      }

      /* A short screen keeps its height for the grid; the board's empty list still offers it. */
      .install {
        display: none !important;
      }
    }

    @media (max-height: 36em) and (min-width: 30em) {
      .choices {
        flex-direction: row;
      }

      /* Side by side, the labels share one size: short words, sized to the row. */
      /* The fit directive sets its own display, so this has to outrank it. */
      .long {
        display: none !important;
      }

      .short {
        display: block;
      }

      .slab__label {
        font-size: min(var(--t-compact), 3.4cqw);
      }

      .entry {
        flex: 1 1 0;
        min-width: 0;
        padding: 0 var(--s-sm);
      }

      .entry svg {
        display: none;
      }
    }

    @media (prefers-reduced-motion: no-preference) {
      /* The light that crosses the band, as on a stripe at match point. */
      .go::after {
        content: '';
        position: absolute;
        inset: 0 var(--lean-inset);
        z-index: -1;
        transform: skewX(-12deg);
        background: linear-gradient(
          100deg,
          transparent 38%,
          rgb(255 255 255 / 0.22) 50%,
          transparent 62%
        );
        background-size: 300% 100%;
        background-position: 100% 0;
        animation: glint 2.4s 600ms ease-in-out infinite;
      }

      @keyframes glint {
        45%,
        100% {
          background-position: 0 0;
        }
      }

      /* Coming back mid-session: the board's liveries unfold into the grid. */
      :host(.arrive) {
        animation: ground-in 220ms var(--ease-out) backwards;
      }

      :host(.arrive) .grid {
        animation: unfold 280ms var(--ease-out) backwards;
      }

      :host(.arrive) .who,
      :host(.arrive) .slot,
      :host(.arrive) .install,
      :host(.arrive) .choices {
        animation: fade-in 200ms 120ms var(--ease-out) backwards;
      }

      :host(.arrive) .vs {
        animation: land 240ms 200ms var(--ease-out) backwards;
      }

      :host(.arrive) .go {
        animation: rise 240ms 160ms var(--ease-out) backwards;
      }

      /* Leaving: the grid folds up onto the board's liveries, which are already live. */
      :host(.leaving) {
        animation: ground-out 220ms var(--ease-out) forwards;
      }

      :host(.leaving) .grid {
        animation: fold 220ms var(--ease-out) forwards;
      }

      /* Its words go first and fast, so they are never read over the board's. */
      :host(.leaving) .who,
      :host(.leaving) .vs,
      :host(.leaving) .go,
      :host(.leaving) app-target-header,
      :host(.leaving) .slot,
      :host(.leaving) .install,
      :host(.leaving) .choices {
        animation: fade-out 70ms ease-out forwards;
      }

      @keyframes ground-in {
        from {
          background-color: transparent;
        }
      }

      @keyframes ground-out {
        to {
          background-color: transparent;
        }
      }

      @keyframes unfold {
        from {
          clip-path: inset(0 0 calc(100% - var(--lockup-h, 190px)) 0);
        }

        to {
          clip-path: inset(0);
        }
      }

      /* Folded onto the board's liveries, it gives way to them: the floods match, the words appear. */
      @keyframes fold {
        from {
          clip-path: inset(0);
        }

        55% {
          clip-path: inset(0 0 calc(100% - var(--lockup-h, 190px)) 0);
          opacity: 1;
        }

        to {
          clip-path: inset(0 0 calc(100% - var(--lockup-h, 190px)) 0);
          opacity: 0;
        }
      }

      @keyframes fade-in {
        from {
          opacity: 0;
        }
      }

      @keyframes fade-out {
        to {
          opacity: 0;
        }
      }

      @keyframes land {
        from {
          opacity: 0;
          transform: translate(-50%, -50%) scale(2);
        }
      }

      @keyframes rise {
        from {
          opacity: 0;
          transform: translateY(12px);
        }
      }
    }

    :host(.leaving) {
      pointer-events: none;
    }
  `,
})
export class HomeScreen {
  protected readonly copy = copy;
  protected readonly store = inject(GameStore);
  readonly menu = output<void>();
  /** The mesas, from the status line naming the one in use. */
  readonly tables = output<void>();
  /** Asks for the screen that sets up a match. */
  readonly custom = output<void>();
  readonly tournament = output<void>();

  protected readonly arrive = shown;
  private readonly update = inject(Update);
  /** The undo bar or the update notice takes the facts line's place. */
  protected readonly covered = computed(() => this.store.undo() !== null || this.update.ready());

  /**
   * The match the grid holds and starts: the one set up in Personalizar, else
   * the last one played, else Equipo A against Equipo B.
   */
  protected readonly match = computed(() => {
    const state = this.store.state();
    const rematch = this.store.rematch();
    const prepared =
      state.target !== DEFAULT_TARGET ||
      state.quickValue !== DEFAULT_QUICK_VALUE ||
      TEAM_IDS.some(
        (id) => state.teams[id].name !== DEFAULT_NAMES[id] || state.teams[id].players !== null,
      );
    const kind: 'quick' | 'prepared' | 'rematch' = prepared
      ? 'prepared'
      : rematch !== null
        ? 'rematch'
        : 'quick';
    const teams = kind === 'rematch' && rematch !== null ? rematch.teams : state.teams;
    const target = kind === 'rematch' && rematch !== null ? rematch.target : state.target;
    return {
      kind,
      sides: TEAM_IDS.map((id) => {
        const { name, players } = teams[id];
        // A default name is set as a word over its letter; any other is set whole.
        const cut = name === DEFAULT_NAMES[id] ? name.lastIndexOf(' ') : -1;
        return cut < 0
          ? { id, word: name, letter: null, players }
          : { id, word: name.slice(0, cut), letter: name.slice(cut + 1), players };
      }),
      label:
        kind === 'prepared'
          ? copy.home.start
          : kind === 'rematch'
            ? copy.home.rematch
            : copy.home.quick,
      facts: copy.home.facts(target, state.quickValue),
      a11y: copy.home.gridA11y(kind, teams.a.name, teams.b.name, target, state.quickValue),
      shared: sharedPlayer(teams.a.players, teams.b.players),
    };
  });

  protected readonly seam = signal(SEAM_LEAN);
  protected readonly lockupHeight = signal(190);
  private readonly grid = viewChild.required<ElementRef<HTMLButtonElement>>('grid');

  constructor() {
    shown = true;
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => this.followLockup(destroyRef));
  }

  /** Starts what the grid shows. Two teams that share a player are sent to be fixed first. */
  protected play(): void {
    const match = this.match();
    if (match.kind === 'quick') this.store.startQuickMatch();
    else if (match.kind === 'rematch') this.store.startRematch();
    else if (match.shared !== null) this.custom.emit();
    else this.store.startMatch();
  }

  /** Reading starts at the grid, the one-tap way in. */
  focus(): void {
    this.grid().nativeElement.focus();
  }

  /**
   * Keeps the grid's seam on the board's: the same lean per pixel of height,
   * starting from the same point, so the grid's top is the board's lockup.
   */
  private followLockup(destroyRef: DestroyRef): void {
    const lockup = document.querySelector<HTMLElement>('app-team-lockup');
    if (lockup === null || typeof ResizeObserver === 'undefined') return;
    const grid = this.grid().nativeElement;
    const measure = () => {
      const height = lockup.offsetHeight;
      if (height === 0) return;
      this.lockupHeight.set(height);
      this.seam.set((SEAM_LEAN * grid.offsetHeight) / height);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(lockup);
    observer.observe(grid);
    destroyRef.onDestroy(() => observer.disconnect());
  }
}
