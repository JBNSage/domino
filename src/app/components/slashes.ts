import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Three leaning bars, the mark that opens a sheet or a heading. */
@Component({
  selector: 'app-slashes',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true', '[style.--size.px]': 'size()' },
  template: `<i></i><i></i><i></i>`,
  styles: `
    :host {
      display: flex;
      gap: calc(var(--size) * 0.05);
      color: var(--c-line);
    }

    i {
      width: calc(var(--size) * 0.62);
      height: var(--size);
      background: currentColor;
      clip-path: polygon(21.26% 0, 100% 0, 78.74% 100%, 0 100%);
    }
  `,
})
export class Slashes {
  readonly size = input(14);
}
