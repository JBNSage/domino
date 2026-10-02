import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  output,
  untracked,
  viewChildren,
} from '@angular/core';

import { copy } from '../copy';
import { FitText } from '../directives/fit-text';
import { Roll } from '../directives/roll';
import { BoardMoments } from './board-moments';
import { PlayerPair } from './player-pair';
import { GameStore } from '../game/game.store';
import { TEAM_IDS, TeamId, matchPoint } from '../game/state';
import { play } from '../platform/motion';

/** Both liveries meeting on one diagonal seam. */
@Component({
  selector: 'app-team-lockup',
  imports: [FitText, Roll, PlayerPair, BoardMoments],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (team of teams(); track team.id) {
      <button
        #panel
        type="button"
        class="panel livery"
        [class]="'panel--' + team.id + ' livery--' + team.id"
        [attr.aria-label]="team.label"
        (click)="pressTeam.emit(team.id)"
      >
        <!-- Light crossing the paint as a hand lands. -->
        @for (seq of team.sheen; track seq) {
          <span class="sheen" aria-hidden="true"></span>
        }
        <span class="who">
          <span class="name" [appFitText]="team.name">{{ team.name }}</span>
          @if (team.players; as players) {
            <app-player-pair class="players" [players]="players" />
          }
        </span>
        <span class="score">
          <span
            #total
            class="total numerals"
            [class.total--long]="long()"
            [appFitText]="team.total"
            [appRoll]="team.total"
            [rollKey]="team.sheen[0]"
            >{{ team.total }}</span
          >
          @for (tag of team.tag; track tag.seq) {
            <span class="tag lean numerals" aria-hidden="true">+{{ tag.points }}</span>
          }
        </span>
        <span class="meta">
          @if (team.matchPoint !== null) {
            <span class="stripe lean numerals">
              <span class="stripe__left" [appFitText]="team.remaining">{{
                copy.team.remaining(team.remaining)
              }}</span>
              <span class="stripe__goal" [appFitText]="copy.moments.toWin">{{
                copy.moments.toWin
              }}</span>
            </span>
          } @else {
            <span class="remaining numerals" [appFitText]="team.remaining">
              {{ copy.team.remaining(team.remaining) }}
            </span>
          }
          <!-- With no wins yet the chip keeps its space, so both totals stay level. -->
          <span class="rounds lean numerals" [class.hidden]="team.roundsWon === 0">
            {{ copy.team.wins(team.roundsWon) }}
          </span>
        </span>
      </button>
    }

    <app-board-moments />
  `,
  styles: `
    :host {
      position: relative;
      display: flex;
      overflow: hidden;
    }

    .panel {
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
      padding-right: var(--s-xl);
    }

    .panel--b {
      padding-left: calc(var(--s-xl) + var(--s-sm));
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

    .who {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .name {
      font: italic 800 var(--t-button) / 1.15 var(--font);
      text-transform: uppercase;
    }

    .players {
      font: italic 600 var(--t-label) / 1.3 var(--font);
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

    .score {
      position: relative;
      min-width: 0;
    }

    /* The points of the hand, rising off the total. */
    .tag {
      --fill: var(--c-ink);
      --lean-inset: 3px;

      position: absolute;
      top: 0;
      right: 0;
      padding: 2px var(--s-md);
      color: var(--team);
      font: italic 800 var(--t-compact) / 1.2 var(--font);
      pointer-events: none;
      opacity: 0;
    }

    /* The band waits outside the livery and only its position moves, so the crossing stays cheap. */
    .sheen {
      position: absolute;
      top: 0;
      bottom: 0;
      z-index: -1;
      overflow: hidden;
      pointer-events: none;
    }

    .sheen::before {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      width: 45%;
      background: linear-gradient(
        100deg,
        transparent,
        rgb(255 255 255 / 0.42) 42%,
        rgb(255 255 255 / 0.42) 58%,
        transparent
      );
      transform: translateX(-100%);
    }

    .panel--a .sheen {
      left: -48px;
      right: -15px;
      clip-path: polygon(var(--seam-lean) 0, 100% 0, calc(100% - var(--seam-lean)) 100%, 0 100%);
    }

    .panel--b .sheen {
      left: -15px;
      right: -48px;
      clip-path: polygon(var(--seam-lean) 0, 100% 0, calc(100% - var(--seam-lean)) 100%, 0 100%);
    }

    /* One hand from winning: the line to go becomes a stripe that catches the light. */
    /* Two lines, each fitted on its own: the points left, then what they are for. */
    .stripe {
      --fill: var(--c-ink);
      --lean-inset: 6px;

      display: flex;
      flex-direction: column;
      max-width: 100%;
      padding: 2px var(--s-lg);
      overflow: hidden;
      color: var(--team);
      font: italic 800 var(--t-meta) / 1.3 var(--font);
      letter-spacing: 0.4px;
      text-transform: uppercase;
    }

    .stripe > * {
      max-width: 100%;
    }

    .stripe__goal {
      font-size: var(--t-label);
    }

    /* The light follows the stripe's own slant; the stripe is small, so moving its gradient is cheap. */
    .stripe::after {
      content: '';
      position: absolute;
      inset: 0 var(--lean-inset);
      z-index: -1;
      transform: skewX(-12deg);
      background: linear-gradient(
        100deg,
        transparent 38%,
        rgb(255 255 255 / 0.3) 50%,
        transparent 62%
      );
      background-size: 300% 100%;
      background-position: 100% 0;
    }

    @media (prefers-reduced-motion: no-preference) {
      .tag {
        animation: tag 600ms var(--ease-out);
      }

      @keyframes tag {
        0% {
          opacity: 0;
          transform: translateY(8px);
        }

        20% {
          opacity: 1;
        }

        70% {
          opacity: 1;
        }

        100% {
          opacity: 0;
          transform: translateY(-28px);
        }
      }

      .sheen::before {
        animation: sheen 320ms ease-out;
      }

      @keyframes sheen {
        to {
          transform: translateX(230%);
        }
      }

      .stripe {
        animation: stripe-in 220ms var(--ease-out) backwards;
      }

      .panel--b .stripe {
        --from: 24px;
      }

      @keyframes stripe-in {
        from {
          opacity: 0;
          transform: translateX(var(--from, -24px));
        }
      }

      .stripe::after {
        animation: glint 2.4s 400ms ease-in-out infinite;
      }

      @keyframes glint {
        45%,
        100% {
          background-position: 0 0;
        }
      }
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

      .who {
        flex: 1 1 100%;
      }

      .name {
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
  private readonly panels = viewChildren<ElementRef<HTMLElement>>('panel');

  private readonly hand = computed(() => {
    const moment = this.store.moment();
    return moment?.kind === 'hand' ? moment : null;
  });

  protected readonly teams = computed(() => {
    const state = this.store.state();
    const totals = this.store.totals();
    const hand = this.hand();
    return TEAM_IDS.map((id) => {
      const { name, players, roundsWon } = state.teams[id];
      const total = totals[id];
      const remaining = Math.max(0, state.target - total);
      const mine = hand !== null && hand.team === id ? hand : null;
      const toWin = matchPoint(state, id);
      const a11y = copy.team.a11y(name, players, total, remaining, roundsWon);
      return {
        id,
        name,
        players,
        roundsWon,
        total,
        remaining,
        matchPoint: toWin,
        sheen: mine === null ? [] : [mine.seq],
        tag: mine === null ? [] : [mine],
        label: [a11y, toWin === null ? null : copy.moments.matchPoint(toWin), copy.team.a11yHint]
          .filter((part) => part !== null)
          .join('. '),
      };
    });
  });

  // Both totals share one size, so a long score never makes the two sides unequal.
  protected readonly long = computed(() => {
    const { a, b } = this.store.totals();
    return Math.max(String(a).length, String(b).length) > 4;
  });

  constructor() {
    // Only a moment moves the board: an undo or another tab changes it quietly.
    let played = this.store.moment()?.seq ?? 0;
    effect(() => {
      const moment = this.store.moment();
      if (moment === null || moment.seq === played) return;
      played = moment.seq;
      untracked(() => {
        if (moment.kind === 'hand') this.kick(moment.team);
        // From Inicio the liveries are already in place: Inicio folds up onto them.
        else if (!moment.fromHome) this.faceOff();
      });
    });
  }

  /** The total lands with a little weight. */
  private kick(team: TeamId): void {
    const total = this.totals()[TEAM_IDS.indexOf(team)]?.nativeElement;
    play(total, [{ transform: 'scale(1.12) skewX(-3deg)' }, { transform: 'none' }], {
      duration: 260,
    });
  }

  /** Both liveries slam in from their own sides and meet at the seam. */
  private faceOff(): void {
    this.panels().forEach(({ nativeElement }, index) => {
      const side = index === 0 ? -1 : 1;
      play(
        nativeElement,
        [
          { transform: `translateX(${side * 60}%)` },
          { transform: `translateX(${side * -6}px)`, offset: 0.6 },
          { transform: 'none' },
        ],
        { duration: 520 },
      );
    });
  }
}
