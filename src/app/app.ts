import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  afterNextRender,
  effect,
  inject,
  untracked,
  viewChild,
} from '@angular/core';

import { ChampionScreen } from './components/champion-screen';
import { HistoryScreen } from './components/history-screen';
import { HomeScreen } from './components/home-screen';
import { MatchScreen } from './components/match-screen';
import { MatchSetupScreen } from './components/match-setup-screen';
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
import { PlayerStatsScreen } from './components/player-stats-screen';
import { SeatSheet } from './components/seat-sheet';
import { StatsScreen } from './components/stats-screen';
import { TableScreen } from './components/table-screen';
import { TablesScreen } from './components/tables-screen';
import { TeamEdits } from './components/team-edits';
import { TeamSheet } from './components/team-sheet';
import { TournamentRecordScreen } from './components/tournament-record-screen';
import { TournamentSetupScreen } from './components/tournament-setup-screen';
import { UndoSnackbar } from './components/undo-snackbar';
import { WinnerModal } from './components/winner-modal';
import { GameStore } from './game/game.store';
import { TeamId } from './game/state';
import { TablesStore } from './game/tables.store';
import { keepStorage } from './game/storage';
import { followModality } from './platform/modality';
import { keepAwake } from './platform/wake-lock';

@Component({
  selector: 'app-root',
  imports: [
    HomeScreen,
    MatchSetupScreen,
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
    SeatSheet,
    HistoryScreen,
    TablesScreen,
    TableScreen,
    StatsScreen,
    PlayerStatsScreen,
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
  private readonly tables = inject(TablesStore);
  private readonly edits = inject(TeamEdits);
  private readonly injector = inject(Injector);
  private readonly home = viewChild(HomeScreen);
  private readonly seat = viewChild.required(SeatSheet);
  private readonly team = viewChild.required(TeamSheet);

  private readonly board = viewChild.required<ElementRef<HTMLElement>>('board');
  private readonly list = viewChild.required(ScoreList);

  constructor() {
    const destroyRef = inject(DestroyRef);
    destroyRef.onDestroy(followModality());
    keepStorage();
    this.followKeyboard(destroyRef);
    this.keepBoardAwake(destroyRef);
    this.followHome();
  }

  /**
   * A side of the board, from the menu. At a mesa, another team can take it;
   * otherwise its name and players change.
   */
  protected editSide(side: TeamId): void {
    if (this.tables.active() !== null && this.store.tournament() === null) this.seat().open(side);
    else this.team().open(this.edits.side(side));
  }

  /** The undo bar is gone once used, so focus goes to what it changed. */
  protected afterUndo(row: string | null): void {
    if (this.store.atHome()) this.home()?.focus();
    else if (row !== null) this.list().focusRow(row);
    else this.board().nativeElement.focus();
  }

  /** The scoreboard keeps the screen on; Inicio lets it sleep. */
  private keepBoardAwake(destroyRef: DestroyRef): void {
    let release: (() => void) | null = null;
    effect(() => {
      const atHome = this.store.atHome();
      untracked(() => {
        if (atHome) {
          release?.();
          release = null;
        } else {
          release ??= keepAwake();
        }
      });
    });
    destroyRef.onDestroy(() => release?.());
  }

  /**
   * Focus follows Inicio coming and going during a session; at launch it is
   * left where the browser puts it.
   */
  private followHome(): void {
    let before = this.store.atHome();
    effect(() => {
      const atHome = this.store.atHome();
      if (atHome === before) return;
      before = atHome;
      afterNextRender(
        () => {
          const active = document.activeElement;
          // A dialog still open keeps focus; the one that just closed may have left it on Inicio.
          if (active?.closest('dialog[open]')) return;
          if (atHome) this.home()?.focus();
          else this.board().nativeElement.focus();
        },
        { injector: this.injector },
      );
    });
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
