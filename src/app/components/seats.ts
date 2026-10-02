import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  output,
} from '@angular/core';

import { copy } from '../copy';
import { FitText } from '../directives/fit-text';
import { Players, TeamId } from '../game/state';
import { play } from '../platform/motion';
import { PlayerPair } from './player-pair';

/** One side of the match about to start. */
export type Seat = {
  side: TeamId;
  name: string;
  players: Players | null;
  won: number;
  /** In a tournament, a team that comes in from the queue. */
  enters: boolean;
};

/**
 * The two sides of the next match, stacked and facing each other across a VS.
 * Each is a button that asks to change that side.
 */
@Component({
  selector: 'app-seats',
  imports: [FitText, PlayerPair],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (seat of seats(); track seat.side) {
      <button
        type="button"
        class="seat lean"
        [class]="'seat--' + seat.side"
        [disabled]="fixed()"
        [attr.aria-describedby]="describedBy()"
        [attr.aria-label]="
          fixed()
            ? copy.tournament.seatFixedA11y(seat.name, seat.players, seat.won)
            : copy.tournament.seatA11y(seat.name, seat.players, seat.won)
        "
        (click)="pick.emit(seat.side)"
      >
        @if (seat.enters) {
          <span class="enters lean">{{ copy.moments.enters }}</span>
        }
        <span class="who">
          <span class="name">{{ seat.name }}</span>
          @if (seat.players; as players) {
            <app-player-pair class="players" [players]="players" />
          } @else if (!showWins()) {
            <span class="players">{{ copy.players.none }}</span>
          }
          @if (showWins()) {
            <span class="wins lean numerals">
              <span [appFitText]="copy.tournament.wins(seat.won)">{{
                copy.tournament.wins(seat.won)
              }}</span>
            </span>
          }
        </span>
        @if (!fixed()) {
          @if (icon() === 'swap') {
            <!-- Two arrows passing each other: this team can be swapped. -->
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 8h14l-3.5-3.5M20 16H6l3.5 3.5" />
            </svg>
          } @else {
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 20l1-4.5L16.5 4 20 7.5 8.5 19z" />
              <path d="M14 6.5l3.5 3.5" />
            </svg>
          }
        }
      </button>
    }
    <span class="vs lean" aria-hidden="true">{{ copy.moments.vs }}</span>
  `,
  styles: `
    :host {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: var(--s-md);
    }

    /* The two sides face each other across the gap. */
    .vs {
      --fill: var(--c-ink);
      --edge: var(--c-text);
      --lean-inset: 6px;

      position: absolute;
      top: 50%;
      left: 50%;
      padding: var(--s-xs) var(--s-xl);
      color: var(--c-on-ink);
      font: italic 800 var(--t-title) / 1.1 var(--font);
      transform: translate(-50%, -50%);
      pointer-events: none;
    }

    /* The team that comes in from the queue. */
    .enters {
      --fill: var(--c-ink);
      --lean-inset: 3px;

      position: absolute;
      top: var(--s-sm);
      right: min(var(--s-xxl), 8vw);
      padding: 2px var(--s-md);
      color: var(--team);
      font: italic 800 var(--t-label) / 1.3 var(--font);
      letter-spacing: 0.4px;
      text-transform: uppercase;
    }

    .seat {
      --edge: var(--c-team-edge);
      --lean-inset: 18px;
      --focus: var(--c-ink);

      position: relative;
      width: 100%;
      min-height: 120px;
      display: flex;
      align-items: center;
      gap: var(--s-md);
      padding: var(--s-lg) min(var(--s-xxl) + var(--s-sm), 10vw);
      border: 0;
      background: none;
      color: var(--c-ink);
      text-align: left;
    }

    .seat:disabled {
      cursor: default;
    }

    .seat:focus-visible {
      outline-offset: -8px;
    }

    .seat--a {
      --fill: var(--c-team-a);
      --team: var(--c-team-a);
    }

    .seat--b {
      --fill: var(--c-team-b);
      --team: var(--c-team-b);
    }

    .seat:not(:disabled):active::before {
      opacity: var(--pressed);
    }

    @media (hover: hover) {
      .seat:not(:disabled):hover::before {
        filter: brightness(1.06);
      }
    }

    .who {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }

    .who > * {
      max-width: 100%;
    }

    /* A long name wraps rather than losing its last letters. */
    .name {
      font: italic 800 var(--t-title) / 1.15 var(--font);
      text-transform: uppercase;
      overflow-wrap: break-word;
      hyphens: auto;
    }

    .players {
      font: italic 600 var(--t-meta) / 1.3 var(--font);
      text-transform: uppercase;
    }

    .wins {
      --fill: var(--c-ink);
      --lean-inset: 3px;

      min-width: 0;
      margin-top: var(--s-sm);
      padding: 2px var(--s-md);
      color: var(--team);
      font: italic 600 var(--t-meta) / 1.3 var(--font);
      letter-spacing: 0.4px;
      text-transform: uppercase;
    }

    .seat svg {
      flex: none;
      width: 28px;
      height: 28px;
      fill: none;
      stroke: var(--c-ink);
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    @media (max-height: 36em) {
      .seat {
        min-height: 0;
        padding-block: var(--s-sm);
      }

      .wins {
        margin-top: var(--s-xs);
      }
    }

    @media (max-height: 36em) and (min-width: 30em) {
      :host {
        flex-direction: row;
        gap: var(--s-xs);
      }

      .seat {
        flex: 1 1 0;
        min-width: 0;
        padding-inline: var(--s-xl);
      }
    }
  `,
})
export class Seats {
  protected readonly copy = copy;

  readonly seats = input.required<Seat[]>();
  /** Nothing can change: the sides are shown, not offered. */
  readonly fixed = input(false);
  readonly describedBy = input<string | null>(null);
  /** Whether each side shows the matches it has won. */
  readonly showWins = input(true);
  /** Arrows where another team can take the side; a pencil where the team itself is edited. */
  readonly icon = input<'swap' | 'edit'>('swap');
  readonly pick = output<TeamId>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  /** The two sides slam in from their own edges and meet at the VS. */
  faceOff(): void {
    this.host.querySelectorAll('.seat').forEach((seat, index) => {
      const side = index === 0 ? -1 : 1;
      play(
        seat,
        [
          { transform: `translateX(${side * 55}%)`, opacity: 0 },
          { transform: `translateX(${side * -4}px)`, opacity: 1, offset: 0.65 },
          { transform: 'none' },
        ],
        { duration: 440, delay: index * 40, fill: 'backwards' },
      );
    });
    play(
      this.host.querySelector(':scope > .vs'),
      [
        { transform: 'translate(-50%, -50%) scale(2)', opacity: 0 },
        { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
      ],
      { duration: 240, delay: 260, fill: 'backwards' },
    );
    this.host.querySelectorAll('.enters').forEach((stamp) =>
      play(
        stamp,
        [
          { transform: 'scale(1.8) rotate(-6deg)', opacity: 0 },
          { transform: 'none', opacity: 1 },
        ],
        { duration: 260, delay: 420, fill: 'backwards' },
      ),
    );
  }

  /** The choice is the two teams, so reading starts at the first that can change. */
  focusFirst(): void {
    this.host.querySelector<HTMLElement>('.seat:not(:disabled)')?.focus();
  }
}
