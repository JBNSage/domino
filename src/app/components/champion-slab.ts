import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { copy } from '../copy';
import { FitText } from '../directives/fit-text';
import { Players, TeamId } from '../game/state';

/** The team that won a tournament, in the colour of the side it last won on. */
@Component({
  selector: 'app-champion-slab',
  imports: [FitText],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': '"tone--" + (tone() ?? "none")', '[class.on-flood]': 'onFlood()' },
  template: `
    <div class="slab-box lean">
      @if (labelled()) {
        <span class="label">{{ copy.history.champion }}</span>
      }
      <span class="name" [appFitText]="name()">{{ name() }}</span>
      @if (players(); as players) {
        <span class="players" [appFitText]="copy.players.pair(players)">{{
          copy.players.pair(players)
        }}</span>
      }
      <span class="wins numerals">{{ copy.tournament.wins(won()) }}</span>
    </div>
  `,
  styles: `
    :host {
      --team: var(--c-text);
      --on-team: var(--c-ground);

      display: block;
    }

    :host(.tone--a) {
      --team: var(--c-team-a);
      --on-team: var(--c-ink);
    }

    :host(.tone--b) {
      --team: var(--c-team-b);
      --on-team: var(--c-ink);
    }

    .slab-box {
      --fill: var(--team);
      --edge: var(--c-team-edge);
      --lean-inset: 22px;

      display: flex;
      flex-direction: column;
      padding: var(--s-lg) calc(var(--s-xxl) + var(--s-lg));
      color: var(--on-team);
    }

    :host(.tone--none) .slab-box {
      --edge: transparent;
    }

    /* On a flood of its own colour the slab turns to ink, as the winner's does. */
    :host(.on-flood) .slab-box {
      --fill: var(--c-ink);
      --edge: transparent;

      color: var(--team);
    }

    .label,
    .wins {
      font: italic 600 var(--t-meta) / 1.3 var(--font);
      letter-spacing: 0.4px;
      text-transform: uppercase;
    }

    .name {
      font: italic 800 var(--t-display) / 1.15 var(--font);
      text-transform: uppercase;
    }

    .players {
      font: italic 600 var(--t-body) / 1.3 var(--font);
      text-transform: uppercase;
    }

    .wins {
      margin-top: var(--s-xs);
    }

    @media (max-height: 36em) {
      .slab-box {
        padding-block: var(--s-sm);
      }

      .name {
        font-size: var(--t-title);
      }
    }
  `,
})
export class ChampionSlab {
  protected readonly copy = copy;

  readonly name = input.required<string>();
  readonly players = input<Players | null>(null);
  readonly won = input.required<number>();
  readonly tone = input<TeamId | null>(null);
  /** Off where the screen's own heading already says "Campeón". */
  readonly labelled = input(true);
  /** The slab sits on a screen flooded with the same colour. */
  readonly onFlood = input(false);
}
