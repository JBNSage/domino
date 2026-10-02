import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  output,
  signal,
  viewChild,
} from '@angular/core';

import { copy } from '../copy';
import { FitText } from '../directives/fit-text';
import { Invite } from '../game/cloud';
import { GameStore } from '../game/game.store';
import { MeStore } from '../game/me.store';
import { SharingStore } from '../game/sharing.store';
import { Screen } from './screen';

/**
 * Opened by a link to a mesa: who is joining, under which name, and the step
 * itself. The person joins watching; the mesa's owners decide the rest.
 */
@Component({
  selector: 'app-join-screen',
  imports: [Screen, FitText],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-screen [heading]="copy.join.title(invite()?.name ?? '')">
      <p class="lead">{{ copy.join.lead }}</p>

      <div class="as">
        <span class="label">{{ copy.join.as }}</span>
        <button
          type="button"
          class="slab slab--compact lean name"
          [attr.aria-label]="copy.join.asA11y(me.name())"
          (click)="rename.emit()"
        >
          <span class="slab__label" [appFitText]="me.name()">{{ me.name() }}</span>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 20l1-4.5L16.5 4 20 7.5 8.5 19z" />
            <path d="M14 6.5l3.5 3.5" />
          </svg>
        </button>
      </div>

      <p class="message" role="status" [class.error]="failure() !== null">{{ message() }}</p>

      <ng-container screenFooter>
        <button type="button" class="slab slab--compact lean" (click)="screen().close()">
          <span class="slab__label" [appFitText]="copy.join.later">{{ copy.join.later }}</span>
        </button>
        <button
          type="button"
          class="slab slab--filled lean join"
          [disabled]="busy()"
          (click)="join()"
        >
          <span class="slab__label" [appFitText]="label()">{{ label() }}</span>
        </button>
      </ng-container>
    </app-screen>
  `,
  styles: `
    .lead,
    .message {
      margin: 0;
      padding: 0 var(--s-sm);
      max-width: 34ch;
      color: var(--c-muted);
      line-height: 1.35;
    }

    .message:empty {
      display: none;
    }

    .message.error {
      color: var(--c-danger);
    }

    .as {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: var(--s-xs);
      padding: 0 var(--s-sm);
    }

    .label {
      color: var(--c-muted);
      font: italic 600 var(--t-label) / 1.3 var(--font);
      text-transform: uppercase;
    }

    .name {
      max-width: 100%;
      font-size: var(--t-button);
    }

    .name svg {
      flex: none;
      width: 18px;
      height: 18px;
      fill: none;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .join:not(:disabled) {
      --fill: var(--c-text);
      --label: var(--c-ground);
    }
  `,
})
export class JoinScreen {
  protected readonly copy = copy;
  protected readonly me = inject(MeStore);
  private readonly sharing = inject(SharingStore);
  private readonly store = inject(GameStore);
  protected readonly screen = viewChild.required(Screen);

  /** Asks for the sheet that changes this phone's name, which the shell owns. */
  readonly rename = output<void>();
  /** Joined: the mesa is in use, and the screens above the board can close. */
  readonly joined = output<string>();

  protected readonly invite = signal<Invite | null>(null);
  protected readonly busy = signal(false);
  protected readonly failure = signal<'offline' | 'refused' | null>(null);

  protected readonly label = computed(() => (this.busy() ? copy.join.joining : copy.join.join));
  protected readonly message = computed(() => {
    const failure = this.failure();
    if (failure === 'offline') return copy.join.offline;
    if (failure === 'refused') return copy.join.refused;
    return '';
  });

  open(invite: Invite): void {
    this.invite.set(invite);
    this.failure.set(null);
    this.busy.set(false);
    this.screen().open();
  }

  protected async join(): Promise<void> {
    const invite = this.invite();
    if (invite === null || this.busy()) return;
    this.busy.set(true);
    this.failure.set(null);
    const failure = await this.sharing.join(invite);
    this.busy.set(false);
    if (failure !== null) {
      this.failure.set(failure);
      return;
    }
    this.screen().close();
    this.store.announce(copy.join.joined(invite.name));
    this.joined.emit(invite.id);
  }
}
