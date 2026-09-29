import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { copy } from '../copy';
import { FitText } from '../directives/fit-text';

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
    <button type="button" class="reset" [attr.aria-label]="copy.reset.a11y" (click)="reset.emit()">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 7h16" />
        <path d="M9 7V4h6v3" />
        <path d="M6 7l1 13h10l1-13" />
        <path d="M10 11v6M14 11v6" />
      </svg>
    </button>
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

    .reset {
      flex: none;
      display: grid;
      place-items: center;
      width: var(--min-target);
      height: var(--min-target);
      padding: 0;
      border: 0;
      background: none;
    }

    .reset svg {
      width: 24px;
      height: 24px;
    }

    .reset:active {
      opacity: var(--pressed);
    }

    @media (hover: hover) {
      .reset:hover svg {
        stroke: var(--c-text);
      }
    }
  `,
})
export class TargetHeader {
  protected readonly copy = copy;

  readonly target = input.required<number>();
  readonly editTarget = output<void>();
  // eslint-disable-next-line @angular-eslint/no-output-native
  readonly reset = output<void>();
}
