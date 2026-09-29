import { DestroyRef, Directive, ElementRef, afterRenderEffect, inject, input } from '@angular/core';

/**
 * Keeps one line of text inside its box by shrinking the type, never below
 * `minScale` of its designed size nor below `MIN_SIZE`. The host needs a
 * bounded width. Only the width is
 * clipped, so tall glyphs such as an opening exclamation mark stay whole.
 */
const SLACK = 0.96;

/** The smallest type that can still be read at the table, in pixels. */
const MIN_SIZE = 12;

@Directive({
  selector: '[appFitText]',
  // The end padding keeps the italic overhang of the last letter inside the clip.
  host: {
    style:
      'display: block; white-space: nowrap; overflow-x: clip; overflow-y: visible; padding-inline-end: 0.12em;',
  },
})
export class FitText {
  /** The text shown, so the fit runs again when it changes. */
  readonly appFitText = input<string | number>('');
  readonly minScale = input(0.5);

  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  constructor() {
    afterRenderEffect(() => {
      this.appFitText();
      this.fit();
    });

    if (typeof ResizeObserver !== 'undefined') {
      // Fitting changes the element's own height, so it waits for the next frame
      // instead of resizing inside the observer's callback.
      let frame = 0;
      const observer = new ResizeObserver(() => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => this.fit());
      });
      observer.observe(this.element);
      inject(DestroyRef).onDestroy(() => {
        cancelAnimationFrame(frame);
        observer.disconnect();
      });
    }
    // Widths change once Kanit replaces the fallback face.
    document.fonts?.ready.then(() => this.fit());
  }

  private fit(): void {
    const element = this.element;
    element.style.fontSize = '';
    const available = element.clientWidth;
    const needed = element.scrollWidth;
    if (available === 0 || needed <= available) return;
    const designed = parseFloat(getComputedStyle(element).fontSize);
    // Letter spacing does not shrink with the type, so the fit leaves a little slack.
    const scale = Math.max(this.minScale(), (available / needed) * SLACK);
    element.style.fontSize = `${Math.min(designed, Math.max(MIN_SIZE, designed * scale))}px`;
  }
}
