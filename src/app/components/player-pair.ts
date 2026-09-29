import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { Players } from '../game/state';

/**
 * A team's two players on one line. When the line has no room the second
 * name moves under the first; the type never shrinks to fit.
 */
@Component({
  selector: 'app-player-pair',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.wrap]': 'wrap()' },
  template: `
    <!-- The dot belongs to the first name, so a wrapped line never starts with it. -->
    <span class="player">{{ players()[0] }}&nbsp;·</span>&ngsp;
    <span class="player">{{ players()[1] }}</span>
  `,
  styles: `
    :host {
      display: flex;
      flex-wrap: wrap;
      column-gap: 0.4em;
      min-width: 0;
      max-width: 100%;
    }

    .player {
      min-width: 0;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* Where the names are the content, a long one breaks instead of ending in an ellipsis. */
    :host(.wrap) .player {
      white-space: normal;
      overflow-wrap: break-word;
    }
  `,
})
export class PlayerPair {
  readonly players = input.required<Players>();
  readonly wrap = input(false);
}
