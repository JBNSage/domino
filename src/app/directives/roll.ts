import { DestroyRef, Directive, ElementRef, afterRenderEffect, inject, input } from '@angular/core';

import { roll } from '../platform/motion';
import { FitText } from './fit-text';

/**
 * Counts the number in its element up to a new value instead of swapping it.
 * The element holds only the number, as `{{ value }}`. It rolls when `rollKey`
 * changes with a higher value, so an undo or a correction simply jumps; on
 * first show it rolls from `rollFrom` when one is given.
 */
@Directive({ selector: '[appRoll]' })
export class Roll {
  readonly appRoll = input.required<number>();
  /** What asks for a roll: a new key with a higher value rolls, anything else jumps. */
  readonly rollKey = input<unknown>(null);
  readonly rollFrom = input<number | null>(null);
  readonly rollDelay = input(0);
  readonly rollDuration = input(380);

  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly fitText = inject(FitText, { optional: true, self: true });

  constructor() {
    let shown: number | null = null;
    let key: unknown = undefined;
    let stop = (): void => undefined;

    afterRenderEffect(() => {
      const to = this.appRoll();
      const next = this.rollKey();
      const first = shown === null;
      const from = first ? this.rollFrom() : next !== key ? shown : null;
      shown = to;
      key = next;
      stop();
      stop = (): void => undefined;

      const text = [...this.element.childNodes].find(
        (node): node is Text => node instanceof Text && node.data.trim() !== '',
      );
      // Where nothing can animate, the number simply changes.
      if (text === undefined) return;
      // A roll stopped halfway leaves its number behind, so the value is written again.
      text.data = String(to);
      if (from === null || to <= from || typeof this.element.animate !== 'function') return;
      // The fit was measured on the final number; a longer one is fitted once it lands.
      stop = roll(text, from, to, this.rollDuration(), this.rollDelay(), () => this.fitText?.fit());
    });

    inject(DestroyRef).onDestroy(() => stop());
  }
}
