import { ChangeDetectionStrategy, Component, computed, signal, viewChild } from '@angular/core';

import { copy } from '../copy';
import { FitText } from '../directives/fit-text';
import { MAX_NAME_LENGTH, cleanLabel, sameName } from '../game/state';
import { Sheet } from './sheet';
import { TextField } from './text-field';

/** One name to write: a mesa's or a player's. */
export type NameEdit = {
  title: string;
  label: string;
  value: string;
  placeholder: string | null;
  /** Names already used, which this one may not repeat. */
  taken: string[];
  takenMessage: string;
  emptyMessage: string;
  confirm: string;
  save: (name: string) => void;
  remove?: { label: string; run: () => void };
  /** Why the entry cannot be removed, shown instead of the button. */
  kept?: string | null;
  /** People this name may be, offered under the field: choosing one closes the sheet. */
  people?: { heading: string; help: string; options: PersonOption[] } | null;
};

export type PersonOption = { label: string; pick: () => void };

@Component({
  selector: 'app-name-sheet',
  imports: [Sheet, TextField, FitText],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-sheet labelledBy="name-sheet-title">
      <h2 class="title" id="name-sheet-title">{{ request()?.title }}</h2>

      <app-text-field
        [label]="request()?.label ?? ''"
        [maxLength]="maxLength"
        [placeholder]="request()?.placeholder ?? null"
        [invalid]="taken()"
        [last]="true"
        describedBy="name-sheet-message"
        [(value)]="text"
        (submitted)="submit()"
      />

      <p class="message" id="name-sheet-message" role="status" [class.error]="taken()">
        {{ message() }}
      </p>

      @if (request()?.people; as people) {
        <section class="people">
          <h3 class="heading">{{ people.heading }}</h3>
          <p class="kept">{{ people.help }}</p>
          @for (option of people.options; track option.label) {
            <button type="button" class="slab slab--compact lean person" (click)="choose(option)">
              <span class="slab__label" [appFitText]="option.label">{{ option.label }}</span>
            </button>
          }
        </section>
      }

      @if (request()?.kept; as kept) {
        <p class="kept">{{ kept }}</p>
      } @else if (request()?.remove; as remove) {
        <button type="button" class="slab slab--compact slab--warn lean remove" (click)="drop()">
          <span class="slab__label" [appFitText]="remove.label">{{ remove.label }}</span>
        </button>
      }

      <div class="slab-row">
        <button type="button" class="slab lean" (click)="sheet().close()">
          <span class="slab__label" [appFitText]="copy.common.cancel">{{
            copy.common.cancel
          }}</span>
        </button>
        <button
          type="button"
          class="slab slab--primary lean confirm"
          [disabled]="!canSave()"
          (click)="submit()"
        >
          <span class="slab__label" [appFitText]="confirm()">{{ confirm() }}</span>
        </button>
      </div>
    </app-sheet>
  `,
  styles: `
    .title {
      margin: 0;
      font: italic 800 var(--t-title) / 1.15 var(--font);
      text-transform: uppercase;
      text-wrap: balance;
      overflow-wrap: anywhere;
    }

    .message,
    .kept {
      margin: 0;
      max-width: 65ch;
      color: var(--c-muted);
      line-height: 1.35;
    }

    .message:empty {
      display: none;
    }

    .message.error {
      color: var(--c-danger);
    }

    .people {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: var(--s-sm);
    }

    .heading {
      margin: 0;
      padding: 0 var(--s-sm);
      color: var(--c-muted);
      font: italic 600 var(--t-label) / 1.3 var(--font);
      text-transform: uppercase;
    }

    .person,
    .remove {
      align-self: flex-start;
      max-width: calc(100% - var(--s-lg));
      margin: 0 var(--s-sm);
    }

    .confirm:not(:disabled) {
      --fill: var(--c-text);
      --edge: transparent;
      --label: var(--c-ground);
    }
  `,
})
export class NameSheet {
  protected readonly copy = copy;
  protected readonly maxLength = MAX_NAME_LENGTH;

  protected readonly sheet = viewChild.required(Sheet);
  private readonly field = viewChild.required(TextField);

  protected readonly request = signal<NameEdit | null>(null);
  protected readonly text = signal('');
  protected readonly confirm = computed(() => this.request()?.confirm ?? copy.players.save);

  private readonly name = computed(() => cleanLabel(this.text(), ''));
  protected readonly taken = computed(() =>
    (this.request()?.taken ?? []).some((other) => sameName(other, this.name())),
  );
  protected readonly canSave = computed(() => this.name() !== '' && !this.taken());

  protected readonly message = computed(() => {
    const request = this.request();
    if (request === null) return '';
    if (this.taken()) return request.takenMessage;
    if (Array.from(this.text()).length >= MAX_NAME_LENGTH)
      return copy.players.limit(MAX_NAME_LENGTH);
    return this.name() === '' ? request.emptyMessage : '';
  });

  /** Called straight from the tap, so the keyboard opens with the sheet. */
  open(request: NameEdit): void {
    this.request.set(request);
    this.field().write(request.value);
    this.sheet().open();
    this.field().focus();
  }

  protected submit(): void {
    const request = this.request();
    if (request === null || !this.canSave()) return;
    this.sheet().close();
    request.save(this.name());
  }

  protected choose(option: PersonOption): void {
    this.sheet().close();
    option.pick();
  }

  protected drop(): void {
    const request = this.request();
    this.sheet().close();
    request?.remove?.run();
  }
}
