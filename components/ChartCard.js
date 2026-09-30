import React from "react";
import { StyleSheet, Text, View } from "react-native";
import AppCard from "./AppCard";
import {
  colors123,
  fonts,
  formatCompactCurrency,
  radius,
  spacing } from
"../utils/theme";import { useLanguage } from "../context/LanguageContext";

export default function ChartCard({ title, subtitle, data }) {const { t } = useLanguage();
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <AppCard>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <View style={[styles.chart, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={styles.barLabel}>{t("auto_no_data_available")}</Text>
        </View>
      </AppCard>);

  }

  const peak = Math.max(...data.map((item) => item.value), 1);

  return (
    <AppCard>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      <View style={styles.chart}>
        {data.map((point) => {
          const height = Math.max(26, point.value / peak * 138);
          return (
            <View key={point.label} style={styles.barColumn}>
              <Text style={styles.barValue}>
                {formatCompactCurrency(point.value)}
              </Text>
              <View style={styles.barTrack}>
                <View style={[styles.bar, { height }]} />
              </View>
              <Text style={styles.barLabel}>{point.label}</Text>
            </View>);

        })}
      </View>
    </AppCard>);

}

const styles = StyleSheet.create({
  title: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors123.text
  },
  subtitle: {
    marginTop: spacing.xs,
    marginBottom: spacing.md,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors123.textMuted
  },
  chart: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: spacing.xs,
    paddingTop: spacing.sm
  },
  barColumn: {
    flex: 1,
    alignItems: "center",
    gap: spacing.xs
  },
  barValue: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: colors123.textSoft
  },
  barTrack: {
    width: "100%",
    height: 138,
    backgroundColor: colors123.backgroundAccent,
    borderRadius: radius.md,
    justifyContent: "flex-end",
    overflow: "hidden"
  },
  bar: {
    width: "100%",
    backgroundColor: colors123.accent,
    borderRadius: radius.md
  },
  barLabel: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors123.textMuted
  }
});
