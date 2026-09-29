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
      [attr.aria-labelledby]="labelledBy()"
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
      max-height: calc(90dvh - var(--keyboard-inset));
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
  readonly labelledBy = input<string | null>(null);
  readonly closed = output<void>();

  private readonly overlays = inject(Overlays);
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  get isOpen(): boolean {
    return this.dialog().nativeElement.open;
  }

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

  protected onClose(): void {
    // The browser hands focus back to the button that opened the sheet. A keyboard
    // needs that; on a touch screen it only leaves a focus ring behind.
    if (matchMedia('(pointer: coarse)').matches) {
      setTimeout(() => (document.activeElement as HTMLElement | null)?.blur?.());
    }
    this.overlays.closed();
    this.closed.emit();
  }
}
