import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  viewChild,
} from '@angular/core';

import { ChampionScreen } from './components/champion-screen';
import { HistoryScreen } from './components/history-screen';
import { MatchScreen } from './components/match-screen';
import { MenuSheet } from './components/menu-sheet';
import { NextMatchScreen } from './components/next-match-screen';
import { PointsSheet } from './components/points-sheet';
import { QuickAddBar } from './components/quick-add-bar';
import { ResetSheet } from './components/reset-sheet';
import { ScoreList } from './components/score-list';
import { SettingsSheet } from './components/settings-sheet';
import { StandingsScreen } from './components/standings-screen';
import { TargetHeader } from './components/target-header';
import { TeamLockup } from './components/team-lockup';
import { TeamEdit, TeamSheet } from './components/team-sheet';
import { TournamentRecordScreen } from './components/tournament-record-screen';
import { TournamentSetupScreen } from './components/tournament-setup-screen';
import { UndoSnackbar } from './components/undo-snackbar';
import { WinnerModal } from './components/winner-modal';
import { copy } from './copy';
import { GameStore } from './game/game.store';
import { DEFAULT_NAMES, TeamId, otherTeam } from './game/state';
import { keepStorage } from './game/storage';
import { followModality } from './platform/modality';
import { keepAwake } from './platform/wake-lock';

@Component({
  selector: 'app-root',
  imports: [
    TargetHeader,
    TeamLockup,
    ScoreList,
    UndoSnackbar,
    QuickAddBar,
    MenuSheet,
    PointsSheet,
    SettingsSheet,
    ResetSheet,
    TeamSheet,
    HistoryScreen,
    MatchScreen,
    TournamentRecordScreen,
    TournamentSetupScreen,
    NextMatchScreen,
    StandingsScreen,
    ChampionScreen,
    WinnerModal,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly store = inject(GameStore);

  private readonly board = viewChild.required<ElementRef<HTMLElement>>('board');
  private readonly list = viewChild.required(ScoreList);

  constructor() {
    const destroyRef = inject(DestroyRef);
    destroyRef.onDestroy(keepAwake());
    destroyRef.onDestroy(followModality());
    keepStorage();
    this.followKeyboard(destroyRef);
  }

  /** What the team sheet needs to change one of the two teams at the board. */
  protected boardTeam(team: TeamId): TeamEdit {
    const { teams } = this.store.state();
    const tournament = this.store.tournament();
    // In a tournament no two teams share a name; at the board, the two playing do not.
    const taken =
      tournament === null
        ? [teams[otherTeam(team)].name]
        : tournament.teams
            .filter((other) => other.id !== tournament.seats[team])
            .map((other) => other.name);
    return {
      title: copy.players.title,
      accent: `var(--c-team-${team})`,
      name: teams[team].name,
      players: teams[team].players,
      fallback: DEFAULT_NAMES[team],
      taken,
      confirm: copy.players.save,
      save: (name, players) => this.store.setTeam(team, name, players),
    };
  }

  /** The undo bar is gone once used, so focus goes to what it changed. */
  protected afterUndo(row: string | null): void {
    if (row !== null) this.list().focusRow(row);
    else this.board().nativeElement.focus();
  }

  /** Publishes the on-screen keyboard's height, so sheets sit above it. */
  private followKeyboard(destroyRef: DestroyRef): void {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const update = () => {
      const inset = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
      document.documentElement.style.setProperty('--keyboard-inset', `${Math.round(inset)}px`);
    };
    viewport.addEventListener('resize', update);
    viewport.addEventListener('scroll', update);
    destroyRef.onDestroy(() => {
      viewport.removeEventListener('resize', update);
      viewport.removeEventListener('scroll', update);
    });
  }
}
