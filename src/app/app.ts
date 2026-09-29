import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  viewChild,
} from '@angular/core';

import { PointsSheet } from './components/points-sheet';
import { QuickAddBar } from './components/quick-add-bar';
import { ResetSheet } from './components/reset-sheet';
import { ScoreList } from './components/score-list';
import { SettingsSheet } from './components/settings-sheet';
import { TargetHeader } from './components/target-header';
import { TeamLockup } from './components/team-lockup';
import { UndoSnackbar } from './components/undo-snackbar';
import { WinnerModal } from './components/winner-modal';
import { GameStore } from './game/game.store';
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
    PointsSheet,
    SettingsSheet,
    ResetSheet,
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
