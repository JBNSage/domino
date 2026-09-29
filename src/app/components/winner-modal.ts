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
import { GameStore } from '../game/game.store';
import { otherTeam } from '../game/state';
import { Overlays } from './overlays';
import { Slashes } from './slashes';

/**
 * The winning livery floods the screen. "Nueva ronda" counts the win;
 * everything else, Escape and system Back included, takes back what ended
 * the round.
 */
@Component({
  selector: 'app-winner-modal',
  imports: [Slashes, FitText],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dialog #dialog class="winner" aria-labelledby="winner-title" (cancel)="correct()">
      @if (result(); as result) {
        <div
          class="flood"
          [class]="'flood--' + result.winner"
          [style.--team]="'var(--c-team-' + result.winner + ')'"
        ></div>
        <div class="content" [style.--team]="'var(--c-team-' + result.winner + ')'">
          <div class="heading">
            <app-slashes class="mark" [size]="40" />
            <h2 class="title" id="winner-title" [appFitText]="copy.winner.title">
              {{ copy.winner.title }}
            </h2>
            <p class="body">{{ copy.winner.body(result.names[result.winner]) }}</p>
            <p class="rounds">{{ copy.winner.roundsAfter(result.roundsAfter) }}</p>
          </div>

          <div class="scores">
            <p class="winner-slab lean">
              <span class="name" [appFitText]="result.names[result.winner]">
                {{ result.names[result.winner] }}
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
              <span class="name loser-name" [appFitText]="result.names[loser()]">
                {{ result.names[loser()] }}
              </span>
              <span class="loser-total numerals">
                {{ result.totals[loser()] }}
              </span>
            </p>
          </div>

          <div class="actions">
            <button type="button" class="slab slab--compact lean correct" (click)="correct()">
              <span class="slab__label" [appFitText]="store.correctLabel()">
                {{ store.correctLabel() }}
              </span>
            </button>
            <button type="button" class="slab lean next" (click)="store.closeRound()">
              <span class="slab__label" [appFitText]="copy.winner.close">{{
                copy.winner.close
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
      padding: calc(env(safe-area-inset-top) + var(--s-xxl)) var(--s-xl)
        calc(max(env(safe-area-inset-bottom), var(--s-lg)) + var(--s-lg));
      overflow-y: auto;
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
      --lean-inset: 20px;

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

    .loser-name {
      flex: 1;
      min-width: 0;
    }

    .loser-total {
      font: italic 800 var(--t-display) / 1.1 var(--font);
    }

    .actions {
      display: flex;
      flex-direction: column;
      gap: var(--s-md);
      margin: 0 var(--s-md);
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

  /** The round was decided by a target that only the settings can change. */
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
