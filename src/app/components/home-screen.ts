import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  output,
  viewChild,
} from '@angular/core';

import { copy } from '../copy';
import { FitText } from '../directives/fit-text';
import { GameStore } from '../game/game.store';
import { DEFAULT_NAMES, TEAM_IDS } from '../game/state';
import { Update } from '../platform/update';
import { TargetHeader } from './target-header';
import { UndoSnackbar } from './undo-snackbar';

/** Opening the app shows Inicio as it is; coming back to it later, the two sides slam in. */
let shown = false;

/**
 * Inicio, the starting grid: shown over the board while nothing is being
 * played. The two liveries are the quick match; under them, the ways to set
 * up a match or a tournament first.
 */
@Component({
  selector: 'app-home-screen',
  imports: [TargetHeader, UndoSnackbar, FitText],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.arrive]': 'arrive' },
  template: `
    <div class="column">
      <app-target-header
        [target]="0"
        [brand]="true"
        (menu)="menu.emit()"
        (tables)="tables.emit()"
      />

      <button
        #grid
        type="button"
        class="grid"
        [attr.aria-label]="copy.home.quickA11y"
        (click)="store.startQuickMatch()"
      >
        @for (side of sides; track side.id) {
          <span class="panel livery" [class]="'panel--' + side.id + ' livery--' + side.id">
            <!-- "Equipo" over its letter, set as large as a total on the board. -->
            <span class="who">
              <span class="name">{{ side.word }}</span>
              <span class="letter">{{ side.letter }}</span>
            </span>
          </span>
        }
        <span class="vs lean">{{ copy.moments.vs }}</span>
        <span class="go lean">
          <span class="go__label" [appFitText]="copy.home.quick">{{ copy.home.quick }}</span>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 5l6 7-6 7" /></svg>
        </span>
      </button>
      <p class="facts numerals" aria-hidden="true" [class.covered]="covered()">
        {{ copy.home.facts }}
      </p>

      <nav class="choices" [attr.aria-label]="copy.home.choices">
        <!-- Floats above the choices, as it floats above the quick bar on the board. -->
        <app-undo-snackbar />
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
            <span class="slab__label" [appFitText]="copy.home.tournament">{{
              copy.home.tournament
            }}</span>
            <span class="entry-meta">{{ copy.home.tournamentHelp }}</span>
          </span>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 5l6 7-6 7" /></svg>
        </button>
      </nav>
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
      min-height: 172px;
      display: flex;
      padding: 0;
      border: 0;
      background: none;
      color: var(--c-ink);
      text-align: left;
      overflow: hidden;
    }

    .grid:focus-visible {
      outline-offset: -8px;
    }

    .panel {
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

    .who {
      display: flex;
      flex-direction: column;
    }

    .name {
      font: italic 800 var(--t-title) / 1.15 var(--font);
      text-transform: uppercase;
    }

    .letter {
      font: italic 800 var(--t-hull) / 1 var(--font);
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

    .facts {
      margin: 0;
      padding: var(--s-md) var(--s-xl) var(--s-lg);
      color: var(--c-muted);
      font: italic 600 var(--t-meta) / 1.3 var(--font);
      letter-spacing: 0.4px;
      text-transform: uppercase;
    }

    .choices {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: var(--s-md);
      padding: var(--s-md) var(--s-xl)
        calc(max(env(safe-area-inset-bottom), var(--s-md)) + var(--s-xs));
      border-top: 1px solid var(--c-line);
    }

    .choices app-undo-snackbar {
      left: var(--s-xl);
      right: var(--s-xl);
      bottom: calc(100% + var(--s-sm));
    }

    /* While the undo bar shows, it takes the facts line's place, opened to its height. */
    .covered {
      visibility: hidden;
      min-height: calc(var(--min-target) + 4px + var(--s-sm) * 2);
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
      .grid {
        min-height: 112px;
      }

      .panel {
        padding-block: var(--s-sm);
      }

      .who {
        flex-direction: row;
        align-items: baseline;
        gap: var(--s-sm);
      }

      .letter {
        font-size: var(--t-title);
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
    }

    @media (max-height: 36em) and (min-width: 30em) {
      .choices {
        flex-direction: row;
      }

      /* Side by side, both labels keep one size: the short one stands in. */
      /* The fit directive sets its own display, so this has to outrank it. */
      .long {
        display: none !important;
      }

      .short {
        display: block;
      }

      .entry {
        flex: 1 1 0;
        min-width: 0;
        padding: 0 var(--s-md);
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

      /* Coming back mid-session: the two sides slam in and meet at the VS. */
      :host(.arrive) {
        animation: fade-in 220ms var(--ease-out);
      }

      :host(.arrive) .panel--a {
        animation: slam-a 480ms var(--ease-out) backwards;
      }

      :host(.arrive) .panel--b {
        animation: slam-b 480ms var(--ease-out) backwards;
      }

      :host(.arrive) .vs {
        animation: land 240ms 260ms var(--ease-out) backwards;
      }

      :host(.arrive) .go {
        animation: rise 240ms 200ms var(--ease-out) backwards;
      }

      @keyframes fade-in {
        from {
          opacity: 0;
        }
      }

      @keyframes slam-a {
        from {
          transform: translateX(-60%);
        }

        60% {
          transform: translateX(6px);
        }
      }

      @keyframes slam-b {
        from {
          transform: translateX(60%);
        }

        60% {
          transform: translateX(-6px);
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

      /* Leaving: the two sides part and the board, already live, shows through. */
      :host(.leaving) {
        pointer-events: none;
        animation: fade-out 220ms var(--ease-out) forwards;
      }

      :host(.leaving) .panel--a {
        animation: part-a 220ms var(--ease-out) forwards;
      }

      :host(.leaving) .panel--b {
        animation: part-b 220ms var(--ease-out) forwards;
      }

      @keyframes fade-out {
        to {
          opacity: 0;
        }
      }

      @keyframes part-a {
        to {
          transform: translateX(-40%);
        }
      }

      @keyframes part-b {
        to {
          transform: translateX(40%);
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
  protected readonly sides = TEAM_IDS.map((id) => {
    const name = DEFAULT_NAMES[id];
    const cut = name.lastIndexOf(' ');
    return { id, word: name.slice(0, cut), letter: name.slice(cut + 1) };
  });

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
  private readonly grid = viewChild.required<ElementRef<HTMLButtonElement>>('grid');

  constructor() {
    shown = true;
  }

  /** Reading starts at the quick match, the one-tap way in. */
  focus(): void {
    this.grid().nativeElement.focus();
  }
}
