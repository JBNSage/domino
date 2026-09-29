import { Pressable, StyleSheet, Text, View } from 'react-native';

import { copy } from '../copy';
import { MIN_TARGET, PRESSED_OPACITY, TEXT_SCALE, Theme, fonts, space, type } from '../theme';
import { Lean } from './Slab';

type UndoSnackbarProps = {
  theme: Theme;
  message: string | null;
  onUndo: () => void;
};

export const UNDO_BAR_HEIGHT = MIN_TARGET + 4 + space.sm * 2;

export function UndoSnackbar({ theme, message, onUndo }: UndoSnackbarProps) {
  if (message === null) return null;

  // Inverse surface, so it reads as a transient layer in both appearances.
  const surface = theme.text;
  const ink = theme.ground;

  return (
    <View accessibilityLiveRegion="polite" style={styles.bar}>
      <Lean color={surface} />
      <Text
        numberOfLines={2}
        maxFontSizeMultiplier={TEXT_SCALE}
        style={[styles.message, { color: ink }]}
      >
        {message}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${copy.undo.action}: ${message}`}
        onPress={onUndo}
        style={({ pressed }) => [styles.action, { opacity: pressed ? PRESSED_OPACITY : 1 }]}
      >
        <Text maxFontSizeMultiplier={TEXT_SCALE} style={[styles.actionLabel, { color: ink }]}>
          {copy.undo.action}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: space.lg,
    right: space.lg,
    bottom: space.sm,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: space.xl,
    paddingRight: space.sm,
    minHeight: MIN_TARGET + 4,
  },
  message: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: type.body,
  },
  action: {
    minHeight: MIN_TARGET,
    paddingHorizontal: space.lg,
    justifyContent: 'center',
  },
  actionLabel: {
    fontFamily: fonts.display,
    fontSize: type.body,
    textTransform: 'uppercase',
    textDecorationLine: 'underline',
  },
});
