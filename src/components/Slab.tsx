import { ReactNode, useState } from 'react';
import {
  AccessibilityActionEvent,
  AccessibilityProps,
  LayoutChangeEvent,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

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

// tan(12deg): how far a shape leans per unit of height.
const LEAN_RATIO = 0.2126;
const STROKE = 2;
export const PRESS_TRAVEL = 3;

type LeanProps = {
  color?: string;
  /** Keyline in this colour around a fill of `color`. */
  borderColor?: string;
  opacity?: number;
  /** Horizontal lean in points. Defaults to 12 degrees of the measured height. */
  lean?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * The leaning parallelogram every filled shape in the app is cut from.
 * Drawn as a path because Android does not render skew transforms.
 */
export function Lean({ color, borderColor, opacity = 1, lean, style }: LeanProps) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    if (width !== size.width || height !== size.height) setSize({ width, height });
  };

  const { width, height } = size;
  const offset = lean ?? height * LEAN_RATIO;

  const outline = (inset: number) => {
    // The slanted sides need a wider horizontal inset to keep the stroke even.
    const side = inset * 1.1;
    return [
      `M${offset + side},${inset}`,
      `L${width - side},${inset}`,
      `L${width - offset - side},${height - inset}`,
      `L${side},${height - inset}Z`,
    ].join(' ');
  };

  return (
    <View
      pointerEvents="none"
      onLayout={onLayout}
      style={[StyleSheet.absoluteFill, { opacity }, style]}
    >
      {width > 0 && height > 0 ? (
        <Svg width={width} height={height}>
          {borderColor ? <Path d={outline(0)} fill={borderColor} /> : null}
          {color ? <Path d={outline(borderColor ? STROKE : 0)} fill={color} /> : null}
        </Svg>
      ) : null}
    </View>
  );
}

type SlabButtonProps = AccessibilityProps & {
  label: string;
  theme: Theme;
  /** Fill colour. Omitted, the slab is outlined on the ground. */
  color?: string;
  /** Keyline. Defaults to the line colour on outlined slabs, none on filled ones. */
  borderColor?: string;
  textColor?: string;
  size?: 'regular' | 'compact';
  disabled?: boolean;
  onPress: () => void;
  onLongPress?: () => void;
  onAccessibilityAction?: (event: AccessibilityActionEvent) => void;
  style?: StyleProp<ViewStyle>;
  icon?: ReactNode;
};

export function SlabButton({
  label,
  theme,
  color,
  borderColor,
  textColor,
  size = 'regular',
  disabled = false,
  onPress,
  onLongPress,
  style,
  icon,
  ...a11y
}: SlabButtonProps) {
  const reduceMotion = useReduceMotion();
  const filled = color !== undefined;
  const fill = disabled ? theme.surfaceRaised : color ?? theme.ground;
  const edge = disabled ? undefined : borderColor ?? (filled ? undefined : theme.line);
  const ink = disabled ? theme.textMuted : textColor ?? (filled ? theme.ink : theme.text);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [
        styles.button,
        size === 'compact' && styles.compact,
        { transform: [{ translateX: pressed && !reduceMotion ? PRESS_TRAVEL : 0 }] },
        style,
      ]}
      {...a11y}
    >
      {({ pressed }) => (
        <>
          <Lean color={fill} borderColor={edge} opacity={pressed ? PRESSED_OPACITY : 1} />
          {icon}
          <Text
            numberOfLines={1}
            maxFontSizeMultiplier={TEXT_SCALE}
            adjustsFontSizeToFit
            style={[styles.buttonLabel, size === 'compact' && styles.compactLabel, { color: ink }]}
          >
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}

type SlashesProps = {
  color: string;
  size?: number;
};

export function Slashes({ color, size = 14 }: SlashesProps) {
  const width = size * 0.62;
  return (
    <View style={styles.slashes} accessibilityElementsHidden importantForAccessibility="no">
      {[0, 1, 2].map((index) => (
        <View key={index} style={{ width, height: size, marginLeft: index === 0 ? 0 : size * 0.05 }}>
          <Lean color={color} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: MIN_TARGET + 8,
    paddingHorizontal: space.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
  },
  compact: {
    minHeight: MIN_TARGET,
    paddingHorizontal: space.lg,
  },
  buttonLabel: {
    fontFamily: fonts.display,
    fontSize: type.button,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  compactLabel: {
    fontSize: type.body + 2,
  },
  slashes: {
    flexDirection: 'row',
  },
});
