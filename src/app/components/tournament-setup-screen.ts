import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';

import { copy } from '../copy';
import { FitText } from '../directives/fit-text';
import { GameStore } from '../game/game.store';
import { TEAM_IDS, parseAmount, sameName } from '../game/state';
import { SavedTeam } from '../game/tables';
import { TablesStore } from '../game/tables.store';
import {
  MAX_COUNT,
  MAX_TEAMS,
  MIN_TEAMS,
  Rule,
  TournamentTeam,
  winsNeeded,
} from '../game/tournament';
import { TournamentDraft } from '../game/tournament-draft';
import { Choice, ChoiceGroup } from './choice-group';
import { NumberField } from './number-field';
import { PlayerPair } from './player-pair';
import { Screen } from './screen';
import { Sheet } from './sheet';
import { TeamEdit } from './team-sheet';

type RuleKind = Rule['kind'];

/**
 * Who plays the tournament and how it ends. What is written here is kept, so
 * closing the screen by accident loses nothing.
 */
@Component({
  selector: 'app-tournament-setup-screen',
  imports: [Screen, Sheet, ChoiceGroup, NumberField, PlayerPair, FitText],
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
                  @if (team.players; as players) {
                    <app-player-pair class="players" [players]="players" />
                  } @else {
                    <span class="players">{{ copy.players.none }}</span>
                  }
                </span>
                <svg class="pencil" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 20l1-4.5L16.5 4 20 7.5 8.5 19z" />
                  <path d="M14 6.5l3.5 3.5" />
                </svg>
              </button>
            </li>
          }
        </ol>
        @if (teams().length > 2) {
          <p class="note">{{ copy.tournament.rotation }}</p>
        }
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

    <app-sheet #pick labelledBy="setup-pick-title">
      <h2 class="title" id="setup-pick-title">{{ copy.tournament.add }}</h2>
      <section class="part">
        <h3 class="heading">{{ copy.seat.saved }}</h3>
        <ol class="teams">
          @for (team of saved(); track team.id) {
            <li>
              <button
                type="button"
                class="team lean"
                [attr.aria-label]="copy.tournament.addSavedA11y(team.name, team.players)"
                (click)="addSaved(team)"
              >
                <span class="who">
                  <span class="name" [appFitText]="team.name">{{ team.name }}</span>
                  @if (team.players; as players) {
                    <app-player-pair class="players" [players]="players" />
                  } @else {
                    <span class="players">{{ copy.players.none }}</span>
                  }
                </span>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
              </button>
            </li>
          }
        </ol>
      </section>
      <div class="slab-row">
        <button type="button" class="slab slab--compact lean" (click)="pick.close()">
          <span class="slab__label" [appFitText]="copy.common.cancel">{{
            copy.common.cancel
          }}</span>
        </button>
        <button type="button" class="slab slab--compact lean" (click)="addNew()">
          <span class="slab__label" [appFitText]="copy.seat.newTeam">{{ copy.seat.newTeam }}</span>
        </button>
      </div>
    </app-sheet>
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

    .title {
      margin: 0;
      font: italic 800 var(--t-title) / 1.15 var(--font);
      text-transform: uppercase;
      text-wrap: balance;
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

  private readonly drafts = inject(TournamentDraft);
  private readonly mesas = inject(TablesStore);
  private readonly pick = viewChild.required<Sheet>('pick');

  protected readonly teams = computed(() => this.drafts.draft()?.teams ?? []);
  protected readonly kind = signal<RuleKind>(this.drafts.draft()?.kind ?? 'firstTo');
  protected readonly countText = signal(String(this.drafts.draft()?.count ?? 3));
  private nextTeam = 0;

  protected readonly full = computed(() => this.teams().length >= MAX_TEAMS);

  /** Teams of the mesa that are not in the tournament yet. */
  protected readonly saved = computed(() =>
    (this.mesas.active()?.teams ?? []).filter(
      (team) => !this.teams().some((other) => sameName(other.name, team.name)),
    ),
  );
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
    if (rule === null || needed === null) return null;
    return rule.kind === 'bestOf'
      ? copy.tournament.needsMajority(needed, rule.count, this.teams().length)
      : copy.tournament.needs(needed);
  });

  // The board is swept when the tournament starts; say so when there is something on it.
  protected readonly clears = computed(() => {
    const { rows, teams } = this.store.state();
    return rows.length > 0 || teams.a.roundsWon > 0 || teams.b.roundsWon > 0;
  });

  constructor() {
    // The rule is kept as it is chosen; a number being typed is kept once it is valid.
    effect(() => {
      const kind = this.kind();
      const count = this.count();
      untracked(() =>
        this.drafts.draft.update((draft) =>
          draft === null || (draft.kind === kind && (count === null || draft.count === count))
            ? draft
            : { ...draft, kind, count: count ?? draft.count, touched: true },
        ),
      );
    });
  }

  /** Continues with what was being prepared, or starts from the two teams at the board. */
  open(): void {
    const draft = this.drafts.draft();
    if (draft === null || !draft.touched) {
      const { teams } = this.store.state();
      this.drafts.draft.set({
        teams: TEAM_IDS.map((id) => ({
          id: this.newId(),
          name: teams[id].name,
          players: teams[id].players,
        })),
        kind: 'firstTo',
        count: 3,
        touched: false,
      });
    }
    const current = this.drafts.draft();
    this.kind.set(current?.kind ?? 'firstTo');
    this.countText.set(String(current?.count ?? 3));
    this.screen().open();
  }

  private setTeams(change: (teams: TournamentTeam[]) => TournamentTeam[]): void {
    this.drafts.draft.update((draft) =>
      draft === null ? null : { ...draft, teams: change(draft.teams), touched: true },
    );
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
      table: this.mesas.active()?.id ?? null,
      save: (name, players) =>
        this.setTeams((teams) =>
          teams.map((other) => (other.id === team.id ? { ...other, name, players } : other)),
        ),
      remove:
        this.teams().length > MIN_TEAMS
          ? () => this.setTeams((teams) => teams.filter((other) => other.id !== team.id))
          : undefined,
    });
  }

  // With saved teams at the mesa, they are offered first.
  protected add(): void {
    if (this.saved().length > 0) this.pick().open();
    else this.addNew();
  }

  protected addSaved(team: SavedTeam): void {
    this.pick().close();
    this.setTeams((current) =>
      current.length >= MAX_TEAMS
        ? current
        : [...current, { id: this.newId(), name: team.name, players: team.players }],
    );
  }

  protected addNew(): void {
    this.pick().close();
    const teams = this.teams();
    this.editTeam.emit({
      title: copy.players.newTitle,
      accent: null,
      name: '',
      players: null,
      fallback: this.freeName(teams.length + 1, teams),
      taken: teams.map((team) => team.name),
      confirm: copy.players.add,
      table: this.mesas.active()?.id ?? null,
      save: (name, players) =>
        this.setTeams((current) => [...current, { id: this.newId(), name, players }]),
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
    return `t${Date.now()}-${this.nextTeam}`;
  }

  /** "Equipo 3", or the next number that no other team is using. */
  private freeName(position: number, others: TournamentTeam[]): string {
    const used = new Set(others.map((team) => team.name.toLowerCase()));
    let number = position;
    while (used.has(copy.tournament.defaultName(number).toLowerCase())) number += 1;
    return copy.tournament.defaultName(number);
  }
}
