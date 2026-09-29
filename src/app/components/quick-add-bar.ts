import { ChangeDetectionStrategy, Component, computed, inject, output } from '@angular/core';

import { copy } from '../copy';
import { FitText } from '../directives/fit-text';
import { LongPress } from '../directives/long-press';
import { GameStore } from '../game/game.store';
import { TEAM_IDS, TeamId } from '../game/state';

/**
 * The thumb zone. Each team's column carries the every-hand action at the
 * bottom edge and the occasional bonus above it, so a stray touch while
 * picking the phone up opens a sheet instead of scoring.
 */
@Component({
  selector: 'app-quick-add-bar',
  imports: [LongPress, FitText],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (team of teams(); track team.id) {
      <div class="column">
        <button
          type="button"
          class="slab slab--compact lean numerals"
          [attr.aria-label]="copy.bar.quickA11y(quick(), team.name)"
          (click)="store.addQuick(team.id)"
          (appLongPress)="editQuick.emit()"
        >
          <span class="slab__label" [appFitText]="copy.bar.quick(quick())">{{
            copy.bar.quick(quick())
          }}</span>
        </button>
        <button
          type="button"
          class="slab slab--team lean"
          [style.--fill]="'var(--c-team-' + team.id + ')'"
          [attr.aria-label]="copy.bar.enterA11y(team.name)"
          (click)="enter.emit(team.id)"
        >
          <span class="slab__label" [appFitText]="copy.bar.enter">{{ copy.bar.enter }}</span>
        </button>
      </div>
    }
  `,
  styles: `
    :host {
      display: flex;
      gap: var(--s-xl);
      padding: var(--s-md) var(--s-xl) calc(env(safe-area-inset-bottom) + var(--s-md));
      border-top: 1px solid var(--c-line);
    }

    .column {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: var(--s-sm);
    }

    /* Short screens: the bonus sits beside the main action instead of above it. */
    @media (max-height: 36em) {
      :host {
        gap: var(--s-lg);
        padding-top: var(--s-sm);
        padding-bottom: calc(env(safe-area-inset-bottom) + var(--s-sm));
      }

      .slab {
        min-height: var(--min-target);
      }
    }

    @media (max-height: 36em) and (min-width: 30em) {
      .column {
        flex-direction: row;
      }

      .slab {
        flex: 1 1 0;
        padding: 0 var(--s-md);
      }
    }
  `,
})
export class QuickAddBar {
  protected readonly copy = copy;
  protected readonly store = inject(GameStore);

  readonly enter = output<TeamId>();
  readonly editQuick = output<void>();

  protected readonly quick = computed(() => this.store.state().quickValue);
  protected readonly teams = computed(() =>
    TEAM_IDS.map((id) => ({ id, name: this.store.state().teams[id].name })),
  );
}
