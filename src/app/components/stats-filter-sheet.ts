import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';

import { copy } from '../copy';
import { FitText } from '../directives/fit-text';
import {
  DatePreset,
  TableChoice,
  dayOf,
  parseDay,
  presetOf,
  rangeOf,
  sameTable,
} from '../game/stats';
import { Sheet } from './sheet';
import { StatsView, labelOf, presetLabel } from './stats-view';

type Option = { id: string; label: string; checked: boolean; pick: () => void };

/** Narrows the statistics to one mesa, or to some days. A choice applies at once. */
@Component({
  selector: 'app-stats-filter-sheet',
  imports: [Sheet, FitText],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-sheet labelledBy="stats-filter-title">
      <h2 class="title" id="stats-filter-title">{{ title() }}</h2>

      <div class="options" role="radiogroup" aria-labelledby="stats-filter-title">
        @for (option of options(); track option.id) {
          <button
            type="button"
            role="radio"
            class="option lean"
            [class.option--on]="option.checked"
            [attr.aria-checked]="option.checked"
            [attr.tabindex]="option.checked ? 0 : -1"
            (click)="option.pick()"
            (keydown)="move($event)"
          >
            <span class="option-label" [appFitText]="option.label">{{ option.label }}</span>
            @if (option.checked) {
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7" /></svg>
            }
          </button>
        }
      </div>

      @if (mode() === 'dates' && custom()) {
        <div class="range">
          <div class="field">
            <label class="label" for="stats-from">{{ copy.stats.from }}</label>
            <input
              #fromField
              id="stats-from"
              class="input numerals"
              type="date"
              aria-describedby="stats-range-message"
              [class.invalid]="backwards()"
              [attr.aria-invalid]="backwards() ? 'true' : null"
              [value]="fromText()"
              (input)="fromText.set(fromField.value)"
            />
          </div>
          <div class="field">
            <label class="label" for="stats-to">{{ copy.stats.to }}</label>
            <input
              #toField
              id="stats-to"
              class="input numerals"
              type="date"
              aria-describedby="stats-range-message"
              [class.invalid]="backwards()"
              [attr.aria-invalid]="backwards() ? 'true' : null"
              [value]="toText()"
              (input)="toText.set(toField.value)"
            />
          </div>
        </div>
        <p class="message" id="stats-range-message" role="status" [class.error]="backwards()">
          {{ backwards() ? copy.stats.rangeError : copy.stats.rangeHelp }}
        </p>
      }

      <div class="slab-row">
        <button type="button" class="slab slab--compact lean" (click)="sheet().close()">
          <span class="slab__label" [appFitText]="copy.common.cancel">{{
            copy.common.cancel
          }}</span>
        </button>
        @if (mode() === 'dates' && custom()) {
          <button
            type="button"
            class="slab slab--compact slab--primary lean apply"
            [disabled]="backwards()"
            (click)="applyRange()"
          >
            <span class="slab__label" [appFitText]="copy.stats.apply">{{ copy.stats.apply }}</span>
          </button>
        }
      </div>
    </app-sheet>
  `,
  styles: `
    .title {
      margin: 0;
      font: italic 800 var(--t-title) / 1.15 var(--font);
      text-transform: uppercase;
    }

    .options {
      display: flex;
      flex-direction: column;
      gap: var(--s-sm);
    }

    .option {
      --fill: var(--c-surface);
      --lean-inset: 6px;

      min-height: 52px;
      display: flex;
      align-items: center;
      gap: var(--s-md);
      padding: 0 var(--s-xl);
      border: 0;
      background: none;
      color: var(--c-text);
      text-align: left;
    }

    .option--on {
      --fill: var(--c-text);

      color: var(--c-ground);
    }

    .option:active::before {
      opacity: var(--pressed);
    }

    @media (hover: hover) {
      .option:not(.option--on):hover::before {
        filter: brightness(1.12);
      }
    }

    .option-label {
      flex: 1;
      min-width: 0;
      font: italic 800 var(--t-compact) / 1.2 var(--font);
      text-transform: uppercase;
    }

    svg {
      flex: none;
      width: 20px;
      height: 20px;
      fill: none;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .range {
      display: flex;
      flex-wrap: wrap;
      gap: var(--s-lg);
    }

    .field {
      flex: 1 1 9rem;
      min-width: 0;
      display: flex;
      flex-direction: column;
    }

    .label {
      margin-bottom: var(--s-xs);
      color: var(--c-muted);
      font: italic 600 var(--t-label) / 1.3 var(--font);
      text-transform: uppercase;
    }

    /* 16px or more, or iOS zooms the page. */
    .input {
      width: 100%;
      min-height: var(--min-target);
      padding: var(--s-xs) 0;
      border: 0;
      border-bottom: 2px solid var(--c-line);
      border-radius: 0;
      background: none;
      color: var(--c-text);
      font: italic 800 max(16px, var(--t-compact)) / 1.2 var(--font);
    }

    .input:focus {
      border-bottom-color: var(--c-text);
    }

    .input.invalid {
      border-bottom-color: var(--c-danger);
    }

    .input:focus-visible {
      outline-offset: 0;
    }

    .message {
      margin: 0;
      color: var(--c-muted);
      line-height: 1.35;
    }

    .message.error {
      color: var(--c-danger);
    }

    .apply:not(:disabled) {
      --fill: var(--c-text);
      --edge: transparent;
      --label: var(--c-ground);
    }
  `,
})
export class StatsFilterSheet {
  protected readonly copy = copy;

  private readonly view = inject(StatsView);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  protected readonly sheet = viewChild.required(Sheet);

  protected readonly mode = signal<'table' | 'dates'>('table');
  /** Whether the two date fields are shown. */
  protected readonly custom = signal(false);
  protected readonly fromText = signal('');
  protected readonly toText = signal('');

  protected readonly title = computed(() =>
    this.mode() === 'table' ? copy.stats.tableTitle : copy.stats.datesTitle,
  );

  protected readonly backwards = computed(() => {
    const from = parseDay(this.fromText());
    const to = parseDay(this.toText(), true);
    return from !== null && to !== null && to < from;
  });

  protected readonly options = computed<Option[]>(() => {
    const filter = this.view.filter();
    if (this.mode() === 'table') {
      const { tables, none } = this.view.tables();
      const choices: TableChoice[] = [
        { kind: 'all' },
        ...tables,
        ...(none ? [{ kind: 'none' } as TableChoice] : []),
      ];
      return choices.map((table, index) => ({
        id: `t${index}`,
        label: labelOf(table),
        checked: sameTable(table, filter.table),
        pick: () => this.apply({ table }),
      }));
    }
    const preset = this.custom() ? null : presetOf(filter, Date.now());
    const presets: DatePreset[] = ['all', 'today', 'week', 'month'];
    return [
      ...presets.map((each) => ({
        id: each,
        label: presetLabel(each),
        checked: preset === each,
        pick: () => this.apply(rangeOf(each, Date.now())),
      })),
      {
        id: 'custom',
        label: copy.stats.custom,
        checked: preset === null,
        pick: () => this.custom.set(true),
      },
    ];
  });

  /** Called straight from the tap. */
  open(mode: 'table' | 'dates'): void {
    const filter = this.view.filter();
    this.mode.set(mode);
    this.custom.set(mode === 'dates' && presetOf(filter, Date.now()) === null);
    this.fromText.set(filter.from === null ? '' : dayOf(filter.from));
    this.toText.set(filter.to === null ? '' : dayOf(filter.to));
    this.sheet().open();
    // Reading starts on the current choice; no keyboard comes up.
    queueMicrotask(() =>
      this.host.querySelector<HTMLElement>('[role="radio"][aria-checked="true"]')?.focus(),
    );
  }

  protected applyRange(): void {
    if (this.backwards()) return;
    this.apply({ from: parseDay(this.fromText()), to: parseDay(this.toText(), true) });
  }

  private apply(change: Partial<ReturnType<StatsView['filter']>>): void {
    this.view.filter.update((filter) => ({ ...filter, ...change }));
    this.sheet().close();
  }

  /** Arrow keys move along the choices, as in any group of radio buttons. */
  protected move(event: KeyboardEvent): void {
    const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[event.key];
    if (step === undefined) return;
    event.preventDefault();
    const radios = Array.from(this.host.querySelectorAll<HTMLElement>('[role="radio"]'));
    const index = radios.indexOf(event.target as HTMLElement);
    radios[(index + step + radios.length) % radios.length]?.focus();
  }
}
