import { Kanit_500Medium } from '@expo-google-fonts/kanit/500Medium';
import { Kanit_600SemiBold_Italic } from '@expo-google-fonts/kanit/600SemiBold_Italic';
import { Kanit_800ExtraBold_Italic } from '@expo-google-fonts/kanit/800ExtraBold_Italic';
import { useFonts } from 'expo-font';
import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { AccessibilityInfo, Alert, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import { PointsSheet } from './src/components/PointsSheet';
import { QuickAddBar } from './src/components/QuickAddBar';
import { ScoreList } from './src/components/ScoreList';
import { SettingsFocus, SettingsSheet } from './src/components/SettingsSheet';
import { TargetHeader } from './src/components/TargetHeader';
import { TeamLockup } from './src/components/TeamLockup';
import { UNDO_BAR_HEIGHT, UndoSnackbar } from './src/components/UndoSnackbar';
import { MatchResult, WinnerModal } from './src/components/WinnerModal';
import { copy } from './src/copy';
import {
  Row,
  State,
  TeamId,
  initialState,
  reducer,
  selectTotals,
  selectWinner,
} from './src/game/state';
import { loadState, saveState } from './src/game/storage';
import {
  ReduceMotionProvider,
  space,
  useReduceMotionSetting,
  useScreenReader,
  useTheme,
} from './src/theme';

// Long enough to notice at a noisy table; longer still when a screen reader has to reach it.
const UNDO_MS = 8000;
const UNDO_MS_SCREEN_READER = 20000;

type Undo = { message: string; snapshot: State };
/** The change that can end a round, kept so the winner screen can take it back. */
type LastChange = { kind: 'hand' } | { kind: 'target'; snapshot: State };

export default function App() {
  return (
    <SafeAreaProvider>
      <Scoreboard />
    </SafeAreaProvider>
  );
}

function Scoreboard() {
  useKeepAwake();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReduceMotionSetting();
  const screenReader = useScreenReader();
  const [fontsLoaded, fontError] = useFonts({
    Kanit_500Medium,
    Kanit_600SemiBold_Italic,
    Kanit_800ExtraBold_Italic,
  });

  const [state, dispatch] = useReducer(reducer, initialState);
  const [hydrated, setHydrated] = useState(false);
  const [pointsTeam, setPointsTeam] = useState<TeamId | null>(null);
  const [settings, setSettings] = useState<SettingsFocus | null>(null);
  const [undo, setUndo] = useState<Undo | null>(null);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextId = useRef(0);
  const lastChange = useRef<LastChange>({ kind: 'hand' });

  useEffect(() => {
    loadState().then((saved) => {
      if (saved !== null) dispatch({ type: 'hydrate', state: saved });
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (hydrated) saveState(state);
  }, [state, hydrated]);

  useEffect(
    () => () => {
      if (undoTimer.current) clearTimeout(undoTimer.current);
    },
    [],
  );

  const totals = useMemo(() => selectTotals(state), [state]);
  const winner = useMemo(() => selectWinner(state), [state]);

  const result: MatchResult | null = useMemo(() => {
    if (winner === null) return null;
    return {
      winner,
      names: { a: state.teams.a.name, b: state.teams.b.name },
      totals,
      roundsAfter: state.teams[winner].roundsWon + 1,
    };
  }, [winner, state.teams, totals]);

  useEffect(() => {
    if (winner !== null) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
  }, [winner]);

  const clearUndo = useCallback(() => {
    if (undoTimer.current) clearTimeout(undoTimer.current);
    undoTimer.current = null;
    setUndo(null);
  }, []);

  /** Applies a destructive action and offers to take it back. */
  const withUndo = useCallback(
    (message: string, apply: () => void) => {
      setUndo({ message, snapshot: state });
      apply();
      AccessibilityInfo.announceForAccessibility(message);
      if (undoTimer.current) clearTimeout(undoTimer.current);
      undoTimer.current = setTimeout(
        () => setUndo(null),
        screenReader ? UNDO_MS_SCREEN_READER : UNDO_MS,
      );
    },
    [state, screenReader],
  );

  const restore = useCallback(() => {
    if (undo === null) return;
    dispatch({ type: 'hydrate', state: undo.snapshot });
    clearUndo();
  }, [undo, clearUndo]);

  const addPoints = useCallback(
    (team: TeamId, points: number) => {
      nextId.current += 1;
      lastChange.current = { kind: 'hand' };
      dispatch({ type: 'addPoints', team, points, id: `${Date.now()}-${nextId.current}` });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      AccessibilityInfo.announceForAccessibility(
        copy.team.announce(state.teams[team].name, totals[team] + points),
      );
      clearUndo();
    },
    [clearUndo, state.teams, totals],
  );

  const deleteRow = useCallback(
    (row: Row, index: number) =>
      withUndo(copy.undo.handDeleted(index + 1), () => dispatch({ type: 'deleteRow', id: row.id })),
    [withUndo],
  );

  // What ended the round: a target lowered in this session, the last hand, or,
  // after a restart, a target lowered earlier that no single hand explains.
  const lastHandDecides =
    state.rows.length > 0 && selectWinner({ ...state, rows: state.rows.slice(0, -1) }) === null;
  const cause =
    lastChange.current.kind === 'target'
      ? 'restore'
      : lastHandDecides
        ? 'hand'
        : 'settings';

  const correct = () => {
    const change = lastChange.current;
    lastChange.current = { kind: 'hand' };
    if (cause === 'restore' && change.kind === 'target') {
      dispatch({ type: 'hydrate', state: change.snapshot });
    } else if (cause === 'hand') {
      const last = state.rows[state.rows.length - 1];
      deleteRow(last, state.rows.length - 1);
    } else {
      setSettings('target');
    }
  };

  const correctLabel =
    lastChange.current.kind === 'target'
      ? copy.winner.restoreTarget(lastChange.current.snapshot.target)
      : cause === 'hand'
        ? copy.winner.correct
        : copy.winner.changeTarget;

  const closeRound = () => {
    if (winner === null) return;
    withUndo(copy.undo.roundClosed, () => dispatch({ type: 'closeRound', winner }));
  };

  const confirmReset = () =>
    Alert.alert(copy.reset.title, copy.reset.body, [
      { text: copy.reset.cancel, style: 'cancel' },
      {
        text: copy.reset.hands,
        onPress: () => withUndo(copy.undo.handsCleared, () => dispatch({ type: 'clearRows' })),
      },
      {
        text: copy.reset.all,
        style: 'destructive',
        onPress: () => withUndo(copy.undo.allReset, () => dispatch({ type: 'resetAll' })),
      },
    ]);

  const saveSettings = (target: number, quickValue: number) => {
    if (target !== state.target) lastChange.current = { kind: 'target', snapshot: state };
    dispatch({ type: 'setTarget', target });
    dispatch({ type: 'setQuickValue', value: quickValue });
  };

  const ready = hydrated && reduceMotion !== null && (fontsLoaded || fontError !== null);

  return (
    <ReduceMotionProvider value={reduceMotion ?? false}>
      <View style={[styles.screen, { backgroundColor: theme.ground, paddingTop: insets.top }]}>
        <StatusBar style={theme.dark ? 'light' : 'dark'} />
        {ready ? (
          <>
            <TargetHeader
              theme={theme}
              target={state.target}
              onEditTarget={() => setSettings('target')}
              onReset={confirmReset}
            />
            <TeamLockup theme={theme} state={state} totals={totals} onPressTeam={setPointsTeam} />
            <View style={styles.body}>
              <ScoreList
                theme={theme}
                state={state}
                bottomInset={undo ? UNDO_BAR_HEIGHT : 0}
                onDelete={deleteRow}
              />
              <UndoSnackbar theme={theme} message={undo?.message ?? null} onUndo={restore} />
            </View>
            <View style={{ paddingBottom: insets.bottom + space.md }}>
              <QuickAddBar
                theme={theme}
                state={state}
                onEnter={setPointsTeam}
                onQuick={(team) => addPoints(team, state.quickValue)}
                onEditQuick={() => setSettings('quick')}
              />
            </View>

            <PointsSheet
              theme={theme}
              team={pointsTeam}
              teamName={pointsTeam ? state.teams[pointsTeam].name : ''}
              onRename={(team, name) => dispatch({ type: 'renameTeam', team, name })}
              onSubmit={(team, points) => {
                setPointsTeam(null);
                addPoints(team, points);
              }}
              onClose={() => setPointsTeam(null)}
            />
            <SettingsSheet
              theme={theme}
              focus={settings}
              state={state}
              onSave={saveSettings}
              onClose={() => setSettings(null)}
            />
            <WinnerModal
              theme={theme}
              result={pointsTeam === null && settings === null ? result : null}
              onClose={closeRound}
              onCorrect={correct}
              correctLabel={correctLabel}
            />
          </>
        ) : null}
      </View>
    </ReduceMotionProvider>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  body: {
    flex: 1,
  },
});
