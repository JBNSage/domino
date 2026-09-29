import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { copy } from '../copy';
import { MAX_NAME_LENGTH, MAX_POINTS, TeamId, cleanName, parseAmount } from '../game/state';
import { MIN_TARGET, TEXT_SCALE, Theme, fonts, space, type } from '../theme';
import { NumberField } from './NumberField';
import { Sheet } from './Sheet';
import { SlabButton } from './Slab';

type PointsSheetProps = {
  theme: Theme;
  team: TeamId | null;
  teamName: string;
  onRename: (team: TeamId, name: string) => void;
  onSubmit: (team: TeamId, points: number) => void;
  onClose: () => void;
};

export function PointsSheet({ theme, team, teamName, onRename, onSubmit, onClose }: PointsSheetProps) {
  // The sheet keeps showing the last team while it slides away.
  const shown = useRef<TeamId>('a');
  if (team !== null) shown.current = team;
  const current = shown.current;
  const accent = theme.team[current];

  const [name, setName] = useState(teamName);
  const [points, setPoints] = useState('');
  const pointsInput = useRef<TextInput>(null);

  useEffect(() => {
    if (team === null) return;
    setName(teamName);
    setPoints('');
    // Only when the sheet opens; typing a name must not clear the points.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [team]);

  const amount = parseAmount(points, MAX_POINTS);
  const error = points.length > 0 && amount === null ? copy.points.error : null;
  const renamed = cleanName(name, current) !== teamName;

  // Cancel, a tap outside and system Back all discard: nothing is saved without a button.
  const submit = () => {
    if (amount !== null) {
      if (renamed) onRename(current, name);
      onSubmit(current, amount);
    } else if (renamed && points.length === 0) {
      onRename(current, name);
      onClose();
    }
  };

  const nameOnly = amount === null && points.length === 0 && renamed;

  return (
    <Sheet
      theme={theme}
      visible={team !== null}
      accent={accent}
      onClose={onClose}
      onShow={() => setTimeout(() => pointsInput.current?.focus(), 80)}
    >
      <View>
        <Text maxFontSizeMultiplier={TEXT_SCALE} style={[styles.label, { color: theme.textMuted }]}>
          {copy.points.nameLabel}
        </Text>
        <View style={[styles.nameRow, { borderBottomColor: theme.line }]}>
          <TextInput
            accessibilityLabel={copy.points.nameA11y}
            value={name}
            onChangeText={setName}
            onSubmitEditing={() => pointsInput.current?.focus()}
            maxLength={MAX_NAME_LENGTH}
            autoCapitalize="characters"
            autoCorrect={false}
            returnKeyType="next"
            selectTextOnFocus
            maxFontSizeMultiplier={TEXT_SCALE}
            selectionColor={theme.line}
            cursorColor={theme.dark ? accent : theme.text}
            style={[styles.name, { color: theme.text }]}
          />
          <Ionicons name="pencil" size={20} color={theme.textMuted} />
        </View>
      </View>

      <NumberField
        ref={pointsInput}
        theme={theme}
        accent={accent}
        label={copy.points.inputLabel}
        value={points}
        maxLength={3}
        error={error}
        onChange={setPoints}
        onSubmit={submit}
      />

      <View style={styles.actions}>
        <SlabButton theme={theme} label={copy.common.cancel} onPress={onClose} style={styles.action} />
        <SlabButton
          theme={theme}
          label={nameOnly ? copy.points.saveName : copy.points.confirm}
          color={accent}
          borderColor={theme.teamEdge}
          disabled={amount === null && !nameOnly}
          onPress={submit}
          style={styles.action}
        />
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: fonts.label,
    fontSize: type.label,
    textTransform: 'uppercase',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    borderBottomWidth: 2,
  },
  name: {
    flex: 1,
    minHeight: MIN_TARGET,
    fontFamily: fonts.display,
    fontSize: type.title,
    textTransform: 'uppercase',
    paddingVertical: space.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: space.lg,
    paddingHorizontal: space.sm,
  },
  action: {
    flex: 1,
  },
});
