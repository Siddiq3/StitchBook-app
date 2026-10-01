import React from "react";
import { StyleSheet, View } from "react-native";
import { colors123, radius } from "../utils/theme";

export function SkeletonBlock({
  width = "100%",
  height = 16,
  borderRadius = radius.sm,
  style,
}) {

  return (
    <View
      style={[
        styles.base,
        {
          width,
          height,
          borderRadius,
        },
        style,
      ]}
    >

    </View>
  );
}

export function DashboardSkeleton() {
  return (
    <View style={{ gap: 16 }}>
      <SkeletonBlock height={92} borderRadius={radius.lg} />
      <View style={{ flexDirection: "row", gap: 12 }}>
        <SkeletonBlock style={{ flex: 1 }} height={116} borderRadius={radius.lg} />
        <SkeletonBlock style={{ flex: 1 }} height={116} borderRadius={radius.lg} />
      </View>
      <View style={{ flexDirection: "row", gap: 12 }}>
        <SkeletonBlock style={{ flex: 1 }} height={116} borderRadius={radius.lg} />
        <SkeletonBlock style={{ flex: 1 }} height={116} borderRadius={radius.lg} />
      </View>
      <SkeletonBlock height={210} borderRadius={radius.lg} />
      <SkeletonBlock height={178} borderRadius={radius.lg} />
    </View>
  );
}

export function ListSkeleton({ count = 4 }) {
  return (
    <View style={{ gap: 12 }}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.listItem}>
          <SkeletonBlock width={52} height={52} borderRadius={26} />
          <View style={{ flex: 1, gap: 8 }}>
            <SkeletonBlock width="58%" height={14} />
            <SkeletonBlock width="42%" height={12} />
            <SkeletonBlock width="72%" height={12} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: "hidden",
    backgroundColor: colors123.surfaceMuted,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: colors123.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors123.border,
    padding: 16,
  },
});
