import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  output,
  viewChildren,
} from '@angular/core';

import { copy } from '../copy';
import { FitText } from '../directives/fit-text';
import { GameStore } from '../game/game.store';
import { TEAM_IDS, TeamId } from '../game/state';
import { prefersReducedMotion } from '../platform/motion';

/** Both liveries meeting on one diagonal seam. */
@Component({
  selector: 'app-team-lockup',
  imports: [FitText],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (team of teams(); track team.id) {
      <button
        type="button"
        class="panel"
        [class]="'panel--' + team.id"
        [attr.aria-label]="team.label"
        (click)="pressTeam.emit(team.id)"
      >
        <span class="name" [appFitText]="team.name">{{ team.name }}</span>
        <span #total class="total numerals" [class.total--long]="long()" [appFitText]="team.total">
          {{ team.total }}
        </span>
        <span class="meta">
          <span class="remaining numerals" [appFitText]="team.remaining">
            {{ copy.team.remaining(team.remaining) }}
          </span>
          <!-- With no rounds yet the chip keeps its space, so both totals stay level. -->
          <span class="rounds lean numerals" [class.hidden]="team.roundsWon === 0">
            {{ copy.team.rounds(team.roundsWon) }}
          </span>
        </span>
      </button>
    }
  `,
  styles: `
    :host {
      --seam-lean: 36px;
      --edge-x: calc(var(--team-edge-width) * 1.1);

      display: flex;
      overflow: hidden;
    }

    .panel {
      position: relative;
      isolation: isolate;
      flex: 1;
      min-width: 0;
      min-height: 172px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: var(--s-xs);
      padding: var(--s-lg);
      border: 0;
      background: none;
      color: var(--c-ink);
      text-align: left;
    }

    .panel--a {
      --team: var(--c-team-a);
      padding-right: var(--s-xl);
    }

    .panel--b {
      --team: var(--c-team-b);
      padding-left: calc(var(--s-xl) + var(--s-sm));
    }

    /* Each livery reaches half a lean past the centre line, so the seam stays parallel. */
    .panel::before,
    .panel::after {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      z-index: -1;
    }

    .panel--a::before,
    .panel--a::after {
      left: -48px;
      right: -15px;
    }

    .panel--b::before,
    .panel--b::after {
      left: -15px;
      right: -48px;
    }

    .panel::before {
      background: var(--c-team-edge);
      clip-path: polygon(var(--seam-lean) 0, 100% 0, calc(100% - var(--seam-lean)) 100%, 0 100%);
    }

    .panel::after {
      background: var(--team);
      clip-path: polygon(
        calc(var(--seam-lean) + var(--edge-x)) var(--team-edge-width),
        calc(100% - var(--edge-x)) var(--team-edge-width),
        calc(100% - var(--seam-lean) - var(--edge-x)) calc(100% - var(--team-edge-width)),
        var(--edge-x) calc(100% - var(--team-edge-width))
      );
    }

    .panel:active::after {
      opacity: var(--pressed);
    }

    @media (hover: hover) {
      .panel:hover::after {
        filter: brightness(1.06);
      }
    }

    .panel:focus-visible {
      outline-color: var(--c-ink);
      outline-offset: -8px;
    }

    .name {
      font: italic 800 var(--t-button) / 1.15 var(--font);
      text-transform: uppercase;
    }

    .total {
      font: italic 800 var(--t-hull) / 1.05 var(--font);
      transform-origin: left center;
    }

    .total--long {
      font-size: var(--t-display);
    }

    .meta {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: var(--s-xs);
    }

    .remaining {
      max-width: 100%;
    }

    .remaining,
    .rounds {
      font: italic 600 var(--t-meta) / 1.3 var(--font);
      letter-spacing: 0.4px;
      text-transform: uppercase;
    }

    .rounds {
      --fill: var(--c-ink);
      --lean-inset: 3px;
      padding: 2px var(--s-md);
      color: var(--team);
    }

    .hidden {
      visibility: hidden;
    }

    /* Short screens: the lockup becomes a strip, so the hands keep their room. */
    @media (max-height: 36em) {
      .panel {
        min-height: 0;
        flex-flow: row wrap;
        align-items: center;
        justify-content: flex-start;
        gap: 0 var(--s-md);
        padding-block: var(--s-sm);
      }

      .name {
        flex: 1 1 100%;
        font-size: var(--t-meta);
      }

      .total,
      .total--long {
        flex: none;
        font-size: var(--t-field);
      }

      /* Under the total on a narrow screen, beside it on a wide one. */
      .meta {
        flex: 1 1 100%;
        min-width: 0;
      }

      .hidden {
        display: none;
      }
    }

    @media (max-height: 36em) and (min-width: 30em) {
      .meta {
        flex: 1;
      }
    }
  `,
})
export class TeamLockup {
  protected readonly copy = copy;
  readonly pressTeam = output<TeamId>();

  private readonly store = inject(GameStore);
  private readonly totals = viewChildren<ElementRef<HTMLElement>>('total');

  protected readonly teams = computed(() => {
    const state = this.store.state();
    const totals = this.store.totals();
    return TEAM_IDS.map((id) => {
      const { name, roundsWon } = state.teams[id];
      const total = totals[id];
      const remaining = Math.max(0, state.target - total);
      return {
        id,
        name,
        roundsWon,
        total,
        remaining,
        label: `${copy.team.a11y(name, total, remaining, roundsWon)}. ${copy.team.a11yHint}`,
      };
    });
  });

  // Both totals share one size, so a long score never makes the two sides unequal.
  protected readonly long = computed(() => {
    const { a, b } = this.store.totals();
    return Math.max(String(a).length, String(b).length) > 4;
  });

  constructor() {
    let previous = this.store.totals();
    effect(() => {
      const totals = this.store.totals();
      const elements = this.totals();
      TEAM_IDS.forEach((id, index) => {
        if (totals[id] !== previous[id]) this.pop(elements[index]?.nativeElement);
      });
      previous = totals;
    });
  }

  private pop(element: HTMLElement | undefined): void {
    if (!element || prefersReducedMotion() || typeof element.animate !== 'function') return;
    element.animate([{ transform: 'scale(1.14)' }, { transform: 'scale(1)' }], {
      duration: 220,
      easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
    });
  }
}
