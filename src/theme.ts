import { createContext, useContext, useEffect, useState } from 'react';
import { AccessibilityInfo, useColorScheme } from 'react-native';

import { TeamId } from './game/state';

export type Theme = {
  dark: boolean;
  ground: string;
  surface: string;
  surfaceRaised: string;
  line: string;
  text: string;
  textMuted: string;
  /** Ink printed on a team colour, in both appearances. */
  ink: string;
  /** Text printed on an ink fill. */
  onInk: string;
  team: Record<TeamId, string>;
  /**
   * Keyline around team fills. The acid yellow disappears against the pale
   * day ground, so by day every team shape carries an ink edge.
   */
  teamEdge: string | undefined;
  danger: string;
  onDanger: string;
  scrim: string;
};

const team: Record<TeamId, string> = {
  a: '#FF5A00',
  b: '#DFFF00',
};

const dark: Theme = {
  dark: true,
  ground: '#0E1114',
  surface: '#1A1E23',
  surfaceRaised: '#2A2F36',
  line: '#6B7480',
  text: '#FFFFFF',
  textMuted: '#B6BCC4',
  ink: '#0E1114',
  onInk: '#FFFFFF',
  team,
  teamEdge: undefined,
  danger: '#FF6B5C',
  onDanger: '#0E1114',
  scrim: 'rgba(0, 0, 0, 0.72)',
};

const light: Theme = {
  dark: false,
  ground: '#F1F2F4',
  surface: '#FFFFFF',
  surfaceRaised: '#E1E4E8',
  line: '#7D858F',
  text: '#0E1114',
  textMuted: '#4A525B',
  ink: '#0E1114',
  onInk: '#FFFFFF',
  team,
  teamEdge: '#0E1114',
  danger: '#B3261E',
  onDanger: '#FFFFFF',
  scrim: 'rgba(14, 17, 20, 0.6)',
};

export function useTheme(): Theme {
  return useColorScheme() === 'light' ? light : dark;
}

export const fonts = {
  display: 'Kanit_800ExtraBold_Italic',
  label: 'Kanit_600SemiBold_Italic',
  body: 'Kanit_500Medium',
};

export const type = {
  winner: 132,
  hull: 76,
  display: 56,
  field: 44,
  title: 28,
  button: 20,
  body: 16,
  meta: 15,
  label: 13,
};

/** Every text follows the system size up to this factor. */
export const TEXT_SCALE = 1.6;
/** Hull numerals already sit at display size, so they grow less. */
export const NUMERAL_SCALE = 1.2;

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const MIN_TARGET = 48;
export const PRESSED_OPACITY = 0.7;

export const motion = {
  enter: 200,
  pop: 220,
  flood: 220,
};

const ReduceMotionContext = createContext(false);
export const ReduceMotionProvider = ReduceMotionContext.Provider;

/** Reads the setting resolved once at the app root, so the first frame is already right. */
export function useReduceMotion(): boolean {
  return useContext(ReduceMotionContext);
}

/** Resolves the system Reduce Motion setting; null until the first answer arrives. */
export function useReduceMotionSetting(): boolean | null {
  const [reduce, setReduce] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (active) setReduce(value);
    });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduce);
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  return reduce;
}

export function useScreenReader(): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    let active = true;
    AccessibilityInfo.isScreenReaderEnabled().then((value) => {
      if (active) setEnabled(value);
    });
    const subscription = AccessibilityInfo.addEventListener('screenReaderChanged', setEnabled);
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  return enabled;
}
