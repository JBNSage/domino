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
  MAX_NAME_LENGTH,
  MAX_PLAYER_LENGTH,
  Players,
  cleanLabel,
  cleanPlayers,
  sameName,
} from '../game/state';
import { MAX_SAVED_TEAMS } from '../game/tables';
import { TablesStore } from '../game/tables.store';
import { PlayerPicker } from './player-picker';
import { Sheet } from './sheet';
import { TextField } from './text-field';

/** What the sheet is asked to change, and where the answer goes. */
export type TeamEdit = {
  title: string;
  /** The team's colour at the board; null for a team that has no side yet. */
  accent: string | null;
  name: string;
  players: Players | null;
  /** The name used when the field is left empty. */
  fallback: string;
  /** Names of the other teams, which this one may not repeat. */
  taken: string[];
  confirm: string;
  /** The mesa whose players are offered; without one, the players are written. */
  table?: string | null;
  /** Players who cannot be picked: those of the team on the other side. */
  blocked?: string[];
  /** Whether the team is kept at the mesa; null leaves the choice out. */
  keep?: boolean | null;
  /** The mesa's saved team this one is, if any. */
  savedId?: string | null;
  save: (name: string, players: Players | null, keep: boolean) => void;
  remove?: () => void;
};

/** A team's name and its two players. The players are both written or both left out. */
@Component({
  selector: 'app-team-sheet',
  imports: [Sheet, TextField, PlayerPicker, FitText],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-sheet [accent]="accent() ?? 'var(--c-text)'" labelledBy="team-sheet-title">
      <h2 class="title" id="team-sheet-title">{{ title() }}</h2>

      <app-text-field
        #name
        [label]="copy.players.nameLabel"
        [maxLength]="maxName"
        [placeholder]="fallback()"
        [invalid]="taken()"
        describedBy="team-sheet-message"
        [(value)]="nameText"
        (submitted)="table() === null ? firstField().focus() : submit()"
      />
      <!-- Above the players, so a long list never pushes it out of reach. -->
      @if (table() !== null && request()?.keep !== null && request()?.keep !== undefined) {
        <button
          type="button"
          role="switch"
          class="keep"
          [attr.aria-checked]="keep()"
          [disabled]="keepFull()"
          aria-describedby="team-sheet-keep"
          (click)="keep.set(!keep())"
        >
          <span class="box lean" [class.box--on]="keep()">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7" /></svg>
          </span>
          <span class="keep-text">
            <span class="keep-label">{{ copy.picker.keep }}</span>
            <span class="keep-help" id="team-sheet-keep">{{ keepHelp() }}</span>
          </span>
        </button>
      }

      <div #picking class="mode" [hidden]="table() === null">
        <app-player-picker
          [table]="table() ?? ''"
          [blocked]="blocked()"
          [(first)]="firstText"
          [(second)]="secondText"
        />
      </div>
      <div #typing class="players mode" [hidden]="table() !== null">
        <app-text-field
          #first
          [label]="copy.players.first"
          [maxLength]="maxPlayer"
          [invalid]="showIncomplete() && firstText().trim() === ''"
          describedBy="team-sheet-message"
          [(value)]="firstText"
          (submitted)="secondField().focus()"
        />
        <app-text-field
          #second
          [label]="copy.players.second"
          [maxLength]="maxPlayer"
          [invalid]="showIncomplete() && secondText().trim() === ''"
          [last]="true"
          describedBy="team-sheet-message"
          [(value)]="secondText"
          (entered)="secondVisited.set(true)"
          (submitted)="submit()"
        />
      </div>

      <!-- Always in the page, so screen readers hear the message arrive. -->
      <p class="message" id="team-sheet-message" role="status" [class.error]="error() !== null">
        {{
          error() ??
            limit() ??
            (table() === null ? copy.players.optional : copy.players.optionalPick)
        }}
      </p>

      @if (canRemove()) {
        <button type="button" class="slab slab--compact slab--warn lean remove" (click)="remove()">
          <span class="slab__label" [appFitText]="copy.players.remove">{{
            copy.players.remove
          }}</span>
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
          [class.slab--team]="accent() !== null"
          [style.--fill]="accent() ?? 'var(--c-text)'"
          [disabled]="taken() || incomplete()"
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
    }

    .players {
      --field-size: var(--t-button);

      display: flex;
      flex-wrap: wrap;
      gap: var(--s-lg);
    }

    .players app-text-field {
      flex: 1 1 8rem;
      min-width: 0;
    }

    .mode[hidden] {
      display: none;
    }

    .keep {
      display: flex;
      align-items: center;
      gap: var(--s-md);
      min-height: var(--min-target);
      padding: var(--s-xs) var(--s-sm);
      border: 0;
      background: none;
      color: var(--c-text);
      text-align: left;
    }

    .keep:disabled {
      color: var(--c-muted);
      cursor: default;
    }

    .box {
      --fill: transparent;
      --edge: var(--c-line);
      --lean-inset: 3px;

      flex: none;
      display: grid;
      place-items: center;
      width: 40px;
      height: 32px;
    }

    .box--on {
      --fill: var(--c-text);
      --edge: transparent;
    }

    .box svg {
      width: 20px;
      height: 20px;
      fill: none;
      stroke: var(--c-ground);
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
      opacity: 0;
    }

    .box--on svg {
      opacity: 1;
    }

    .keep-text {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .keep-label {
      font: italic 800 var(--t-compact) / 1.2 var(--font);
      text-transform: uppercase;
    }

    .keep-help {
      color: var(--c-muted);
      font-size: var(--t-meta);
      line-height: 1.3;
    }

    .message {
      margin: 0;
      color: var(--c-muted);
      line-height: 1.35;
    }

    .message.error {
      color: var(--c-danger);
    }

    .remove {
      align-self: flex-start;
      max-width: calc(100% - var(--s-lg));
      margin: 0 var(--s-sm);
    }

    .confirm:not(.slab--team):not(:disabled) {
      --edge: transparent;
      --label: var(--c-ground);
    }
  `,
})
export class TeamSheet {
  protected readonly copy = copy;
  protected readonly maxName = MAX_NAME_LENGTH;
  protected readonly maxPlayer = MAX_PLAYER_LENGTH;

  protected readonly sheet = viewChild.required(Sheet);
  private readonly nameField = viewChild.required<TextField>('name');
  protected readonly firstField = viewChild.required<TextField>('first');
  protected readonly secondField = viewChild.required<TextField>('second');
  private readonly picker = viewChild.required(PlayerPicker);
  private readonly picking = viewChild.required<ElementRef<HTMLElement>>('picking');
  private readonly typing = viewChild.required<ElementRef<HTMLElement>>('typing');
  private readonly tables = inject(TablesStore);

  protected readonly request = signal<TeamEdit | null>(null);
  protected readonly title = computed(() => this.request()?.title ?? copy.players.title);
  protected readonly accent = computed(() => this.request()?.accent ?? null);
  protected readonly fallback = computed(() => this.request()?.fallback ?? '');
  protected readonly confirm = computed(() => this.request()?.confirm ?? copy.players.save);
  protected readonly canRemove = computed(() => this.request()?.remove !== undefined);
  protected readonly table = computed(() => this.request()?.table ?? null);
  protected readonly blocked = computed(() => this.request()?.blocked ?? []);
  protected readonly keep = signal(false);

  private readonly mesa = computed(() => {
    const id = this.table();
    return this.tables.tables().tables.find((table) => table.id === id) ?? null;
  });
  private readonly savedHere = computed(() => {
    const id = this.request()?.savedId ?? null;
    return this.mesa()?.teams.some((team) => team.id === id) ? id : null;
  });
  protected readonly keepFull = computed(
    () => this.savedHere() === null && (this.mesa()?.teams.length ?? 0) >= MAX_SAVED_TEAMS,
  );
  protected readonly keepHelp = computed(() => {
    if (this.keepFull()) return copy.picker.keepFull;
    return this.keep() ? copy.picker.keepOn : copy.picker.keepOff;
  });

  protected readonly nameText = signal('');
  protected readonly firstText = signal('');
  protected readonly secondText = signal('');

  private readonly name = computed(() => cleanLabel(this.nameText(), this.fallback()));
  private readonly players = computed(() => cleanPlayers(this.firstText(), this.secondText()));

  // A team kept at the mesa may not repeat the name of another team kept there.
  protected readonly taken = computed(() => {
    const saved = this.keep()
      ? (this.mesa()?.teams ?? [])
          .filter((team) => team.id !== this.savedHere())
          .map((team) => team.name)
      : [];
    return [...(this.request()?.taken ?? []), ...saved].some((other) =>
      sameName(other, this.name()),
    );
  });
  protected readonly incomplete = computed(() => this.players() === 'incomplete');
  // Nobody has made a mistake by writing the first of two names.
  protected readonly secondVisited = signal(false);
  protected readonly showIncomplete = computed(() => this.incomplete() && this.secondVisited());
  protected readonly error = computed(() => {
    if (this.taken()) return copy.players.taken;
    if (!this.showIncomplete()) return null;
    return this.table() === null ? copy.players.incomplete : copy.players.incompletePick;
  });

  /** A name that fills its field may have been cut, as when it is pasted. */
  protected readonly limit = computed(() => {
    const full =
      Array.from(this.nameText()).length >= MAX_NAME_LENGTH ||
      [this.firstText(), this.secondText()].some(
        (text) => Array.from(text).length >= MAX_PLAYER_LENGTH,
      );
    return full ? copy.players.limit(MAX_NAME_LENGTH) : null;
  });

  /** Called straight from the tap, so the keyboard opens with the sheet. */
  open(request: TeamEdit): void {
    const picking = (request.table ?? null) !== null;
    this.request.set(request);
    this.keep.set(request.keep === true);
    // With a mesa, a missing player is visible in its empty place; no need to wait.
    this.secondVisited.set(request.players !== null || picking);
    this.nameField().write(request.name);
    this.firstField().write(request.players?.[0] ?? '');
    this.secondField().write(request.players?.[1] ?? '');
    this.picker().reset();
    // Shown now, not at the next render, so focus can land in the same tap.
    this.picking().nativeElement.hidden = !picking;
    this.typing().nativeElement.hidden = picking;
    this.sheet().open();
    // Picking starts on the list, so the keyboard does not cover it.
    if (picking) this.picker().focus();
    else this.nameField().focus();
  }

  protected submit(): void {
    const players = this.players();
    if (players === 'incomplete' || this.taken()) return;
    const request = this.request();
    const name = this.name();
    const keep = this.keep() && !this.keepFull();
    this.sheet().close();
    request?.save(name, players, keep);
  }

  protected remove(): void {
    const request = this.request();
    this.sheet().close();
    request?.remove?.();
  }
}
