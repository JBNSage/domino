import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, Modal, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { copy } from '../copy';
import { TeamId, otherTeam } from '../game/state';
import {
  NUMERAL_SCALE,
  TEXT_SCALE,
  Theme,
  fonts,
  motion,
  space,
  type,
  useReduceMotion,
} from '../theme';
import { Lean, SlabButton, Slashes } from './Slab';

export type MatchResult = {
  winner: TeamId;
  names: Record<TeamId, string>;
  totals: Record<TeamId, number>;
  /** Rounds the winner will have once this one is counted. */
  roundsAfter: number;
};

type WinnerModalProps = {
  theme: Theme;
  result: MatchResult | null;
  onClose: () => void;
  /** Takes back whatever ended the round and returns to the board. */
  onCorrect: () => void;
  correctLabel: string;
};

/**
 * The winning livery floods the screen. "Nueva ronda" counts the win;
 * everything else, system Back included, takes back what ended the round.
 */
export function WinnerModal({ theme, result, onClose, onCorrect, correctLabel }: WinnerModalProps) {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReduceMotion();
  const shown = useRef<MatchResult | null>(result);
  if (result !== null) shown.current = result;
  const current = shown.current;

  const flood = useRef(new Animated.Value(1)).current;
  const visible = result !== null;

  useEffect(() => {
    if (!visible) return;
    if (reduceMotion) {
      flood.setValue(1);
      return;
    }
    flood.setValue(0);
    Animated.timing(flood, {
      toValue: 1,
      duration: motion.flood,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
  }, [visible, reduceMotion, flood]);

  if (current === null) return null;

  const color = theme.team[current.winner];
  const loser = otherTeam(current.winner);
  const width = Dimensions.get('window').width;

  return (
    <Modal
      visible={visible}
      animationType={reduceMotion ? 'none' : 'fade'}
      transparent
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onCorrect}
    >
      <View style={[styles.root, { backgroundColor: theme.ground }]}>
        {visible ? <StatusBar style="dark" /> : null}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.flood,
            {
              transform: [
                {
                  translateX: flood.interpolate({
                    inputRange: [0, 1],
                    outputRange: [current.winner === 'a' ? -width * 1.6 : width * 1.6, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Lean color={color} />
        </Animated.View>
        <View
          accessibilityViewIsModal
          style={[
            styles.content,
            {
              paddingTop: insets.top + space.xxl,
              paddingBottom: Math.max(insets.bottom, space.lg) + space.lg,
            },
          ]}
        >
          <View style={styles.heading}>
            <Slashes color={theme.ink} size={40} />
            <Text
              accessibilityRole="header"
              numberOfLines={1}
              adjustsFontSizeToFit
              maxFontSizeMultiplier={NUMERAL_SCALE}
              style={[styles.title, { color: theme.ink }]}
            >
              {copy.winner.title}
            </Text>
            <Text maxFontSizeMultiplier={TEXT_SCALE} style={[styles.body, { color: theme.ink }]}>
              {copy.winner.body(current.names[current.winner])}
            </Text>
            <Text maxFontSizeMultiplier={TEXT_SCALE} style={[styles.rounds, { color: theme.ink }]}>
              {copy.winner.roundsAfter(current.roundsAfter)}
            </Text>
          </View>

          <View style={styles.scores}>
            <View
              accessible
              accessibilityLabel={copy.winner.scoreA11y(
                current.names[current.winner],
                current.totals[current.winner],
              )}
              style={styles.winnerSlab}
            >
              <Lean color={theme.ink} />
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.6}
                maxFontSizeMultiplier={TEXT_SCALE}
                style={[styles.scoreName, { color }]}
              >
                {current.names[current.winner]}
              </Text>
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                maxFontSizeMultiplier={NUMERAL_SCALE}
                style={[styles.winnerTotal, { color }]}
              >
                {current.totals[current.winner]}
              </Text>
            </View>
            <View
              accessible
              accessibilityLabel={copy.winner.scoreA11y(current.names[loser], current.totals[loser])}
              style={styles.loserSlab}
            >
              <Lean color={color} borderColor={theme.ink} />
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.6}
                maxFontSizeMultiplier={TEXT_SCALE}
                style={[styles.scoreName, styles.loserName, { color: theme.ink }]}
              >
                {current.names[loser]}
              </Text>
              <Text
                maxFontSizeMultiplier={NUMERAL_SCALE}
                style={[styles.loserTotal, { color: theme.ink }]}
              >
                {current.totals[loser]}
              </Text>
            </View>
          </View>

          <View style={styles.actions}>
            <SlabButton
              theme={theme}
              size="compact"
              label={correctLabel}
              color={color}
              borderColor={theme.ink}
              textColor={theme.ink}
              onPress={onCorrect}
            />
            <SlabButton
              theme={theme}
              label={copy.winner.close}
              color={theme.ink}
              textColor={theme.onInk}
              onPress={onClose}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: 'hidden',
  },
  flood: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '-60%',
    right: '-60%',
  },
  content: {
    flex: 1,
    paddingHorizontal: space.xl,
  },
  heading: {
    gap: space.xs,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: type.display,
    lineHeight: type.display * 1.15,
    textTransform: 'uppercase',
    marginTop: space.md,
  },
  body: {
    fontFamily: fonts.display,
    fontSize: type.title,
    lineHeight: type.title * 1.2,
    textTransform: 'uppercase',
  },
  rounds: {
    fontFamily: fonts.label,
    fontSize: type.body,
    textTransform: 'uppercase',
    marginTop: space.xs,
  },
  scores: {
    flex: 1,
    justifyContent: 'center',
    gap: space.md,
    paddingHorizontal: space.sm,
    paddingVertical: space.xl,
  },
  winnerSlab: {
    paddingHorizontal: space.xxl + space.sm,
    paddingTop: space.xl,
    paddingBottom: space.md,
  },
  winnerTotal: {
    fontFamily: fonts.display,
    fontSize: type.winner,
    lineHeight: type.winner * 1.06,
    fontVariant: ['tabular-nums'],
  },
  loserSlab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.lg,
    paddingHorizontal: space.xxl,
    paddingVertical: space.sm,
  },
  scoreName: {
    fontFamily: fonts.display,
    fontSize: type.button,
    textTransform: 'uppercase',
  },
  loserName: {
    flex: 1,
  },
  loserTotal: {
    fontFamily: fonts.display,
    fontSize: type.display,
    lineHeight: type.display * 1.1,
    fontVariant: ['tabular-nums'],
  },
  actions: {
    gap: space.md,
    marginHorizontal: space.md,
  },
});
