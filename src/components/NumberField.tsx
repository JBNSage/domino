import { forwardRef, useEffect } from 'react';
import { AccessibilityInfo, Platform, StyleSheet, Text, TextInput, View } from 'react-native';

import { copy } from '../copy';
import { NUMERAL_SCALE, TEXT_SCALE, Theme, fonts, space, type } from '../theme';

type NumberFieldProps = {
  theme: Theme;
  accent: string;
  label: string;
  value: string;
  maxLength: number;
  error: string | null;
  /** A non-blocking note under the field, such as a consequence of saving. */
  notice?: string | null;
  onChange: (value: string) => void;
  onSubmit: () => void;
};

export const NumberField = forwardRef<TextInput, NumberFieldProps>(function NumberField(
  { theme, accent, label, value, maxLength, error, notice, onChange, onSubmit },
  ref,
) {
  // Android reads the live region below; iOS needs an explicit announcement.
  useEffect(() => {
    if (Platform.OS === 'ios' && error) AccessibilityInfo.announceForAccessibility(error);
  }, [error]);

  useEffect(() => {
    if (Platform.OS === 'ios' && notice) AccessibilityInfo.announceForAccessibility(notice);
  }, [notice]);

  return (
    <View style={styles.field}>
      <Text maxFontSizeMultiplier={TEXT_SCALE} style={[styles.label, { color: theme.textMuted }]}>
        {label}
      </Text>
      <TextInput
        ref={ref}
        accessibilityLabel={label}
        value={value}
        onChangeText={(text) => onChange(text.replace(/\D/g, ''))}
        onSubmitEditing={onSubmit}
        keyboardType="number-pad"
        returnKeyType="done"
        maxLength={maxLength}
        selectTextOnFocus
        maxFontSizeMultiplier={NUMERAL_SCALE}
        placeholder={copy.points.placeholder}
        placeholderTextColor={theme.textMuted}
        selectionColor={theme.line}
        cursorColor={theme.dark ? accent : theme.text}
        style={[
          styles.input,
          {
            color: theme.text,
            backgroundColor: theme.surface,
            borderColor: error ? theme.danger : theme.line,
          },
        ]}
      />
      {error ? (
        <Text
          accessibilityLiveRegion="polite"
          maxFontSizeMultiplier={TEXT_SCALE}
          style={[styles.message, { color: theme.danger }]}
        >
          {error}
        </Text>
      ) : notice ? (
        <Text
          accessibilityLiveRegion="polite"
          maxFontSizeMultiplier={TEXT_SCALE}
          style={[styles.message, { color: theme.text }]}
        >
          {notice}
        </Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  field: {
    gap: space.xs,
  },
  label: {
    fontFamily: fonts.label,
    fontSize: type.label,
    textTransform: 'uppercase',
  },
  input: {
    fontFamily: fonts.display,
    fontSize: type.field,
    minHeight: 76,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
    borderWidth: 2,
    fontVariant: ['tabular-nums'],
  },
  message: {
    fontFamily: fonts.body,
    fontSize: type.body,
    lineHeight: type.body * 1.35,
  },
});
