import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  output,
  signal,
  viewChild,
} from '@angular/core';

import { copy } from '../copy';
import { FitText } from '../directives/fit-text';
import { Invite } from '../game/cloud';
import { parseInvite } from '../game/invite';
import { Sheet } from './sheet';

/**
 * Joining from inside the app with a link copied elsewhere. On an iPhone a link
 * always opens in Safari, never in the installed app, so this is how the app
 * itself joins a mesa.
 */
@Component({
  selector: 'app-join-link-sheet',
  imports: [Sheet, FitText],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-sheet labelledBy="join-link-title">
      <h2 class="title" id="join-link-title">{{ copy.join.linkTitle }}</h2>

      <div class="field">
        <label class="label" for="join-link-input">{{ copy.join.linkLabel }}</label>
        <div class="row">
          <input
            #input
            id="join-link-input"
            class="input"
            type="url"
            inputmode="url"
            autocomplete="off"
            autocapitalize="off"
            autocorrect="off"
            spellcheck="false"
            enterkeyhint="go"
            aria-describedby="join-link-message"
            [class.invalid]="wrong()"
            [value]="text()"
            (input)="text.set(input.value)"
            (keydown.enter)="$event.preventDefault(); submit()"
          />
          @if (canPaste) {
            <button type="button" class="slab slab--compact lean paste" (click)="paste()">
              <span class="slab__label" [appFitText]="copy.join.paste">{{ copy.join.paste }}</span>
            </button>
          }
        </div>
      </div>
      <p class="message" id="join-link-message" role="status" [class.error]="wrong()">
        {{ wrong() ? copy.join.linkWrong : copy.join.linkHelp }}
      </p>

      <div class="slab-row">
        <button type="button" class="slab lean" (click)="sheet().close()">
          <span class="slab__label" [appFitText]="copy.common.cancel">{{
            copy.common.cancel
          }}</span>
        </button>
        <button
          type="button"
          class="slab slab--primary lean confirm"
          [disabled]="invite() === null"
          (click)="submit()"
        >
          <span class="slab__label" [appFitText]="copy.join.continue">{{
            copy.join.continue
          }}</span>
        </button>
      </div>
    </app-sheet>
  `,
  styles: `
    .title {
      margin: 0;
      font: italic 800 var(--t-title) / 1.15 var(--font);
      text-transform: uppercase;
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: var(--s-xs);
    }

    .label {
      color: var(--c-muted);
      font: italic 600 var(--t-label) / 1.3 var(--font);
      text-transform: uppercase;
    }

    .row {
      display: flex;
      align-items: flex-end;
      gap: var(--s-md);
    }

    /* 16px or more, or iOS zooms the page. A link is read as written, not in capitals. */
    .input {
      flex: 1;
      min-width: 0;
      min-height: var(--min-target);
      padding: var(--s-xs) 0;
      border: 0;
      border-bottom: 2px solid var(--c-line);
      border-radius: 0;
      background: none;
      color: var(--c-text);
      caret-color: var(--c-text);
      font: 500 max(16px, var(--t-body)) / 1.3 var(--font);
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

    .paste {
      flex: none;
    }

    .message {
      margin: 0;
      color: var(--c-muted);
      line-height: 1.35;
    }

    .message.error {
      color: var(--c-danger);
    }

    .confirm:not(:disabled) {
      --fill: var(--c-text);
      --edge: transparent;
      --label: var(--c-ground);
    }
  `,
})
export class JoinLinkSheet {
  protected readonly copy = copy;
  protected readonly sheet = viewChild.required(Sheet);
  private readonly input = viewChild.required<ElementRef<HTMLInputElement>>('input');

  /** A link that is an invitation, ready for the join screen. */
  readonly chosen = output<Invite>();

  protected readonly canPaste =
    typeof navigator !== 'undefined' && typeof navigator.clipboard?.readText === 'function';

  protected readonly text = signal('');
  protected readonly invite = computed(() => {
    const text = this.text().trim();
    const hash = text.indexOf('#');
    return hash < 0 ? null : parseInvite(text.slice(hash));
  });
  /** Something was written, and it is not a link to a mesa. */
  protected readonly wrong = computed(() => this.text().trim() !== '' && this.invite() === null);

  /** Called straight from the tap, so the keyboard opens with the sheet. */
  open(): void {
    this.text.set('');
    this.sheet().open();
    this.input().nativeElement.focus();
  }

  protected async paste(): Promise<void> {
    try {
      this.text.set(await navigator.clipboard.readText());
    } catch {
      // Not allowed: the field is still there to paste into by hand.
      this.input().nativeElement.focus();
    }
  }

  protected submit(): void {
    const invite = this.invite();
    if (invite === null) return;
    this.sheet().close();
    this.chosen.emit(invite);
  }
}
