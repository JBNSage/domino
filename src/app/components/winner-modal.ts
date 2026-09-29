import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  output,
  viewChild,
} from '@angular/core';

import { copy } from '../copy';
import { FitText } from '../directives/fit-text';
import { PlayerPair } from './player-pair';
import { GameStore } from '../game/game.store';
import { otherTeam } from '../game/state';
import { Overlays } from './overlays';
import { Slashes } from './slashes';

/**
 * The winning livery floods the screen. "Nueva partida" counts the win;
 * everything else, Escape and system Back included, takes back what ended
 * the match.
 */
@Component({
  selector: 'app-winner-modal',
  imports: [Slashes, FitText, PlayerPair],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dialog #dialog class="winner" aria-labelledby="winner-title" (cancel)="correct()">
      @if (result(); as result) {
        <div class="flood" [class]="'flood--' + result.winner"></div>
        <div class="content" [class]="'content--' + result.winner">
          <!-- The scores scroll when the screen is short; the two actions never leave it. -->
          <div class="scroll">
            <div class="heading">
              <app-slashes class="mark" [size]="40" />
              <h2 class="title" id="winner-title" [appFitText]="copy.winner.title">
                {{ copy.winner.title }}
              </h2>
              <p class="body">{{ copy.winner.body(result.names[result.winner]) }}</p>
              <p class="rounds">{{ copy.winner.winsAfter(result.roundsAfter) }}</p>
            </div>

            <div class="scores">
              <p class="winner-slab lean">
                <span class="who">
                  <span class="name" [appFitText]="result.names[result.winner]">
                    {{ result.names[result.winner] }}
                  </span>
                  @if (result.players[result.winner]; as players) {
                    <app-player-pair class="players" [players]="players" />
                  }
                </span>
                <span
                  class="winner-total numerals"
                  [appFitText]="result.totals[result.winner]"
                  [minScale]="0.4"
                >
                  {{ result.totals[result.winner] }}
                </span>
              </p>
              <p class="loser-slab lean">
                <span class="who">
                  <span class="name" [appFitText]="result.names[loser()]">
                    {{ result.names[loser()] }}
                  </span>
                  @if (result.players[loser()]; as players) {
                    <app-player-pair class="players" [players]="players" />
                  }
                </span>
                <span class="loser-total numerals">{{ result.totals[loser()] }}</span>
              </p>
            </div>
          </div>

          <div class="actions">
            <div class="others">
              <button type="button" class="slab slab--compact lean correct" (click)="correct()">
                <span class="slab__label" [appFitText]="store.correctLabel()">
                  {{ store.correctLabel() }}
                </span>
              </button>
              <!-- At a mesa the same teams play on; changing them is a choice. -->
              @if (store.canRotate()) {
                <button
                  type="button"
                  class="slab slab--compact lean correct"
                  [attr.aria-label]="copy.winner.rotateA11y"
                  (click)="store.closeRound(true)"
                >
                  <span class="slab__label" [appFitText]="copy.winner.rotate">{{
                    copy.winner.rotate
                  }}</span>
                </button>
              }
            </div>
            <button type="button" class="slab lean next" (click)="store.closeRound()">
              <span class="slab__label" [appFitText]="store.closeLabel()">{{
                store.closeLabel()
              }}</span>
            </button>
          </div>
        </div>
      }
    </dialog>
  `,
  styles: `
    .winner {
      --focus: var(--c-ink);

      position: fixed;
      inset: 0;
      width: 100%;
      height: 100%;
      max-width: none;
      max-height: none;
      margin: 0;
      padding: 0;
      border: 0;
      overflow: hidden;
      background: var(--c-ground);
      color: var(--c-ink);
    }

    .winner::backdrop {
      background: var(--c-ground);
    }

    .flood--a,
    .content--a {
      --team: var(--c-team-a);
    }

    .flood--b,
    .content--b {
      --team: var(--c-team-b);
    }

    .flood {
      position: absolute;
      inset: 0 -60%;
      background: var(--team);
      transform: skewX(-12deg);
    }

    .content {
      position: relative;
      height: 100%;
      max-width: var(--column);
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: var(--s-lg);
      padding: calc(env(safe-area-inset-top) + var(--s-xxl)) var(--s-xl)
        calc(max(env(safe-area-inset-bottom), var(--s-lg)) + var(--s-lg));
    }

    .scroll {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      overscroll-behavior: contain;
      scrollbar-width: thin;
      scrollbar-color: var(--c-ink) transparent;
    }

    .heading {
      display: flex;
      flex-direction: column;
      gap: var(--s-xs);
    }

    .mark {
      color: var(--c-ink);
    }

    .title,
    .body,
    .rounds,
    .scores p {
      margin: 0;
    }

    .title {
      margin-top: var(--s-md);
      font: italic 800 var(--t-display) / 1.15 var(--font);
      text-transform: uppercase;
    }

    .body {
      font: italic 800 var(--t-title) / 1.2 var(--font);
      text-transform: uppercase;
      text-wrap: balance;
      overflow-wrap: anywhere;
    }

    .rounds {
      margin-top: var(--s-xs);
      font: italic 600 var(--t-body) / 1.3 var(--font);
      text-transform: uppercase;
    }

    .scores {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: var(--s-md);
      padding: var(--s-xl) var(--s-sm);
    }

    .winner-slab {
      --fill: var(--c-ink);
      --lean-inset: 24px;

      padding: var(--s-xl) calc(var(--s-xxl) + var(--s-sm)) var(--s-md);
      color: var(--team);
    }

    .winner-total {
      font: italic 800 var(--t-winner) / 1.06 var(--font);
    }

    .loser-slab {
      --fill: var(--team);
      --edge: var(--c-ink);
      --lean-inset: 8px;

      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--s-lg);
      padding: var(--s-sm) var(--s-xxl);
    }

    .name {
      font: italic 800 var(--t-button) / 1.2 var(--font);
      text-transform: uppercase;
    }

    .players {
      font: italic 600 var(--t-label) / 1.3 var(--font);
      text-transform: uppercase;
    }

    .who {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .loser-slab .who {
      flex: 1;
    }

    .loser-total {
      font: italic 800 var(--t-display) / 1.1 var(--font);
    }

    .actions {
      flex: none;
      display: flex;
      flex-direction: column;
      gap: var(--s-md);
      margin: 0 var(--s-md);
    }

    .others {
      display: flex;
      flex-wrap: wrap;
      gap: var(--s-md);
    }

    /* Side by side only when both labels fit whole. */
    .others .slab {
      flex: 1 1 12rem;
      padding: 0 var(--s-md);
    }

    .correct {
      --fill: var(--team);
      --edge: var(--c-ink);
      --label: var(--c-ink);
    }

    .next {
      --fill: var(--c-ink);
      --edge: transparent;
      --label: var(--c-on-ink);
    }

    /* Short screens: a phone on its side, or large text on a small phone. */
    @media (max-height: 36em) {
      .content {
        gap: var(--s-md);
        padding-top: calc(env(safe-area-inset-top) + var(--s-lg));
        padding-bottom: max(env(safe-area-inset-bottom), var(--s-md));
      }

      .mark {
        display: none;
      }

      .title {
        margin-top: 0;
        font-size: var(--t-title);
      }

      .body {
        font-size: var(--t-button);
      }

      .scores {
        justify-content: flex-start;
        padding: var(--s-md) var(--s-sm);
      }

      .winner-slab {
        --lean-inset: 12px;

        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--s-lg);
        padding: var(--s-sm) var(--s-xxl);
      }

      .winner-slab .who {
        flex: 1;
      }

      .winner-total {
        font-size: var(--t-display);
      }

      .loser-total {
        font-size: var(--t-title);
      }

      .actions {
        gap: var(--s-sm);
      }

      .actions .slab {
        min-height: var(--min-target);
      }
    }

    @media (max-height: 36em) and (min-width: 30em) {
      .actions {
        flex-direction: row;
        gap: var(--s-md);
      }

      .actions .slab {
        flex: 1 1 0;
        padding: 0 var(--s-md);
      }
    }

    @media (prefers-reduced-motion: no-preference) {
      .flood {
        animation: flood 220ms var(--ease-out) backwards;
      }

      .flood--a {
        --from: -160vw;
      }

      .flood--b {
        --from: 160vw;
      }

      @keyframes flood {
        from {
          transform: translateX(var(--from)) skewX(-12deg);
        }
      }

      .content {
        animation: arrive 220ms 60ms ease-out backwards;
      }

      @keyframes arrive {
        from {
          opacity: 0;
        }
      }
    }
  `,
})
export class WinnerModal {
  protected readonly copy = copy;
  protected readonly store = inject(GameStore);

  /** The match was decided by a target that only the settings can change. */
  readonly openSettings = output<void>();

  private readonly overlays = inject(Overlays);
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  // The winner waits until the sheet that caused it has closed.
  protected readonly result = computed(() => (this.overlays.any() ? null : this.store.result()));
  protected readonly loser = computed(() => otherTeam(this.result()?.winner ?? 'a'));

  constructor() {
    effect(() => {
      const visible = this.result() !== null;
      const dialog = this.dialog().nativeElement;
      if (visible && !dialog.open) dialog.showModal();
      else if (!visible && dialog.open) dialog.close();
    });
  }

  protected correct(): void {
    if (this.store.correct() === 'settings') this.openSettings.emit();
  }
}
