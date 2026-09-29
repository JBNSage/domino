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
import { GameStore } from '../game/game.store';
import { TEAM_IDS } from '../game/state';
import {
  MAX_COUNT,
  MAX_TEAMS,
  MIN_TEAMS,
  Rule,
  TournamentTeam,
  winsNeeded,
} from '../game/tournament';
import { parseAmount } from '../game/state';
import { Choice, ChoiceGroup } from './choice-group';
import { NumberField } from './number-field';
import { Screen } from './screen';
import { TeamEdit } from './team-sheet';

type RuleKind = Rule['kind'];

/** Who plays the tournament and how it ends. Nothing is kept until it starts. */
@Component({
  selector: 'app-tournament-setup-screen',
  imports: [Screen, ChoiceGroup, NumberField, FitText],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-screen [heading]="copy.tournament.setupTitle">
      <section class="part">
        <h3 class="heading">{{ copy.tournament.teams }}</h3>
        <ol class="teams">
          @for (team of teams(); track team.id; let index = $index) {
            <li>
              <button
                type="button"
                class="team lean"
                [attr.aria-label]="copy.tournament.teamA11y(index + 1, team.name, team.players)"
                (click)="edit(team, index)"
              >
                <span class="position numerals">{{ index + 1 }}</span>
                <span class="who">
                  <span class="name" [appFitText]="team.name">{{ team.name }}</span>
                  <span class="players" [appFitText]="players(team)">{{ players(team) }}</span>
                </span>
                <svg class="pencil" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 20l1-4.5L16.5 4 20 7.5 8.5 19z" />
                  <path d="M14 6.5l3.5 3.5" />
                </svg>
              </button>
            </li>
          }
        </ol>
        @if (full()) {
          <p class="note">{{ copy.tournament.full }}</p>
        } @else {
          <button type="button" class="slab slab--compact lean add" (click)="add()">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span class="slab__label" [appFitText]="copy.tournament.add">{{
              copy.tournament.add
            }}</span>
          </button>
        }
      </section>

      <section class="part">
        <app-choice-group [label]="copy.tournament.ruleLabel" [options]="kinds" [(value)]="kind" />
        @if (kind() !== 'free') {
          <app-number-field
            [label]="
              kind() === 'firstTo' ? copy.tournament.firstToLabel : copy.tournament.bestOfLabel
            "
            [maxLength]="countLength"
            [error]="countError()"
            [notice]="notice()"
            [(value)]="countText"
          />
        } @else {
          <p class="note">{{ copy.tournament.freeNote }}</p>
        }
      </section>

      @if (clears()) {
        <p class="note">{{ copy.tournament.clears }}</p>
      }

      <button
        screenFooter
        type="button"
        class="slab slab--filled lean start"
        [disabled]="rule() === null"
        (click)="start()"
      >
        <span class="slab__label" [appFitText]="copy.tournament.start">{{
          copy.tournament.start
        }}</span>
      </button>
    </app-screen>
  `,
  styles: `
    .part {
      display: flex;
      flex-direction: column;
      gap: var(--s-md);
    }

    .heading {
      margin: 0;
      padding: 0 var(--s-sm);
      color: var(--c-muted);
      font: italic 600 var(--t-label) / 1.3 var(--font);
      text-transform: uppercase;
    }

    app-choice-group,
    app-number-field {
      padding: 0 var(--s-sm);
    }

    app-number-field {
      --caret: var(--c-text);
    }

    .teams {
      display: flex;
      flex-direction: column;
      gap: var(--s-sm);
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .team {
      --fill: var(--c-surface);
      --lean-inset: 8px;

      width: 100%;
      min-height: calc(var(--min-target) + 12px);
      display: flex;
      align-items: center;
      gap: var(--s-sm);
      padding: var(--s-sm) min(var(--s-xl), 6vw) var(--s-sm) min(var(--s-lg), 4vw);
      border: 0;
      background: none;
      color: var(--c-text);
      text-align: left;
    }

    .team:active::before {
      opacity: var(--pressed);
    }

    @media (hover: hover) {
      .team:hover::before {
        filter: brightness(1.12);
      }
    }

    .position {
      flex: none;
      width: min(2.25rem, 11vw);
      color: var(--c-muted);
      font: italic 800 min(var(--t-title), 8vw) / 1 var(--font);
      text-align: center;
    }

    .who {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
    }

    .name {
      font: italic 800 var(--t-button) / 1.2 var(--font);
      text-transform: uppercase;
    }

    .players {
      color: var(--c-muted);
      font: italic 600 var(--t-label) / 1.3 var(--font);
      text-transform: uppercase;
    }

    svg {
      flex: none;
      width: 20px;
      height: 20px;
      fill: none;
      stroke: var(--c-muted);
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .add {
      align-self: flex-start;
      max-width: calc(100% - var(--s-lg));
      margin: 0 var(--s-sm);
    }

    .add svg {
      stroke: currentColor;
    }

    .note {
      margin: 0;
      padding: 0 var(--s-sm);
      max-width: 40ch;
      color: var(--c-muted);
      line-height: 1.35;
    }

    .start:not(:disabled) {
      --fill: var(--c-text);
      --label: var(--c-ground);
    }
  `,
})
export class TournamentSetupScreen {
  protected readonly copy = copy;
  protected readonly countLength = String(MAX_COUNT).length;
  protected readonly kinds: Choice<RuleKind>[] = [
    { value: 'firstTo', label: copy.tournament.firstTo },
    { value: 'bestOf', label: copy.tournament.bestOf },
    { value: 'free', label: copy.tournament.free },
  ];

  /** Asks for the team sheet, which the shell owns. */
  readonly editTeam = output<TeamEdit>();

  private readonly store = inject(GameStore);
  private readonly screen = viewChild.required(Screen);

  protected readonly teams = signal<TournamentTeam[]>([]);
  protected readonly kind = signal<RuleKind>('firstTo');
  protected readonly countText = signal('3');
  private nextTeam = 0;

  protected readonly full = computed(() => this.teams().length >= MAX_TEAMS);
  private readonly count = computed(() => parseAmount(this.countText(), MAX_COUNT));

  protected readonly countError = computed(() =>
    this.countText().length > 0 && this.count() === null ? copy.tournament.countError : null,
  );

  protected readonly rule = computed<Rule | null>(() => {
    if (this.teams().length < MIN_TEAMS) return null;
    const kind = this.kind();
    if (kind === 'free') return { kind };
    const count = this.count();
    return count === null ? null : { kind, count };
  });

  protected readonly notice = computed(() => {
    const rule = this.rule();
    const needed = rule === null ? null : winsNeeded(rule);
    return needed === null ? null : copy.tournament.needs(needed);
  });

  // The board is swept when the tournament starts; say so when there is something on it.
  protected readonly clears = computed(() => {
    const { rows, teams } = this.store.state();
    return rows.length > 0 || teams.a.roundsWon > 0 || teams.b.roundsWon > 0;
  });

  /** Starts from the two teams at the board. */
  open(): void {
    const { teams } = this.store.state();
    this.teams.set(
      TEAM_IDS.map((id) => ({
        id: this.newId(),
        name: teams[id].name,
        players: teams[id].players,
      })),
    );
    this.kind.set('firstTo');
    this.countText.set('3');
    this.screen().open();
  }

  protected players(team: TournamentTeam): string {
    return team.players ? copy.players.pair(team.players) : copy.players.none;
  }

  protected edit(team: TournamentTeam, index: number): void {
    const others = this.teams().filter((other) => other.id !== team.id);
    this.editTeam.emit({
      title: copy.players.title,
      accent: null,
      name: team.name,
      players: team.players,
      fallback: this.freeName(index + 1, others),
      taken: others.map((other) => other.name),
      confirm: copy.players.save,
      save: (name, players) =>
        this.teams.update((teams) =>
          teams.map((other) => (other.id === team.id ? { ...other, name, players } : other)),
        ),
      remove:
        this.teams().length > MIN_TEAMS
          ? () => this.teams.update((teams) => teams.filter((other) => other.id !== team.id))
          : undefined,
    });
  }

  protected add(): void {
    const teams = this.teams();
    this.editTeam.emit({
      title: copy.players.newTitle,
      accent: null,
      name: '',
      players: null,
      fallback: this.freeName(teams.length + 1, teams),
      taken: teams.map((team) => team.name),
      confirm: copy.players.add,
      save: (name, players) =>
        this.teams.update((current) => [...current, { id: this.newId(), name, players }]),
    });
  }

  protected start(): void {
    const rule = this.rule();
    if (rule === null) return;
    this.screen().close();
    this.store.startTournament(this.teams(), rule);
  }

  private newId(): string {
    this.nextTeam += 1;
    return `t${this.nextTeam}`;
  }

  /** "Equipo 3", or the next number that no other team is using. */
  private freeName(position: number, others: TournamentTeam[]): string {
    const used = new Set(others.map((team) => team.name.toLowerCase()));
    let number = position;
    while (used.has(copy.tournament.defaultName(number).toLowerCase())) number += 1;
    return copy.tournament.defaultName(number);
  }
}
