import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  model,
} from '@angular/core';

import { FitText } from '../directives/fit-text';

export type Choice<T extends string> = { value: T; label: string };

let nextId = 0;

/** One choice out of a few, shown side by side. It applies as soon as it is touched. */
@Component({
  selector: 'app-choice-group',
  imports: [FitText],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="label" [id]="id">{{ label() }}</span>
    <div class="choices" role="radiogroup" [attr.aria-labelledby]="id">
      @for (option of options(); track option.value) {
        <button
          type="button"
          role="radio"
          class="slab slab--compact lean choice"
          [class.choice--on]="value() === option.value"
          [attr.aria-checked]="value() === option.value"
          [attr.tabindex]="value() === option.value ? 0 : -1"
          [attr.data-choice]="option.value"
          (click)="value.set(option.value)"
          (keydown)="move($event)"
        >
          <span class="slab__label" [appFitText]="option.label" [minScale]="0.4">{{
            option.label
          }}</span>
        </button>
      }
    </div>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: var(--s-xs);
    }

    .label {
      color: var(--c-muted);
      font: italic 600 var(--t-label) / 1.3 var(--font);
      text-transform: uppercase;
    }

    .choices {
      display: flex;
      gap: var(--s-sm);
    }

    .choice {
      --lean-inset: 5px;

      flex: 1 1 0;
      padding: 0 min(var(--s-sm), 2vw);
    }

    .choice--on {
      --fill: var(--c-text);
      --edge: transparent;
      --label: var(--c-ground);
    }
  `,
})
export class ChoiceGroup<T extends string> {
  readonly label = input.required<string>();
  readonly options = input.required<Choice<T>[]>();
  readonly value = model.required<T>();

  protected readonly id = `choice-group-${nextId++}`;

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  /** Arrow keys move the choice, as in any group of radio buttons. */
  protected move(event: KeyboardEvent): void {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    if (step === undefined) return;
    event.preventDefault();

    const values = this.options().map((option) => option.value);
    const next = values[(values.indexOf(this.value()) + step + values.length) % values.length];
    this.value.set(next);
    this.host.querySelector<HTMLElement>(`[data-choice="${next}"]`)?.focus();
  }
}
