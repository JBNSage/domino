import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { copy } from '../copy';
import { Row, State, TeamId } from '../game/state';
import {
  MIN_TARGET,
  PRESSED_OPACITY,
  TEXT_SCALE,
  Theme,
  fonts,
  motion,
  space,
  type,
  useReduceMotion,
} from '../theme';
import { Lean, SlabButton, Slashes } from './Slab';

type ScoreListProps = {
  theme: Theme;
  state: State;
  /** Space kept clear at the end of the list, for the undo bar. */
  bottomInset: number;
  onDelete: (row: Row, index: number) => void;
};

export function ScoreList({ theme, state, bottomInset, onDelete }: ScoreListProps) {
  const reduceMotion = useReduceMotion();
  const list = useRef<FlatList<Row>>(null);
  const seen = useRef(new Set(state.rows.map((row) => row.id)));
  const [selected, setSelected] = useState<string | null>(null);
  const lastId = state.rows.length > 0 ? state.rows[state.rows.length - 1].id : null;

  // A new hand, or the list changing under a selection, drops the selection.
  useEffect(() => {
    setSelected(null);
  }, [state.rows.length]);

  useEffect(() => {
    if (lastId === null) return;
    const timer = setTimeout(() => list.current?.scrollToEnd({ animated: !reduceMotion }), 50);
    return () => clearTimeout(timer);
  }, [lastId, reduceMotion, bottomInset]);

  return (
    <FlatList
      ref={list}
      data={state.rows}
      keyExtractor={(row) => row.id}
      style={styles.list}
      extraData={selected}
      contentContainerStyle={
        state.rows.length === 0
          ? styles.emptyContent
          : [styles.content, { paddingBottom: space.md + bottomInset }]
      }
      keyboardShouldPersistTaps="handled"
      ListEmptyComponent={<EmptyState theme={theme} />}
      renderItem={({ item, index }) => {
        const isNew = !seen.current.has(item.id);
        seen.current.add(item.id);
        return (
          <ScoreRow
            theme={theme}
            row={item}
            hand={index + 1}
            teamName={state.teams[item.team].name}
            latest={item.id === lastId}
            selected={item.id === selected}
            animateIn={isNew && !reduceMotion}
            onSelect={() => setSelected(item.id)}
            onKeep={() => setSelected(null)}
            onDelete={() => onDelete(item, index)}
          />
        );
      }}
    />
  );
}

function EmptyState({ theme }: { theme: Theme }) {
  return (
    <View style={styles.empty}>
      <Slashes color={theme.line} size={22} />
      <Text maxFontSizeMultiplier={TEXT_SCALE} style={[styles.emptyTitle, { color: theme.text }]}>
        {copy.list.emptyTitle}
      </Text>
      <Text maxFontSizeMultiplier={TEXT_SCALE} style={[styles.emptyBody, { color: theme.textMuted }]}>
        {copy.list.emptyBody}
      </Text>
    </View>
  );
}

type ScoreRowProps = {
  theme: Theme;
  row: Row;
  hand: number;
  teamName: string;
  latest: boolean;
  selected: boolean;
  animateIn: boolean;
  onSelect: () => void;
  onKeep: () => void;
  onDelete: () => void;
};

function ScoreRow({
  theme,
  row,
  hand,
  teamName,
  latest,
  selected,
  animateIn,
  onSelect,
  onKeep,
  onDelete,
}: ScoreRowProps) {
  const enter = useRef(new Animated.Value(animateIn ? 0 : 1)).current;

  useEffect(() => {
    if (!animateIn) return;
    Animated.timing(enter, {
      toValue: 1,
      duration: motion.enter,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
  }, [animateIn, enter]);

  const from = row.team === 'a' ? -56 : 56;
  const handLabel = String(hand).padStart(2, '0');
  const transform = [
    { translateX: enter.interpolate({ inputRange: [0, 1], outputRange: [from, 0] }) },
  ];

  if (selected) {
    return (
      <Animated.View style={[styles.row, styles.selected, { transform }]}>
        <Text maxFontSizeMultiplier={TEXT_SCALE} style={[styles.selectedHand, { color: theme.text }]}>
          {handLabel}
        </Text>
        <SlabButton
          theme={theme}
          size="compact"
          label={copy.list.keep}
          onPress={onKeep}
          style={styles.selectedAction}
        />
        <SlabButton
          theme={theme}
          size="compact"
          label={copy.list.delete}
          accessibilityLabel={copy.list.deleteA11y(hand)}
          color={theme.danger}
          textColor={theme.onDanger}
          onPress={onDelete}
          style={styles.selectedAction}
        />
      </Animated.View>
    );
  }

  return (
    <Animated.View style={{ transform }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={copy.list.rowA11y(hand, teamName, row.points)}
        accessibilityHint={copy.list.rowHint}
        onPress={onSelect}
        style={styles.row}
      >
        {({ pressed }) => (
          <>
            <Lean
              color={latest ? theme.surfaceRaised : theme.surface}
              opacity={pressed ? PRESSED_OPACITY : 1}
            />
            <Cell theme={theme} team="a" row={row} />
            <Text
              maxFontSizeMultiplier={TEXT_SCALE}
              style={[
                styles.hand,
                latest
                  ? { color: theme.text, fontFamily: fonts.display }
                  : { color: theme.textMuted },
              ]}
            >
              {handLabel}
            </Text>
            <Cell theme={theme} team="b" row={row} />
          </>
        )}
      </Pressable>
    </Animated.View>
  );
}

function Cell({ theme, team, row }: { theme: Theme; team: TeamId; row: Row }) {
  const scored = row.team === team;
  return (
    <View style={styles.cell}>
      {scored ? (
        <View style={styles.chip}>
          <Lean color={theme.team[team]} borderColor={theme.teamEdge} />
          <Text maxFontSizeMultiplier={TEXT_SCALE} style={[styles.points, { color: theme.ink }]}>
            {row.points}
          </Text>
        </View>
      ) : (
        <Text maxFontSizeMultiplier={TEXT_SCALE} style={[styles.zero, { color: theme.textMuted }]}>
          0
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  content: {
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    gap: space.sm,
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: space.xxl,
  },
  empty: {
    alignItems: 'flex-start',
    gap: space.sm,
  },
  emptyTitle: {
    fontFamily: fonts.display,
    fontSize: type.title,
    textTransform: 'uppercase',
    marginTop: space.sm,
  },
  emptyBody: {
    fontFamily: fonts.body,
    fontSize: type.body,
    lineHeight: type.body * 1.45,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: MIN_TARGET + 4,
  },
  selected: {
    gap: space.sm,
  },
  selectedHand: {
    width: 44,
    textAlign: 'center',
    fontFamily: fonts.display,
    fontSize: type.meta,
    fontVariant: ['tabular-nums'],
  },
  selectedAction: {
    flex: 1,
  },
  hand: {
    width: 44,
    textAlign: 'center',
    fontFamily: fonts.label,
    fontSize: type.label,
    fontVariant: ['tabular-nums'],
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chip: {
    minWidth: 64,
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
    alignItems: 'center',
  },
  points: {
    fontFamily: fonts.display,
    fontSize: type.button,
    fontVariant: ['tabular-nums'],
  },
  zero: {
    fontFamily: fonts.label,
    fontSize: type.button,
    fontVariant: ['tabular-nums'],
  },
});
