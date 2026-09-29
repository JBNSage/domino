import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  model,
  output,
  viewChild,
} from '@angular/core';

let nextId = 0;

@Component({
  selector: 'app-number-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label class="label" [for]="id">{{ label() }}</label>
    <input
      #field
      class="input numerals"
      type="text"
      inputmode="numeric"
      pattern="[0-9]*"
      enterkeyhint="done"
      autocomplete="off"
      [id]="id"
      [class.invalid]="error()"
      [value]="value()"
      [attr.maxlength]="maxLength()"
      [attr.aria-invalid]="error() ? 'true' : null"
      [attr.aria-describedby]="id + '-message'"
      (input)="value.set(field.value)"
      (focus)="field.select()"
      (keydown.enter)="enter($event)"
    />
    <!-- Always in the page, so screen readers hear the message arrive. -->
    <p class="message" role="status" [id]="id + '-message'" [class.error]="error()">
      {{ error() ?? notice() ?? '' }}
    </p>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
    }

    .label {
      margin-bottom: var(--s-xs);
      color: var(--c-muted);
      font: italic 600 var(--t-label) / 1.3 var(--font);
      text-transform: uppercase;
    }

    .input {
      width: 100%;
      min-height: 76px;
      padding: var(--s-sm) var(--s-lg);
      border: 2px solid var(--c-line);
      border-radius: 0;
      background: var(--c-surface);
      color: var(--c-text);
      caret-color: var(--caret, var(--c-text));
      font: italic 800 var(--t-field) / 1.2 var(--font);
      appearance: none;
    }

    /* By day the team colours vanish on the white field, so the caret stays ink. */
    @media (prefers-color-scheme: light) {
      .input {
        caret-color: var(--c-text);
      }
    }

    @media (max-height: 36em) {
      .input {
        min-height: 56px;
        font-size: var(--t-title);
      }
    }

    .input.invalid {
      border-color: var(--c-danger);
    }

    .input:focus-visible {
      outline-offset: 0;
    }

    .message {
      margin: 0;
      color: var(--c-text);
      font: 500 var(--t-body) / 1.35 var(--font);
    }

    .message.error {
      color: var(--c-danger);
    }
  `,
})
export class NumberField {
  readonly label = input.required<string>();
  /** What was typed, untouched: a sign or a decimal is reported, not quietly removed. */
  readonly value = model('');
  readonly maxLength = input.required<number>();
  readonly error = input<string | null>(null);
  /** A non-blocking note under the field, such as a consequence of saving. */
  readonly notice = input<string | null>(null);
  readonly submitted = output<void>();

  protected readonly id = `number-field-${nextId++}`;

  private readonly field = viewChild.required<ElementRef<HTMLInputElement>>('field');

  /** Focuses the field; `text` is written first so it can be selected in the same tap. */
  focus(text?: string): void {
    const field = this.field().nativeElement;
    if (text !== undefined) field.value = text;
    field.focus();
    field.select();
  }

  // Closing a sheet hands focus back to the button that opened it; without this
  // the same Enter would press that button and open the sheet again.
  protected enter(event: Event): void {
    event.preventDefault();
    this.submitted.emit();
  }
}
