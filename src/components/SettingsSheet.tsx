import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { copy } from '../copy';
import {
  MAX_POINTS,
  MAX_TARGET,
  State,
  parseAmount,
  selectTotals,
  selectWinner,
} from '../game/state';
import { TEXT_SCALE, Theme, fonts, space, type } from '../theme';
import { NumberField } from './NumberField';
import { Sheet } from './Sheet';
import { SlabButton } from './Slab';

export type SettingsFocus = 'target' | 'quick';

type SettingsSheetProps = {
  theme: Theme;
  /** Which field to focus; null keeps the sheet closed. */
  focus: SettingsFocus | null;
  state: State;
  onSave: (target: number, quickValue: number) => void;
  onClose: () => void;
};

/** The round's two numbers: points to win and the quick bonus. */
export function SettingsSheet({ theme, focus, state, onSave, onClose }: SettingsSheetProps) {
  const [target, setTarget] = useState('');
  const [quick, setQuick] = useState('');
  const targetInput = useRef<TextInput>(null);
  const quickInput = useRef<TextInput>(null);
  const shownFocus = useRef<SettingsFocus>('target');
  if (focus !== null) shownFocus.current = focus;

  useEffect(() => {
    if (focus === null) return;
    setTarget(String(state.target));
    setQuick(String(state.quickValue));
    // Only when the sheet opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus]);

  const targetValue = parseAmount(target, MAX_TARGET);
  const quickValue = parseAmount(quick, MAX_POINTS);
  const targetError = target.length > 0 && targetValue === null ? copy.settings.targetError : null;
  const quickError = quick.length > 0 && quickValue === null ? copy.settings.quickError : null;

  // Saving a target at or below a running total ends the round, so say so first.
  const endsWith =
    targetValue !== null && targetValue !== state.target
      ? selectWinner({ ...state, target: targetValue })
      : null;
  const notice =
    endsWith !== null
      ? copy.settings.endsRound(state.teams[endsWith].name, selectTotals(state)[endsWith])
      : null;

  const valid = targetValue !== null && quickValue !== null;

  const save = () => {
    if (targetValue === null || quickValue === null) return;
    onSave(targetValue, quickValue);
    onClose();
  };

  return (
    <Sheet
      theme={theme}
      visible={focus !== null}
      accent={theme.text}
      onClose={onClose}
      onShow={() =>
        setTimeout(
          () =>
            (shownFocus.current === 'quick' ? quickInput : targetInput).current?.focus(),
          80,
        )
      }
    >
      <Text
        accessibilityRole="header"
        maxFontSizeMultiplier={TEXT_SCALE}
        style={[styles.title, { color: theme.text }]}
      >
        {copy.settings.title}
      </Text>
      <NumberField
        ref={targetInput}
        theme={theme}
        accent={theme.team.b}
        label={copy.settings.targetLabel}
        value={target}
        maxLength={String(MAX_TARGET).length}
        error={targetError}
        notice={notice}
        onChange={setTarget}
        onSubmit={() => quickInput.current?.focus()}
      />
      <NumberField
        ref={quickInput}
        theme={theme}
        accent={theme.team.b}
        label={copy.settings.quickLabel}
        value={quick}
        maxLength={String(MAX_POINTS).length}
        error={quickError}
        onChange={setQuick}
        onSubmit={save}
      />
      <View style={styles.actions}>
        <SlabButton theme={theme} label={copy.common.cancel} onPress={onClose} style={styles.action} />
        <SlabButton
          theme={theme}
          label={notice ? copy.settings.saveAndEnd : copy.settings.save}
          color={theme.text}
          textColor={theme.ground}
          disabled={!valid}
          onPress={save}
          style={styles.primary}
        />
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: fonts.display,
    fontSize: type.title,
    textTransform: 'uppercase',
  },
  actions: {
    flexDirection: 'row',
    gap: space.lg,
    paddingHorizontal: space.sm,
  },
  action: {
    flex: 1,
  },
  primary: {
    flex: 1.5,
  },
});
