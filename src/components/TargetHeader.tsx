import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { copy } from '../copy';
import {
  MIN_TARGET,
  PRESSED_OPACITY,
  TEXT_SCALE,
  Theme,
  fonts,
  space,
  type,
  useReduceMotion,
} from '../theme';
import { Lean, PRESS_TRAVEL } from './Slab';

type TargetHeaderProps = {
  theme: Theme;
  target: number;
  onEditTarget: () => void;
  onReset: () => void;
};

export function TargetHeader({ theme, target, onEditTarget, onReset }: TargetHeaderProps) {
  const reduceMotion = useReduceMotion();

  return (
    <View style={styles.header}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={copy.target.edit(target)}
        onPress={onEditTarget}
        style={({ pressed }) => [
          styles.target,
          { transform: [{ translateX: pressed && !reduceMotion ? PRESS_TRAVEL : 0 }] },
        ]}
      >
        {({ pressed }) => (
          <>
            <Lean
              color={theme.ground}
              borderColor={theme.line}
              opacity={pressed ? PRESSED_OPACITY : 1}
            />
            <Text
              numberOfLines={1}
              maxFontSizeMultiplier={TEXT_SCALE}
              style={[styles.label, { color: theme.textMuted }]}
            >
              {copy.target.label}
            </Text>
            <Text maxFontSizeMultiplier={TEXT_SCALE} style={[styles.value, { color: theme.text }]}>
              {target}
            </Text>
            <Ionicons name="pencil" size={16} color={theme.textMuted} />
          </>
        )}
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={copy.reset.a11y}
        onPress={onReset}
        style={({ pressed }) => [styles.reset, { opacity: pressed ? PRESSED_OPACITY : 1 }]}
      >
        <Ionicons name="trash-outline" size={24} color={theme.textMuted} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.sm,
    paddingLeft: space.lg + space.sm,
    paddingRight: space.sm,
    paddingVertical: space.md,
  },
  target: {
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    minHeight: MIN_TARGET,
    paddingHorizontal: space.lg,
  },
  label: {
    flexShrink: 1,
    fontFamily: fonts.label,
    fontSize: type.body,
    textTransform: 'uppercase',
  },
  value: {
    fontFamily: fonts.display,
    fontSize: type.title,
    fontVariant: ['tabular-nums'],
  },
  reset: {
    width: MIN_TARGET,
    height: MIN_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
