import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';

import { copy } from '../copy';
import { FitText } from '../directives/fit-text';
import { GameStore } from '../game/game.store';
import { MAX_POINTS, MAX_TARGET, parseAmount, selectTotals, selectWinner } from '../game/state';
import { NumberField } from './number-field';
import { Sheet } from './sheet';

export type SettingsFocus = 'target' | 'quick';

/** The round's two numbers: points to win and the quick bonus. */
@Component({
  selector: 'app-settings-sheet',
  imports: [Sheet, NumberField, FitText],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-sheet labelledBy="settings-sheet-title">
      <h2 class="title" id="settings-sheet-title">{{ copy.settings.title }}</h2>
      <app-number-field
        #target
        [label]="copy.settings.targetLabel"
        [maxLength]="targetLength"
        [error]="targetError()"
        [notice]="notice()"
        [(value)]="targetText"
        (submitted)="quick.focus()"
      />
      <app-number-field
        #quick
        [label]="copy.settings.quickLabel"
        [maxLength]="quickLength"
        [error]="quickError()"
        [(value)]="quickText"
        (submitted)="save()"
      />
      <div class="slab-row">
        <button type="button" class="slab lean cancel" (click)="sheet().close()">
          <span class="slab__label" [appFitText]="copy.common.cancel">{{
            copy.common.cancel
          }}</span>
        </button>
        <button
          type="button"
          class="slab slab--filled slab--primary lean primary"
          [disabled]="!valid()"
          (click)="save()"
        >
          <span class="slab__label" [appFitText]="saveLabel()">{{ saveLabel() }}</span>
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
    }

    app-number-field {
      --caret: var(--c-text);
    }

    .primary:not(:disabled) {
      --fill: var(--c-text);
      --label: var(--c-ground);
    }
  `,
})
export class SettingsSheet {
  protected readonly copy = copy;
  protected readonly targetLength = String(MAX_TARGET).length;
  protected readonly quickLength = String(MAX_POINTS).length;

  private readonly store = inject(GameStore);
  protected readonly sheet = viewChild.required(Sheet);
  private readonly target = viewChild.required<NumberField>('target');
  private readonly quick = viewChild.required<NumberField>('quick');

  protected readonly targetText = signal('');
  protected readonly quickText = signal('');

  private readonly targetValue = computed(() => parseAmount(this.targetText(), MAX_TARGET));
  private readonly quickValue = computed(() => parseAmount(this.quickText(), MAX_POINTS));

  protected readonly targetError = computed(() =>
    this.targetText().length > 0 && this.targetValue() === null ? copy.settings.targetError : null,
  );
  protected readonly quickError = computed(() =>
    this.quickText().length > 0 && this.quickValue() === null ? copy.settings.quickError : null,
  );

  // Saving a target at or below a running total ends the round, so say so first.
  protected readonly notice = computed(() => {
    const state = this.store.state();
    const target = this.targetValue();
    if (target === null || target === state.target) return null;
    const winner = selectWinner({ ...state, target });
    if (winner === null) return null;
    return copy.settings.endsRound(state.teams[winner].name, selectTotals(state)[winner]);
  });

  protected readonly valid = computed(
    () => this.targetValue() !== null && this.quickValue() !== null,
  );
  protected readonly saveLabel = computed(() =>
    this.notice() ? copy.settings.saveAndEnd : copy.settings.save,
  );

  open(focus: SettingsFocus): void {
    const state = this.store.state();
    const target = String(state.target);
    const quick = String(state.quickValue);
    this.targetText.set(target);
    this.quickText.set(quick);
    this.sheet().open();
    if (focus === 'quick') this.quick().focus(quick);
    else this.target().focus(target);
  }

  protected save(): void {
    const target = this.targetValue();
    const quick = this.quickValue();
    if (target === null || quick === null) return;
    this.sheet().close();
    this.store.saveSettings(target, quick);
  }
}
