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
import { GameStore } from '../game/game.store';
import { MAX_NAME_LENGTH, MAX_POINTS, TeamId, cleanName, parseAmount } from '../game/state';
import { NumberField } from './number-field';
import { Sheet } from './sheet';

@Component({
  selector: 'app-points-sheet',
  imports: [Sheet, NumberField, FitText],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-sheet [accent]="accent()" labelledBy="points-sheet-name-label">
      <div class="team" [style.--caret]="accent()">
        <label class="label" id="points-sheet-name-label" for="points-sheet-name">
          {{ copy.points.nameLabel }}
        </label>
        <div class="name-row">
          <input
            #nameInput
            id="points-sheet-name"
            class="name"
            type="text"
            enterkeyhint="next"
            autocomplete="off"
            autocapitalize="characters"
            autocorrect="off"
            spellcheck="false"
            [attr.aria-label]="copy.points.nameA11y"
            [attr.maxlength]="maxName"
            [value]="name()"
            (input)="name.set(nameInput.value)"
            (focus)="nameInput.select()"
            (keydown.enter)="$event.preventDefault(); points.focus()"
          />
          <svg class="pencil" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 20l1-4.5L16.5 4 20 7.5 8.5 19z" />
            <path d="M14 6.5l3.5 3.5" />
          </svg>
        </div>
      </div>

      <app-number-field
        #points
        [style.--caret]="accent()"
        [label]="copy.points.inputLabel"
        [maxLength]="3"
        [error]="error()"
        [(value)]="amountText"
        (submitted)="submit()"
      />

      <div class="slab-row">
        <button type="button" class="slab lean" (click)="sheet().close()">
          <span class="slab__label" [appFitText]="copy.common.cancel">{{
            copy.common.cancel
          }}</span>
        </button>
        <button
          type="button"
          class="slab slab--team lean"
          [style.--fill]="accent()"
          [disabled]="amount() === null && !nameOnly()"
          (click)="submit()"
        >
          <span class="slab__label" [appFitText]="confirmLabel()">{{ confirmLabel() }}</span>
        </button>
      </div>
    </app-sheet>
  `,
  styles: `
    .label {
      display: block;
      color: var(--c-muted);
      font: italic 600 var(--t-label) / 1.3 var(--font);
      text-transform: uppercase;
    }

    .name-row {
      display: flex;
      align-items: center;
      gap: var(--s-sm);
      border-bottom: 2px solid var(--c-line);
    }

    .name-row:focus-within {
      border-bottom-color: var(--c-text);
    }

    .name {
      flex: 1;
      min-width: 0;
      min-height: var(--min-target);
      padding: var(--s-xs) 0;
      border: 0;
      border-radius: 0;
      background: none;
      color: var(--c-text);
      caret-color: var(--caret);
      font: italic 800 var(--t-title) / 1.2 var(--font);
      text-transform: uppercase;
      outline: none;
    }

    @media (prefers-color-scheme: light) {
      .name {
        caret-color: var(--c-text);
      }
    }

    .pencil {
      flex: none;
      width: 20px;
      height: 20px;
      fill: none;
      stroke: var(--c-muted);
      stroke-width: 2;
      stroke-linejoin: round;
      stroke-linecap: round;
    }
  `,
})
export class PointsSheet {
  protected readonly copy = copy;
  protected readonly maxName = MAX_NAME_LENGTH;

  private readonly store = inject(GameStore);
  protected readonly sheet = viewChild.required(Sheet);
  private readonly points = viewChild.required<NumberField>('points');
  private readonly nameInput = viewChild.required<ElementRef<HTMLInputElement>>('nameInput');

  private readonly team = signal<TeamId>('a');
  protected readonly name = signal('');
  protected readonly amountText = signal('');

  protected readonly accent = computed(() => `var(--c-team-${this.team()})`);
  protected readonly amount = computed(() => parseAmount(this.amountText(), MAX_POINTS));
  protected readonly error = computed(() =>
    this.amountText().length > 0 && this.amount() === null ? copy.points.error : null,
  );
  private readonly renamed = computed(
    () => cleanName(this.name(), this.team()) !== this.store.state().teams[this.team()].name,
  );
  protected readonly nameOnly = computed(
    () => this.amount() === null && this.amountText().length === 0 && this.renamed(),
  );
  protected readonly confirmLabel = computed(() =>
    this.nameOnly() ? copy.points.saveName : copy.points.confirm,
  );

  open(team: TeamId): void {
    const name = this.store.state().teams[team].name;
    this.team.set(team);
    this.name.set(name);
    this.amountText.set('');
    this.nameInput().nativeElement.value = name;
    this.sheet().open();
    this.points().focus('');
  }

  // Cancel, a tap outside and system Back all discard: nothing is saved without a button.
  protected submit(): void {
    const team = this.team();
    const amount = this.amount();
    if (amount !== null) {
      if (this.renamed()) this.store.renameTeam(team, this.name());
      this.sheet().close();
      this.store.addPoints(team, amount);
    } else if (this.nameOnly()) {
      this.store.renameTeam(team, this.name());
      this.sheet().close();
    }
  }
}
