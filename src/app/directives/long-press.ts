import { Directive, OnDestroy, output } from '@angular/core';

const HOLD_MS = 500;
const SLOP = 10;

/** Emits after a press held in place, and swallows the click that follows it. */
@Directive({
  selector: '[appLongPress]',
  host: {
    '(pointerdown)': 'start($event)',
    '(pointermove)': 'move($event)',
    '(pointerup)': 'cancel()',
    '(pointerleave)': 'cancel()',
    '(pointercancel)': 'cancel()',
    '(contextmenu)': '$event.preventDefault()',
    '(click)': 'click($event)',
  },
})
export class LongPress implements OnDestroy {
  readonly appLongPress = output<void>();

  private timer: ReturnType<typeof setTimeout> | null = null;
  private origin = { x: 0, y: 0 };
  private fired = false;

  protected start(event: PointerEvent): void {
    if (event.button !== 0) return;
    this.cancel();
    this.fired = false;
    this.origin = { x: event.clientX, y: event.clientY };
    this.timer = setTimeout(() => {
      this.timer = null;
      this.fired = true;
      this.appLongPress.emit();
    }, HOLD_MS);
  }

  protected move(event: PointerEvent): void {
    if (this.timer === null) return;
    const moved = Math.hypot(event.clientX - this.origin.x, event.clientY - this.origin.y);
    if (moved > SLOP) this.cancel();
  }

  protected cancel(): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
  }

  protected click(event: Event): void {
    if (!this.fired) return;
    this.fired = false;
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  ngOnDestroy(): void {
    this.cancel();
  }
}
