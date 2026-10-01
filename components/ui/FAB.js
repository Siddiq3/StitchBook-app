import { fonts } from "../../utils/theme";
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { colors123, SIZES, SHADOWS } from '../../utils/theme';

export default function FAB({ onPress, icon = 'plus', label = null }) {
  const isLabeled = !!label;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.fab, SHADOWS.colored(colors123.primary)]}
    >
      <View
        style={[
          styles.content,
          {
            borderRadius: isLabeled ? SIZES.radiusFull : 28,
            width: isLabeled ? 'auto' : 56,
            paddingHorizontal: isLabeled ? 20 : 0,
          },
        ]}
      >
          <MaterialCommunityIcons
            name={icon}
            size={24}
            color={colors123.surface}
          />
          {label && <Text style={styles.label}>{label}</Text>}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 26,
    right: 20,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 28,
    overflow: "hidden",
  },
  content: {
    height: 56,
    backgroundColor: colors123.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  label: {
    color: colors123.surface,
    fontFamily: fonts.semibold,
    fontSize: 15,
  },
});
