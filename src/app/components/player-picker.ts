import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';

import { copy } from '../copy';
import { FitText } from '../directives/fit-text';
import { MAX_PLAYER_LENGTH, cleanPlayer, sameName } from '../game/state';
import { MAX_TABLE_PLAYERS, addPlayer, filterPlayers, playerNamed } from '../game/tables';
import { TablesStore } from '../game/tables.store';

/**
 * A team's two players, picked from the mesa's list. Typing filters the list;
 * a name the mesa does not have yet can be added from the same field.
 */
@Component({
  selector: 'app-player-picker',
  imports: [FitText],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="slots">
      @for (slot of slots(); track slot.index) {
        <div class="slot">
          <span class="slot-label">{{ slot.label }}</span>
          <button
            type="button"
            class="slot-button lean"
            [class.slot-button--empty]="slot.name === ''"
            [attr.aria-label]="copy.picker.slotA11y(slot.label, slot.name || null)"
            [attr.data-slot]="slot.index"
            (click)="slot.name === '' ? searchInput.focus() : clear(slot.index)"
          >
            <span class="slot-name" [appFitText]="slot.name || copy.picker.empty">{{
              slot.name || copy.picker.empty
            }}</span>
            @if (slot.name !== '') {
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            }
          </button>
        </div>
      }
    </div>

    <div class="find">
      <label class="find-label" [for]="searchId">{{ copy.picker.search }}</label>
      <input
        #searchInput
        class="find-input"
        type="text"
        autocomplete="off"
        autocapitalize="words"
        autocorrect="off"
        spellcheck="false"
        enterkeyhint="done"
        [id]="searchId"
        [attr.maxlength]="maxLength"
        [attr.aria-describedby]="noteId"
        [value]="query()"
        (input)="query.set(searchInput.value)"
        (keydown.enter)="enter($event)"
        (keydown.arrowdown)="step($event, 0)"
      />
    </div>

    @if (shown().length > 0) {
      <ul class="list" [attr.aria-label]="copy.picker.list(shown().length)">
        @for (player of shown(); track player.name) {
          <li>
            <button
              type="button"
              class="chip lean"
              [class.chip--on]="player.chosen"
              [disabled]="player.blocked"
              [attr.aria-pressed]="player.chosen"
              [attr.aria-label]="copy.picker.playerA11y(player.name, player.chosen, player.blocked)"
              (click)="toggle(player.name)"
              (keydown)="move($event)"
            >
              <span class="chip-name">{{ player.name }}</span>
              @if (player.blocked) {
                <span class="chip-note">{{ copy.picker.blocked }}</span>
              }
            </button>
          </li>
        }
      </ul>
    }

    @if (addable(); as name) {
      <button
        type="button"
        class="slab slab--compact lean add"
        [attr.aria-label]="copy.picker.addA11y(name)"
        (click)="add(name)"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
        <span class="slab__label" [appFitText]="copy.picker.add(name)">{{
          copy.picker.add(name)
        }}</span>
      </button>
    }

    <p class="note" [id]="noteId">{{ note() }}</p>
    <p class="sr-only" role="status">{{ said() }}</p>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: var(--s-md);
    }

    /* Side by side; one above the other once large text needs the room. */
    .slots {
      display: flex;
      flex-wrap: wrap;
      gap: var(--s-sm);
    }

    .slot {
      flex: 1 1 9rem;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: var(--s-xs);
    }

    .slot-label,
    .find-label {
      color: var(--c-muted);
      font: italic 600 var(--t-label) / 1.3 var(--font);
      text-transform: uppercase;
    }

    .slot-button {
      --fill: var(--c-text);
      --lean-inset: 5px;

      min-height: var(--min-target);
      display: flex;
      align-items: center;
      gap: var(--s-xs);
      padding: 0 var(--s-lg);
      border: 0;
      background: none;
      color: var(--c-ground);
      text-align: left;
    }

    .slot-button--empty {
      --fill: transparent;
      --edge: var(--c-line);

      color: var(--c-muted);
    }

    .slot-button:active::before {
      opacity: var(--pressed);
    }

    .slot-name {
      flex: 1;
      min-width: 0;
      font: italic 800 var(--t-compact) / 1.2 var(--font);
      text-transform: uppercase;
    }

    svg {
      flex: none;
      width: 18px;
      height: 18px;
      fill: none;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .find {
      display: flex;
      flex-direction: column;
    }

    /* 16px or more, or iOS zooms the page. */
    .find-input {
      width: 100%;
      min-height: var(--min-target);
      padding: var(--s-xs) 0;
      border: 0;
      border-bottom: 2px solid var(--c-line);
      border-radius: 0;
      background: none;
      color: var(--c-text);
      caret-color: var(--c-text);
      font: italic 800 max(16px, var(--t-button)) / 1.2 var(--font);
      text-transform: uppercase;
    }

    .find-input:focus {
      border-bottom-color: var(--c-text);
    }

    .find-input:focus-visible {
      outline-offset: 0;
    }

    .list {
      display: flex;
      flex-wrap: wrap;
      gap: var(--s-sm) var(--s-xs);
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .chip {
      --fill: var(--c-surface);
      --lean-inset: 4px;

      min-height: var(--min-target);
      max-width: 100%;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: center;
      padding: var(--s-xs) var(--s-lg);
      border: 0;
      background: none;
      color: var(--c-text);
      text-align: left;
    }

    .chip-name {
      max-width: 100%;
      font: italic 800 var(--t-body) / 1.2 var(--font);
      text-transform: uppercase;
      overflow-wrap: anywhere;
    }

    .chip-note {
      font: italic 600 var(--t-label) / 1.2 var(--font);
      text-transform: uppercase;
    }

    .chip--on {
      --fill: var(--c-text);

      color: var(--c-ground);
    }

    .chip:disabled {
      --fill: transparent;
      --edge: var(--c-raised);

      color: var(--c-muted);
      cursor: default;
    }

    .chip:not(:disabled):active::before {
      opacity: var(--pressed);
    }

    @media (hover: hover) {
      .chip:not(:disabled):hover::before {
        filter: brightness(1.12);
      }
    }

    .add {
      align-self: flex-start;
      max-width: calc(100% - var(--s-lg));
      margin: 0 var(--s-sm);
    }

    .note {
      margin: 0;
      color: var(--c-muted);
      line-height: 1.35;
    }

    .note:empty {
      display: none;
    }
  `,
})
export class PlayerPicker {
  protected readonly copy = copy;
  protected readonly maxLength = MAX_PLAYER_LENGTH;

  /** The mesa whose players are listed. */
  readonly table = input.required<string>();
  /** Players who cannot be picked, such as those of the other team. */
  readonly blocked = input<string[]>([]);
  readonly first = model('');
  readonly second = model('');

  private readonly tables = inject(TablesStore);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  protected readonly search = viewChild.required<ElementRef<HTMLInputElement>>('searchInput');

  private static nextId = 0;
  protected readonly searchId = `player-search-${PlayerPicker.nextId}`;
  protected readonly noteId = `player-note-${PlayerPicker.nextId++}`;

  protected readonly query = signal('');
  protected readonly said = signal('');

  private readonly mesa = computed(
    () => this.tables.tables().tables.find((table) => table.id === this.table()) ?? null,
  );

  protected readonly slots = computed(() => [
    { index: 0, label: copy.players.first, name: this.first() },
    { index: 1, label: copy.players.second, name: this.second() },
  ]);

  protected readonly shown = computed(() => {
    const players = this.mesa()?.players ?? [];
    const chosen = [this.first(), this.second()];
    return filterPlayers(players, this.query()).map((name) => ({
      name,
      chosen: chosen.some((each) => each !== '' && sameName(each, name)),
      blocked: this.blocked().some((each) => sameName(each, name)),
    }));
  });

  private readonly full = computed(() => (this.mesa()?.players.length ?? 0) >= MAX_TABLE_PLAYERS);

  /** What was typed, when the mesa does not have that player yet. */
  protected readonly addable = computed(() => {
    const mesa = this.mesa();
    const name = cleanPlayer(this.query());
    if (mesa === null || name === '' || this.full()) return null;
    // At a shared mesa only its owners add players.
    if (mesa.shared && !mesa.shared.owner) return null;
    if (this.blocked().some((each) => sameName(each, name))) return null;
    return playerNamed(mesa, name) === null ? name : null;
  });

  protected readonly note = computed(() => {
    const mesa = this.mesa();
    if (mesa === null) return '';
    const typed = cleanPlayer(this.query()) !== '';
    if (typed && this.full() && playerNamed(mesa, this.query()) === null) return copy.picker.full;
    if (mesa.players.length === 0 && !typed) return copy.picker.noPlayers;
    if (typed && this.shown().length === 0 && this.addable() === null) return copy.picker.noMatch;
    return '';
  });

  protected clear(index: number): void {
    const slot = index === 0 ? this.first : this.second;
    slot.set('');
    this.said.set(copy.picker.cleared(this.slots()[index].label));
  }

  protected toggle(name: string): void {
    if (this.first() !== '' && sameName(this.first(), name)) return this.clear(0);
    if (this.second() !== '' && sameName(this.second(), name)) return this.clear(1);
    if (this.blocked().some((each) => sameName(each, name))) return;
    // The first empty place; with both taken, the second one changes.
    const index = this.first() === '' ? 0 : 1;
    (index === 0 ? this.first : this.second).set(name);
    this.said.set(copy.picker.chosen(name, this.slots()[index].label));
    this.query.set('');
  }

  protected add(name: string): void {
    const mesa = this.mesa();
    if (mesa === null) return;
    this.tables.changeTable(mesa.id, (table) => addPlayer(table, name));
    const added = this.mesa();
    const spelled = added === null ? null : playerNamed(added, name);
    if (spelled !== null) this.toggle(spelled);
    this.search().nativeElement.focus();
  }

  // Enter takes the name typed: the one player it matches, or a new one.
  protected enter(event: Event): void {
    event.preventDefault();
    const mesa = this.mesa();
    const exact = mesa === null ? null : playerNamed(mesa, this.query());
    const open = this.shown().filter((player) => !player.blocked && !player.chosen);
    if (exact !== null) this.toggle(exact);
    else if (open.length === 1) this.toggle(open[0].name);
    else if (this.addable() !== null) this.add(this.addable() as string);
  }

  protected step(event: Event, index: number): void {
    const chips = this.chips();
    if (chips.length === 0) return;
    event.preventDefault();
    chips[index]?.focus();
  }

  /** Arrow keys move along the list, as in a group of options. */
  protected move(event: KeyboardEvent): void {
    const delta = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    if (delta === undefined) return;
    const chips = this.chips();
    const index = chips.indexOf(document.activeElement as HTMLElement);
    if (index === -1) return;
    event.preventDefault();
    if (index + delta < 0) this.search().nativeElement.focus();
    else chips[Math.min(index + delta, chips.length - 1)].focus();
  }

  /** Empties the search, as when the sheet opens again. */
  reset(): void {
    this.query.set('');
    this.said.set('');
    this.search().nativeElement.value = '';
  }

  /** Where reading starts: the first place, so the keyboard stays down. */
  focus(): void {
    this.host.querySelector<HTMLElement>('[data-slot="0"]')?.focus();
  }

  private chips(): HTMLElement[] {
    return Array.from(this.host.querySelectorAll<HTMLElement>('.chip:not(:disabled)'));
  }
}
