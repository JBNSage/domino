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
import { MAX_NAME_LENGTH, MAX_POINTS, Row, TeamId, cleanName, parseAmount } from '../game/state';
import { NumberField } from './number-field';
import { Sheet } from './sheet';

/** Records a new hand, or corrects the points of one already on the board. */
@Component({
  selector: 'app-points-sheet',
  imports: [Sheet, NumberField, FitText],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-sheet [accent]="accent()" [label]="dialogLabel()">
      @if (editing(); as edit) {
        <h2 class="title">{{ copy.points.editTitle(edit.index + 1, teamName()) }}</h2>
      }
      <div class="team" [hidden]="editing() !== null">
        <label class="label" for="points-sheet-name">{{ copy.points.nameLabel }}</label>
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
          <!-- The pencil belongs to the field: touching it starts the rename. -->
          <label class="pencil" for="points-sheet-name" [attr.aria-label]="copy.points.nameEdit">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 20l1-4.5L16.5 4 20 7.5 8.5 19z" />
              <path d="M14 6.5l3.5 3.5" />
            </svg>
          </label>
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
          [disabled]="!canSubmit()"
          (click)="submit()"
        >
          <span class="slab__label" [appFitText]="confirmLabel()">{{ confirmLabel() }}</span>
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

    .team[hidden] {
      display: none;
    }

    .label {
      display: block;
      color: var(--c-muted);
      font: italic 600 var(--t-label) / 1.3 var(--font);
      text-transform: uppercase;
    }

    .name-row {
      display: flex;
      align-items: center;
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
      caret-color: var(--c-text);
      font: italic 800 var(--t-title) / 1.2 var(--font);
      text-transform: uppercase;
    }

    .name:focus-visible {
      outline-offset: 2px;
    }

    .pencil {
      flex: none;
      display: grid;
      place-items: center;
      width: var(--min-target);
      height: var(--min-target);
      cursor: pointer;
    }

    .pencil svg {
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
  /** The hand being corrected; null while recording a new one. */
  protected readonly editing = signal<{ row: Row; index: number } | null>(null);
  protected readonly name = signal('');
  protected readonly amountText = signal('');

  protected readonly accent = computed(() => `var(--c-team-${this.team()})`);
  protected readonly teamName = computed(() => this.store.state().teams[this.team()].name);
  protected readonly dialogLabel = computed(() => {
    const edit = this.editing();
    return edit
      ? copy.points.editTitle(edit.index + 1, this.teamName())
      : copy.points.dialogA11y(this.teamName());
  });

  protected readonly amount = computed(() => parseAmount(this.amountText(), MAX_POINTS));
  protected readonly error = computed(() =>
    this.amountText().trim().length > 0 && this.amount() === null ? copy.points.error : null,
  );
  private readonly renamed = computed(
    () => this.editing() === null && cleanName(this.name(), this.team()) !== this.teamName(),
  );
  protected readonly nameOnly = computed(
    () => this.amountText().trim().length === 0 && this.renamed(),
  );
  protected readonly canSubmit = computed(() => this.amount() !== null || this.nameOnly());
  protected readonly confirmLabel = computed(() => {
    if (this.editing()) return copy.points.editConfirm;
    return this.nameOnly() ? copy.points.saveName : copy.points.confirm;
  });

  open(team: TeamId): void {
    this.show(team, null, '');
  }

  openEdit(row: Row, index: number): void {
    this.show(row.team, { row, index }, String(row.points));
  }

  private show(team: TeamId, editing: { row: Row; index: number } | null, amount: string): void {
    const name = this.store.state().teams[team].name;
    this.team.set(team);
    this.editing.set(editing);
    this.name.set(name);
    this.amountText.set(amount);
    this.nameInput().nativeElement.value = name;
    this.sheet().open();
    this.points().focus(amount);
  }

  // Cancel, a tap outside and system Back all discard: nothing is saved without a button.
  protected submit(): void {
    const team = this.team();
    const amount = this.amount();
    const edit = this.editing();

    if (edit !== null) {
      if (amount === null) return;
      this.sheet().close();
      this.store.editRow(edit.row, edit.index, amount);
    } else if (amount !== null) {
      if (this.renamed()) this.store.renameTeam(team, this.name());
      this.sheet().close();
      this.store.addPoints(team, amount);
    } else if (this.nameOnly()) {
      this.store.renameTeam(team, this.name());
      this.sheet().close();
    }
  }
}
