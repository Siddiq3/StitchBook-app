import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors123, typography, spacing, radius } from '../../utils/theme';

export default function SectionHeader({ title, actionLabel, onAction }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {actionLabel && onAction ? (
        <Pressable accessibilityRole="button" onPress={onAction} style={({pressed})=>[styles.actionButton,pressed&&styles.pressed]}>
          <Text style={styles.action}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: spacing.sm, marginBottom: spacing.sm, marginTop: spacing.md },
  title: { ...typography.h3, color: colors123.text, flex: 1 },
  actionButton: { minHeight: 40, justifyContent: 'center', paddingHorizontal: spacing.xs, borderRadius: radius.sm },
  action: { ...typography.label, color: colors123.primary },
  pressed: { opacity: .8 },
});
