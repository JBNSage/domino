import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';

import { copy } from '../copy';
import { FitText } from '../directives/fit-text';
import {
  MAX_NAME_LENGTH,
  MAX_PLAYER_LENGTH,
  Players,
  cleanLabel,
  cleanPlayers,
} from '../game/state';
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
  save: (name: string, players: Players | null) => void;
  remove?: () => void;
};

const same = (one: string, other: string) =>
  one.localeCompare(other, 'es', { sensitivity: 'base' }) === 0;

/** A team's name and its two players. The players are both written or both left out. */
@Component({
  selector: 'app-team-sheet',
  imports: [Sheet, TextField, FitText],
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
        (submitted)="fields()[1].focus()"
      />
      <div class="players">
        <app-text-field
          [label]="copy.players.first"
          [maxLength]="maxPlayer"
          [invalid]="showIncomplete() && firstText().trim() === ''"
          describedBy="team-sheet-message"
          [(value)]="firstText"
          (submitted)="fields()[2].focus()"
        />
        <app-text-field
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
        {{ error() ?? limit() ?? copy.players.optional }}
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
  protected readonly fields = viewChildren(TextField);

  private readonly request = signal<TeamEdit | null>(null);
  protected readonly title = computed(() => this.request()?.title ?? copy.players.title);
  protected readonly accent = computed(() => this.request()?.accent ?? null);
  protected readonly fallback = computed(() => this.request()?.fallback ?? '');
  protected readonly confirm = computed(() => this.request()?.confirm ?? copy.players.save);
  protected readonly canRemove = computed(() => this.request()?.remove !== undefined);

  protected readonly nameText = signal('');
  protected readonly firstText = signal('');
  protected readonly secondText = signal('');

  private readonly name = computed(() => cleanLabel(this.nameText(), this.fallback()));
  private readonly players = computed(() => cleanPlayers(this.firstText(), this.secondText()));

  protected readonly taken = computed(() =>
    (this.request()?.taken ?? []).some((other) => same(other, this.name())),
  );
  protected readonly incomplete = computed(() => this.players() === 'incomplete');
  // Nobody has made a mistake by writing the first of two names.
  protected readonly secondVisited = signal(false);
  protected readonly showIncomplete = computed(() => this.incomplete() && this.secondVisited());
  protected readonly error = computed(() => {
    if (this.taken()) return copy.players.taken;
    return this.showIncomplete() ? copy.players.incomplete : null;
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
    this.request.set(request);
    this.secondVisited.set(request.players !== null);
    const [name, first, second] = this.fields();
    name.write(request.name);
    first.write(request.players?.[0] ?? '');
    second.write(request.players?.[1] ?? '');
    this.sheet().open();
    name.focus();
  }

  protected submit(): void {
    const players = this.players();
    if (players === 'incomplete' || this.taken()) return;
    const request = this.request();
    const name = this.name();
    this.sheet().close();
    request?.save(name, players);
  }

  protected remove(): void {
    const request = this.request();
    this.sheet().close();
    request?.remove?.();
  }
}
