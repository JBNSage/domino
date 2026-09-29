import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';

import { copy } from '../copy';
import { State, TeamId } from '../game/state';
import {
  NUMERAL_SCALE,
  PRESSED_OPACITY,
  TEXT_SCALE,
  Theme,
  fonts,
  motion,
  space,
  type,
  useReduceMotion,
} from '../theme';
import { Lean } from './Slab';

type TeamLockupProps = {
  theme: Theme;
  state: State;
  totals: Record<TeamId, number>;
  onPressTeam: (team: TeamId) => void;
};

/** Both liveries meeting on one diagonal seam. */
export function TeamLockup({ theme, state, totals, onPressTeam }: TeamLockupProps) {
  // Both totals share one size, so a 4-digit score never makes the two sides unequal.
  const digits = Math.max(String(totals.a).length, String(totals.b).length);
  const totalSize = digits <= 4 ? type.hull : type.display;

  return (
    <View style={styles.lockup}>
      {(['a', 'b'] as const).map((team) => (
        <TeamPanel
          key={team}
          side={team === 'a' ? 'left' : 'right'}
          theme={theme}
          color={theme.team[team]}
          name={state.teams[team].name}
          total={totals[team]}
          totalSize={totalSize}
          target={state.target}
          roundsWon={state.teams[team].roundsWon}
          onPress={() => onPressTeam(team)}
        />
      ))}
    </View>
  );
}

type TeamPanelProps = {
  side: 'left' | 'right';
  theme: Theme;
  color: string;
  name: string;
  total: number;
  totalSize: number;
  target: number;
  roundsWon: number;
  onPress: () => void;
};

function TeamPanel({
  side,
  theme,
  color,
  name,
  total,
  totalSize,
  target,
  roundsWon,
  onPress,
}: TeamPanelProps) {
  const reduceMotion = useReduceMotion();
  const pop = useRef(new Animated.Value(1)).current;
  const previous = useRef(total);

  useEffect(() => {
    if (previous.current === total) return;
    previous.current = total;
    if (reduceMotion) return;
    pop.setValue(1.14);
    Animated.timing(pop, {
      toValue: 1,
      duration: motion.pop,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
  }, [total, reduceMotion, pop]);

  const remaining = Math.max(0, target - total);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={copy.team.a11y(name, total, remaining, roundsWon)}
      accessibilityHint={copy.team.a11yHint}
      onPress={onPress}
      style={[styles.panel, side === 'left' ? styles.panelLeft : styles.panelRight]}
    >
      {({ pressed }) => (
        <>
          <Lean
            color={color}
            borderColor={theme.teamEdge}
            lean={LEAN}
            opacity={pressed ? PRESSED_OPACITY : 1}
            style={side === 'left' ? styles.liveryLeft : styles.liveryRight}
          />
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.6}
            maxFontSizeMultiplier={TEXT_SCALE}
            style={[styles.name, { color: theme.ink }]}
          >
            {name}
          </Text>
          <Animated.Text
            numberOfLines={1}
            adjustsFontSizeToFit
            maxFontSizeMultiplier={NUMERAL_SCALE}
            style={[
              styles.total,
              { fontSize: totalSize, lineHeight: totalSize * 1.05 },
              { color: theme.ink, transform: [{ scale: pop }] },
            ]}
          >
            {total}
          </Animated.Text>
          <View style={styles.meta}>
            <Text maxFontSizeMultiplier={TEXT_SCALE} style={[styles.remaining, { color: theme.ink }]}>
              {copy.team.remaining(remaining)}
            </Text>
            {/* With no rounds yet the chip keeps its space, so both totals stay level. */}
            <View
              accessibilityElementsHidden={roundsWon === 0}
              importantForAccessibility={roundsWon === 0 ? 'no-hide-descendants' : 'auto'}
              style={[styles.rounds, roundsWon === 0 && styles.hidden]}
            >
              <Lean color={theme.ink} />
              <Text maxFontSizeMultiplier={TEXT_SCALE} style={[styles.roundsLabel, { color }]}>
                {copy.team.rounds(roundsWon)}
              </Text>
            </View>
          </View>
        </>
      )}
    </Pressable>
  );
}

const BLEED = 48;
const SEAM = 3;
const LEAN = 36;

const styles = StyleSheet.create({
  lockup: {
    flexDirection: 'row',
    overflow: 'hidden',
  },
  panel: {
    flex: 1,
    minHeight: 172,
    paddingVertical: space.lg,
    justifyContent: 'space-between',
    gap: space.xs,
  },
  panelLeft: {
    paddingLeft: space.lg,
    paddingRight: space.xl,
  },
  panelRight: {
    paddingLeft: space.xl + space.sm,
    paddingRight: space.lg,
  },
  // Each livery reaches half a lean past the centre line, so the seam stays parallel.
  liveryLeft: {
    left: -BLEED,
    right: SEAM - LEAN / 2,
  },
  liveryRight: {
    left: SEAM - LEAN / 2,
    right: -BLEED,
  },
  name: {
    fontFamily: fonts.display,
    fontSize: type.button,
    lineHeight: type.button * 1.15,
    textTransform: 'uppercase',
  },
  total: {
    fontFamily: fonts.display,
    fontVariant: ['tabular-nums'],
  },
  meta: {
    alignItems: 'flex-start',
    gap: space.xs,
  },
  remaining: {
    fontFamily: fonts.label,
    fontSize: type.meta,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    fontVariant: ['tabular-nums'],
  },
  rounds: {
    paddingHorizontal: space.md,
    paddingVertical: 2,
  },
  hidden: {
    opacity: 0,
  },
  roundsLabel: {
    fontFamily: fonts.label,
    fontSize: type.meta,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    fontVariant: ['tabular-nums'],
  },
});
