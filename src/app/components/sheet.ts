import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';

import { Overlays } from './overlays';
import { Slashes } from './slashes';

/**
 * Bottom sheet for one short task. Escape, system Back and a tap outside all
 * close it. It stays in the page and opens through `open()`, called straight
 * from the tap, so the keyboard comes up with it on iOS.
 */
@Component({
  selector: 'app-sheet',
  imports: [Slashes],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- The backdrop tap is a pointer shortcut; the keyboard closes with Escape or Cancelar. -->
    <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events, @angular-eslint/template/interactive-supports-focus -->
    <dialog
      #dialog
      class="sheet"
      [attr.aria-label]="label()"
      [attr.aria-labelledby]="label() ? null : labelledBy()"
      [style.--accent]="accent()"
      (click)="backdrop($event)"
      (close)="onClose()"
    >
      <div class="panel">
        <app-slashes class="mark" [size]="18" />
        <ng-content />
      </div>
    </dialog>
  `,
  styles: `
    .sheet {
      position: fixed;
      inset: auto 0 var(--keyboard-inset) 0;
      width: 100%;
      max-width: var(--column);
      max-height: calc(92dvh - var(--keyboard-inset));
      margin: 0 auto;
      padding: 0;
      border: 0;
      overflow-y: auto;
      overscroll-behavior: contain;
      background: var(--c-ground);
      color: var(--c-text);
    }

    .sheet::backdrop {
      background: var(--c-scrim);
    }

    .panel {
      display: flex;
      flex-direction: column;
      gap: var(--s-lg);
      padding: var(--s-xl) var(--s-xl) max(env(safe-area-inset-bottom), var(--s-lg));
    }

    .mark {
      color: var(--accent);
    }

    /* By day the acid yellow vanishes on the pale ground, so the mark turns ink. */
    @media (prefers-color-scheme: light) {
      .mark {
        color: var(--c-text);
      }
    }

    @media (max-height: 36em) {
      .panel {
        gap: var(--s-md);
        padding-top: var(--s-lg);
      }

      .mark {
        display: none;
      }
    }

    @media (prefers-reduced-motion: no-preference) {
      .sheet {
        transform: translateY(100%);
        transition:
          transform 200ms var(--ease-out),
          overlay 200ms allow-discrete,
          display 200ms allow-discrete;
      }

      .sheet[open] {
        transform: none;
      }

      @starting-style {
        .sheet[open] {
          transform: translateY(100%);
        }
      }

      .sheet::backdrop {
        opacity: 0;
        transition:
          opacity 200ms ease-out,
          overlay 200ms allow-discrete,
          display 200ms allow-discrete;
      }

      .sheet[open]::backdrop {
        opacity: 1;
      }

      @starting-style {
        .sheet[open]::backdrop {
          opacity: 0;
        }
      }
    }
  `,
})
export class Sheet {
  readonly accent = input('var(--c-text)');
  /** The sheet's name for screen readers, when no visible heading says it all. */
  readonly label = input<string | null>(null);
  readonly labelledBy = input<string | null>(null);
  readonly closed = output<void>();

  private readonly overlays = inject(Overlays);
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  open(): void {
    const dialog = this.dialog().nativeElement;
    if (dialog.open) return;
    dialog.showModal();
    this.overlays.opened();
  }

  close(): void {
    const dialog = this.dialog().nativeElement;
    if (dialog.open) dialog.close();
  }

  protected backdrop(event: MouseEvent): void {
    if (event.target === this.dialog().nativeElement) this.close();
  }

  // The browser hands focus back to the button that opened the sheet, which is
  // where a keyboard or a screen reader expects to continue.
  protected onClose(): void {
    this.overlays.closed();
    this.closed.emit();
  }
}
