import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';

import { copy } from '../copy';
import { FitText } from '../directives/fit-text';
import { GameStore } from '../game/game.store';
import { TablesStore } from '../game/tables.store';
import { winsNeeded } from '../game/tournament';
import { Slashes } from './slashes';

@Component({
  selector: 'app-target-header',
  imports: [FitText, Slashes],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (brand()) {
      <!-- At Inicio nothing is being played for yet, so the app's name stands in for the meta. -->
      <span class="brand">
        <app-slashes class="mark" [size]="22" />
        <span class="brand__name">{{ copy.home.title }}</span>
      </span>
    } @else {
      <button
        type="button"
        class="slab slab--compact lean target"
        [attr.aria-label]="copy.target.edit(target())"
        (click)="editTarget.emit()"
      >
        <span class="label" [appFitText]="copy.target.label" [minScale]="0.5">{{
          copy.target.label
        }}</span>
        <span class="value numerals">{{ target() }}</span>
        <svg class="pencil" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 20l1-4.5L16.5 4 20 7.5 8.5 19z" />
          <path d="M14 6.5l3.5 3.5" />
        </svg>
      </button>
    }
    <button type="button" class="tool" [attr.aria-label]="copy.menu.a11y" (click)="menu.emit()">
      <!-- Three bars that lean like everything else. -->
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6.5 6.5h14M5 12h14M3.5 17.5h14" />
      </svg>
    </button>
    @if (status(); as status) {
      <!-- What is being played for, always in sight; it opens the table. -->
      <button
        type="button"
        class="status lean"
        [attr.aria-label]="status.a11y"
        (click)="status.tournament ? table.emit() : tables.emit()"
      >
        <span class="status__text numerals" [appFitText]="status.text">{{ status.text }}</span>
        <svg class="chevron" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M10 5l6 7-6 7" />
        </svg>
      </button>
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: var(--s-sm);
      padding: var(--s-md) var(--s-sm) var(--s-md) calc(var(--s-lg) + var(--s-sm));
    }

    .target {
      flex-shrink: 1;
    }

    /* As tall as the meta slab it replaces, so the header keeps its height. */
    .brand {
      display: flex;
      align-items: center;
      gap: var(--s-md);
      min-height: var(--min-target);
    }

    .mark {
      color: var(--c-text);
    }

    .brand__name {
      font: italic 800 var(--t-title) / 1.15 var(--font);
      text-transform: uppercase;
    }

    @media (max-height: 36em) {
      :host {
        padding-block: var(--s-xs);
      }
    }

    .label {
      min-width: 0;
      color: var(--c-muted);
      font: italic 600 var(--t-body) / 1.2 var(--font);
      letter-spacing: 0;
    }

    .value {
      font-size: var(--t-title);
      letter-spacing: 0;
    }

    svg {
      flex: none;
      fill: none;
      stroke: var(--c-muted);
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .pencil {
      width: 16px;
      height: 16px;
    }

    .status {
      --fill: var(--c-surface);
      --lean-inset: 5px;

      order: 3;
      flex: 1 1 100%;
      min-width: 0;
      min-height: var(--min-target);
      display: flex;
      align-items: center;
      gap: var(--s-sm);
      margin-right: var(--s-lg);
      padding: 0 var(--s-lg);
      border: 0;
      background: none;
      color: var(--c-text);
      text-align: left;
    }

    .status__text {
      flex: 1;
      min-width: 0;
      font: italic 600 var(--t-meta) / 1.3 var(--font);
      letter-spacing: 0.4px;
      text-transform: uppercase;
    }

    .chevron {
      width: 20px;
      height: 20px;
    }

    .status:active::before {
      opacity: var(--pressed);
    }

    @media (hover: hover) {
      .status:hover::before {
        filter: brightness(1.12);
      }
    }

    /* Short and wide: the status sits between the target and the menu. */
    @media (max-height: 36em) and (min-width: 30em) {
      .status {
        order: 1;
        flex: 1 1 0;
        margin-right: 0;
      }
    }

    .tool {
      position: relative;
      order: 2;
      flex: none;
      display: grid;
      place-items: center;
      width: var(--min-target);
      height: var(--min-target);
      padding: 0;
      border: 0;
      background: none;
    }

    .tool svg {
      width: 24px;
      height: 24px;
    }

    .tool:active {
      opacity: var(--pressed);
    }

    /* The ring leans like everything else, on a layer of its own. */
    .tool:focus-visible {
      outline: none;
    }

    .tool:focus-visible::after {
      content: '';
      position: absolute;
      inset: 0 5px;
      border: 3px solid var(--focus, var(--c-text));
      transform: skewX(-12deg);
    }

    /* After a touch, as everywhere, the ring waits for the keyboard. */
    :host-context([data-input='touch']) .tool:focus-visible::after {
      display: none;
    }

    @media (hover: hover) {
      .tool:hover svg {
        stroke: var(--c-text);
      }
    }
  `,
})
export class TargetHeader {
  protected readonly copy = copy;

  private readonly store = inject(GameStore);
  private readonly mesas = inject(TablesStore);

  /** What is being played for in a tournament; otherwise where. */
  protected readonly status = computed(() => {
    const tournament = this.store.tournament();
    if (tournament === null) {
      const mesa = this.mesas.active();
      if (mesa === null) return null;
      return {
        tournament: false,
        text: copy.tables.status(mesa.name),
        a11y: copy.tables.statusA11y(mesa.name),
      };
    }
    const status = copy.tournament.status(
      winsNeeded(tournament.rule),
      tournament.results.length + 1,
      tournament.tieBreak !== null,
    );
    // The mesa stays named during a tournament played there.
    const mesa = this.mesas.active();
    const text = mesa === null ? status : copy.tables.withTournament(status, mesa.name);
    return { tournament: true, text, a11y: copy.tournament.statusA11y(text) };
  });

  readonly target = input.required<number>();
  /** At Inicio: the app's name instead of the meta. */
  readonly brand = input(false);
  readonly editTarget = output<void>();
  readonly menu = output<void>();
  /** The table of the tournament being played. */
  readonly table = output<void>();
  /** The mesas, to play at another. */
  readonly tables = output<void>();
}
