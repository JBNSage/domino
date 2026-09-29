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

/** One line of text, such as a name, written on an underline. */
@Component({
  selector: 'app-text-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label class="label" [for]="id">{{ label() }}</label>
    <input
      #field
      class="input"
      type="text"
      autocomplete="off"
      autocapitalize="characters"
      autocorrect="off"
      spellcheck="false"
      [id]="id"
      [class.invalid]="invalid()"
      [value]="value()"
      [attr.enterkeyhint]="last() ? 'done' : 'next'"
      [attr.maxlength]="maxLength()"
      [attr.placeholder]="placeholder()"
      [attr.aria-invalid]="invalid() ? 'true' : null"
      [attr.aria-describedby]="describedBy()"
      (input)="value.set(field.value)"
      (focus)="field.select()"
      (keydown.enter)="enter($event)"
    />
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
    }

    .label {
      color: var(--c-muted);
      font: italic 600 var(--t-label) / 1.3 var(--font);
      text-transform: uppercase;
    }

    .input {
      width: 100%;
      min-height: var(--min-target);
      padding: var(--s-xs) 0;
      border: 0;
      border-bottom: 2px solid var(--c-line);
      border-radius: 0;
      background: none;
      color: var(--c-text);
      caret-color: var(--c-text);
      font: italic 800 var(--field-size, var(--t-title)) / 1.2 var(--font);
      text-transform: uppercase;
    }

    .input::placeholder {
      color: var(--c-muted);
      opacity: 1;
    }

    .input:focus {
      border-bottom-color: var(--c-text);
    }

    .input.invalid {
      border-bottom-color: var(--c-danger);
    }

    .input:focus-visible {
      outline-offset: 2px;
    }
  `,
})
export class TextField {
  readonly label = input.required<string>();
  readonly value = model('');
  readonly maxLength = input.required<number>();
  /** The name used when the field is left empty. */
  readonly placeholder = input<string | null>(null);
  readonly invalid = input(false);
  readonly describedBy = input<string | null>(null);
  /** The last field of its form: Enter sends the form instead of moving on. */
  readonly last = input(false);
  readonly submitted = output<void>();

  protected readonly id = `text-field-${nextId++}`;

  private readonly field = viewChild.required<ElementRef<HTMLInputElement>>('field');

  /** Focuses the field; `text` is written first so it can be selected in the same tap. */
  focus(text?: string): void {
    const field = this.field().nativeElement;
    if (text !== undefined) field.value = text;
    field.focus();
    field.select();
  }

  /** Writes the text without waiting for the next render, as a sheet does on opening. */
  write(text: string): void {
    this.field().nativeElement.value = text;
    this.value.set(text);
  }

  // Without this the same Enter would press the button that gets focus next.
  protected enter(event: Event): void {
    event.preventDefault();
    this.submitted.emit();
  }
}
