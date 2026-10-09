import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { MotiView } from "./AccessibleMotionView";
import { colors123, fonts, radius, SHADOWS, spacing } from "../utils/theme";

// The thing being made, filling in as the questions are answered: each answered
// row settles in with a tick, the current row is highlighted, later rows wait as
// faint placeholders. Used for the account card (sign-up) and the job-sheet
// header (shop setup), so the owner sees exactly what their answers become.
function Row({ row, index, current }) {
  const filled = Boolean(row.value);
  const active = index === current;
  return (
    <View style={[s.row, active && s.rowActive]}>
      <Ionicons name={row.icon} size={16} color={active ? colors123.primary : filled ? colors123.textSecondary : colors123.textDisabled} />
      {filled ? (
        <MotiView
          key={row.value}
          from={{ opacity: 0, translateY: 4 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 220 }}
          style={{ flex: 1, minWidth: 0 }}
        >
          <Text style={[s.value, row.big && s.valueBig]} numberOfLines={1}>{row.value}</Text>
        </MotiView>
      ) : (
        <View style={{ flex: 1 }}>
          {active ? <Text style={s.placeholder} numberOfLines={1}>{row.placeholder}</Text> : <View style={[s.bar, row.big && s.barBig]} />}
        </View>
      )}
      {filled && !active ? (
        <MotiView from={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 14, stiffness: 260 }}>
          <Ionicons name="checkmark-circle" size={18} color={colors123.success} />
        </MotiView>
      ) : null}
    </View>
  );
}

export default function FillCard({ icon, title, rows, current }) {
  return (
    <View style={s.card} accessible accessibilityLabel={rows.filter((r) => r.value).map((r) => r.value).join(", ") || title}>
      <View style={s.head}>
        <View style={s.headIcon}><Ionicons name={icon} size={16} color={colors123.surface} /></View>
        <Text style={s.title} numberOfLines={1}>{title}</Text>
      </View>
      <View style={s.rows}>
        {rows.map((row, index) => <Row key={row.key} row={row} index={index} current={current} />)}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: { borderRadius: radius.lg, backgroundColor: colors123.surface, borderWidth: 1, borderColor: colors123.borderSubtle, padding: spacing.md, gap: spacing.sm, ...SHADOWS.md },
  head: { flexDirection: "row", alignItems: "center", gap: spacing.xs, paddingBottom: spacing.xs, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors123.border },
  headIcon: { width: 26, height: 26, borderRadius: 8, alignItems: "center", justifyContent: "center", backgroundColor: colors123.primary },
  title: { flex: 1, fontFamily: fonts.semibold, fontSize: 13, color: colors123.textSecondary },
  rows: { gap: 4 },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.xs, minHeight: 34, paddingHorizontal: spacing.xs, borderRadius: 10 },
  rowActive: { backgroundColor: colors123.primarySoft },
  value: { fontFamily: fonts.semibold, fontSize: 14, color: colors123.text },
  valueBig: { fontFamily: fonts.bold, fontSize: 18 },
  placeholder: { fontFamily: fonts.medium, fontSize: 14, color: colors123.primary },
  bar: { height: 8, width: "55%", borderRadius: 4, backgroundColor: colors123.surfaceMuted },
  barBig: { height: 12, width: "70%" },
});
