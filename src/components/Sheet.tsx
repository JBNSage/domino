import { ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Theme, space, useReduceMotion } from '../theme';
import { Slashes } from './Slab';

type SheetProps = {
  theme: Theme;
  visible: boolean;
  accent: string;
  onClose: () => void;
  onShow?: () => void;
  children: ReactNode;
};

/** Bottom sheet for one short task. System Back and a tap outside both close it. */
export function Sheet({ theme, visible, accent, onClose, onShow, children }: SheetProps) {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReduceMotion();

  return (
    <Modal
      visible={visible}
      transparent
      animationType={reduceMotion ? 'none' : 'slide'}
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
      onShow={onShow}
    >
      <KeyboardAvoidingView behavior="padding" style={styles.root}>
        {/* Screen readers use the sheet's own Cancel; the backdrop is a touch shortcut only. */}
        <Pressable
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          onPress={onClose}
          style={[styles.scrim, { backgroundColor: theme.scrim }]}
        />
        <View
          accessibilityViewIsModal
          style={[
            styles.panel,
            { backgroundColor: theme.ground, paddingTop: insets.top > 0 ? space.xl : space.lg },
          ]}
        >
          <ScrollView
            bounces={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[
              styles.content,
              { paddingBottom: Math.max(insets.bottom, space.lg) },
            ]}
          >
            <Slashes color={accent} size={18} />
            {children}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  scrim: {
    ...StyleSheet.absoluteFill,
  },
  panel: {
    maxHeight: '90%',
  },
  content: {
    paddingHorizontal: space.xl,
    gap: space.lg,
  },
});
