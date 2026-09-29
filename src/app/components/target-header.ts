import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';

import { copy } from '../copy';
import { FitText } from '../directives/fit-text';
import { GameStore } from '../game/game.store';
import { Appearance } from '../platform/appearance';

@Component({
  selector: 'app-target-header',
  imports: [FitText],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      class="slab slab--compact lean target"
      [attr.aria-label]="copy.target.edit(target())"
      (click)="editTarget.emit()"
    >
      <span class="label" [appFitText]="copy.target.label" [minScale]="0.5">{{
        copy.target.label
      }}</span>
      <span class="value numerals">{{ target() }}</span>
      <svg class="pencil" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 20l1-4.5L16.5 4 20 7.5 8.5 19z" />
        <path d="M14 6.5l3.5 3.5" />
      </svg>
    </button>
    <div class="tools">
      <button
        type="button"
        class="tool"
        [attr.aria-label]="dark() ? copy.appearance.toLight : copy.appearance.toDark"
        (click)="toggleAppearance()"
      >
        <!-- Shows what is on now: a moon by night, a sun by day. -->
        <svg viewBox="0 0 24 24" aria-hidden="true">
          @if (dark()) {
            <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
          } @else {
            <circle cx="12" cy="12" r="4" />
            <path
              d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"
            />
          }
        </svg>
      </button>
      <button type="button" class="tool" [attr.aria-label]="copy.reset.a11y" (click)="reset.emit()">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 7h16" />
          <path d="M9 7V4h6v3" />
          <path d="M6 7l1 13h10l1-13" />
          <path d="M10 11v6M14 11v6" />
        </svg>
      </button>
    </div>
  `,
  styles: `
    :host {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--s-sm);
      padding: var(--s-md) var(--s-sm) var(--s-md) calc(var(--s-lg) + var(--s-sm));
    }

    .target {
      flex-shrink: 1;
    }

    @media (max-height: 36em) {
      :host {
        padding-block: var(--s-xs);
      }
    }

    .label {
      min-width: 0;
      color: var(--c-muted);
      font: italic 600 var(--t-body) / 1.2 var(--font);
      letter-spacing: 0;
    }

    .value {
      font-size: var(--t-title);
      letter-spacing: 0;
    }

    svg {
      flex: none;
      fill: none;
      stroke: var(--c-muted);
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .pencil {
      width: 16px;
      height: 16px;
    }

    .tools {
      flex: none;
      display: flex;
    }

    .tool {
      flex: none;
      display: grid;
      place-items: center;
      width: var(--min-target);
      height: var(--min-target);
      padding: 0;
      border: 0;
      background: none;
    }

    .tool svg {
      width: 24px;
      height: 24px;
    }

    .tool:active {
      opacity: var(--pressed);
    }

    @media (hover: hover) {
      .tool:hover svg {
        stroke: var(--c-text);
      }
    }
  `,
})
export class TargetHeader {
  protected readonly copy = copy;

  private readonly appearance = inject(Appearance);
  private readonly store = inject(GameStore);

  readonly target = input.required<number>();
  readonly editTarget = output<void>();
  // eslint-disable-next-line @angular-eslint/no-output-native
  readonly reset = output<void>();

  protected readonly dark = () => this.appearance.scheme() === 'dark';

  protected toggleAppearance(): void {
    const scheme = this.appearance.toggle();
    this.store.announce(copy.appearance.announce(copy.appearance[scheme]));
  }
}
