import { StyleSheet, View } from 'react-native';

import { copy } from '../copy';
import { State, TEAM_IDS, TeamId } from '../game/state';
import { Theme, space } from '../theme';
import { SlabButton } from './Slab';

type QuickAddBarProps = {
  theme: Theme;
  state: State;
  onEnter: (team: TeamId) => void;
  onQuick: (team: TeamId) => void;
  onEditQuick: () => void;
};

/**
 * The thumb zone. Each team's column carries the every-hand action at the
 * bottom edge and the occasional bonus above it, so a stray touch while
 * picking the phone up opens a sheet instead of scoring.
 */
export function QuickAddBar({ theme, state, onEnter, onQuick, onEditQuick }: QuickAddBarProps) {
  return (
    <View style={[styles.bar, { borderTopColor: theme.line }]}>
      {TEAM_IDS.map((team) => {
        const name = state.teams[team].name;
        return (
          <View key={team} style={styles.column}>
            <SlabButton
              theme={theme}
              size="compact"
              label={copy.bar.quick(state.quickValue)}
              accessibilityLabel={copy.bar.quickA11y(state.quickValue, name)}
              accessibilityHint={copy.bar.quickHint}
              accessibilityActions={[
                { name: 'activate' },
                { name: 'longpress', label: copy.bar.quickEdit },
              ]}
              onAccessibilityAction={(event) => {
                if (event.nativeEvent.actionName === 'longpress') onEditQuick();
                else onQuick(team);
              }}
              onPress={() => onQuick(team)}
              onLongPress={onEditQuick}
            />
            <SlabButton
              theme={theme}
              label={copy.bar.enter}
              accessibilityLabel={copy.bar.enterA11y(name)}
              color={theme.team[team]}
              borderColor={theme.teamEdge}
              onPress={() => onEnter(team)}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    gap: space.xl,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: space.md,
    paddingHorizontal: space.xl,
  },
  column: {
    flex: 1,
    gap: space.sm,
  },
});
