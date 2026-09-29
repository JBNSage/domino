import { ChangeDetectionStrategy, Component, computed, inject, untracked } from '@angular/core';

import { copy } from '../copy';
import { FitText } from '../directives/fit-text';
import { GameStore } from '../game/game.store';

/**
 * What happens across both liveries: the two sides meeting as a match starts,
 * and the band that says who went ahead. It never takes a tap.
 */
@Component({
  selector: 'app-board-moments',
  imports: [FitText],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
  template: `
    <!-- Each moment sits in a one-item list keyed by its number, so a new one replays. -->
    @for (start of start(); track start.seq) {
      <span class="vs" [class.vs--labelled]="start.label !== null">
        <span class="vs__mark lean">{{ copy.moments.vs }}</span>
        @if (start.label; as label) {
          <span class="vs__label lean numerals">{{ label }}</span>
        }
      </span>
    }

    <!-- The live region says it too. -->
    @for (lead of lead(); track lead.seq) {
      <span class="callout" [class]="'callout--' + lead.team">
        <span class="callout__who"
          ><span class="callout__team" [appFitText]="lead.name">{{ lead.name }}</span></span
        >
        <span class="callout__text" [appFitText]="copy.moments.lead">{{ copy.moments.lead }}</span>
      </span>
    }
  `,
  styles: `
    :host {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }

    .vs,
    .callout {
      position: absolute;
      pointer-events: none;
    }

    .vs {
      top: 50%;
      left: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--s-xs);
      transform: translate(-50%, -50%);
      opacity: 0;
    }

    .vs__mark {
      --fill: var(--c-ink);
      --lean-inset: 6px;

      padding: var(--s-xs) var(--s-xl);
      color: var(--c-on-ink);
      font: italic 800 var(--t-title) / 1.1 var(--font);
    }

    .vs__label {
      --fill: var(--c-ink);
      --lean-inset: 4px;

      padding: 2px var(--s-lg);
      color: var(--c-on-ink);
      font: italic 600 var(--t-label) / 1.3 var(--font);
      letter-spacing: 0.4px;
      text-transform: uppercase;
      white-space: nowrap;
    }

    /* A band across both liveries, in the colour of the team that went ahead. */
    .callout {
      top: var(--s-sm);
      left: 0;
      right: 0;
      display: flex;
      flex-direction: column;
      padding: var(--s-sm) calc(var(--s-xxl) + var(--s-lg));
      color: var(--team);
      opacity: 0;
    }

    .callout::before {
      content: '';
      position: absolute;
      inset: 0 var(--s-lg);
      z-index: -1;
      background: var(--c-ink);
      transform: skewX(-12deg);
    }

    .callout--a {
      --team: var(--c-team-a);
    }

    .callout--b {
      --team: var(--c-team-b);

      align-items: flex-end;
      text-align: right;
    }

    .callout > *,
    .callout__who > * {
      max-width: 100%;
    }

    .callout__team {
      font: italic 600 var(--t-meta) / 1.2 var(--font);
      letter-spacing: 0.4px;
      text-transform: uppercase;
    }

    .callout__text {
      font: italic 800 var(--t-title) / 1.15 var(--font);
      text-transform: uppercase;
    }

    @media (prefers-reduced-motion: no-preference) {
      .vs {
        animation: vs 900ms linear;
      }

      .vs--labelled {
        animation-duration: 1300ms;
      }

      @keyframes vs {
        0% {
          opacity: 0;
          transform: translate(-50%, -50%) scale(2);
        }

        22% {
          opacity: 1;
          transform: translate(-50%, -50%) scale(1);
          animation-timing-function: linear;
        }

        78% {
          opacity: 1;
          transform: translate(-50%, -50%) scale(1);
        }

        100% {
          opacity: 0;
          transform: translate(-50%, -50%) scale(0.96);
        }
      }

      .callout {
        animation: callout 1100ms linear;
      }

      .callout--a {
        --from: -110%;
        --to: 110%;
      }

      .callout--b {
        --from: 110%;
        --to: -110%;
      }

      @keyframes callout {
        0% {
          opacity: 1;
          transform: translateX(var(--from));
          animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
        }

        22% {
          transform: translateX(0);
        }

        76% {
          opacity: 1;
          transform: translateX(0);
          animation-timing-function: cubic-bezier(0.7, 0, 0.84, 0);
        }

        100% {
          opacity: 1;
          transform: translateX(var(--to));
        }
      }
    }

    /* Less motion: the callout and the start still say what happened, without moving. */
    @media (prefers-reduced-motion: reduce) {
      .callout {
        animation: still 1400ms linear;
      }

      .vs {
        animation: still 1000ms linear;
      }

      @keyframes still {
        0%,
        100% {
          opacity: 0;
        }

        8%,
        88% {
          opacity: 1;
        }
      }
    }

    /* Short screens: the liveries are a strip, so the band says only what happened. */
    @media (max-height: 36em) {
      .callout {
        top: 50%;
        padding-block: var(--s-xs);
        translate: 0 -50%;
      }

      .callout__who {
        display: none;
      }

      .callout__text {
        font-size: var(--t-button);
      }
    }
  `,
})
export class BoardMoments {
  protected readonly copy = copy;
  private readonly store = inject(GameStore);

  protected readonly start = computed(() => {
    const moment = this.store.moment();
    return moment?.kind === 'start' ? [moment] : [];
  });

  protected readonly lead = computed(() => {
    const moment = this.store.moment();
    if (moment?.kind !== 'hand' || !moment.lead) return [];
    const name = untracked(this.store.state).teams[moment.team].name;
    return [{ seq: moment.seq, team: moment.team, name }];
  });
}
