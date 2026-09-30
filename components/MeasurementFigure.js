import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors123, fonts, radius } from "../utils/theme";
import { useLanguage } from "../context/LanguageContext";

const pinConfig = [
  { key: "neck", labelKey: "neck", top: 10, left: 104 },
  { key: "shoulder", labelKey: "shoulder", top: 42, right: 6 },
  { key: "chest", labelKey: "chest", top: 84, left: 8 },
  { key: "sleeve", labelKey: "sleeve", top: 104, right: 0 },
  { key: "waist", labelKey: "waist", top: 146, left: 12 },
  { key: "hips", labelKey: "hips", top: 184, right: 16 },
  { key: "length", labelKey: "length", top: 236, left: 28 },
  { key: "blouseLength", labelKey: "blouse", top: 236, right: 18 },
];

function formatValue(value, t) {
  if (!value && value !== 0) {
    return t("addMeasurementValue");
  }
  return `${value}"`;
}

function getMeasurementValue(values, key, translatedLabel) {
  if (!values) return undefined;
  const direct = values[key];
  if (direct || direct === 0) return direct;

  const normalizedKey = String(key).toLowerCase().replace(/[^a-z0-9]/g, "");
  const normalizedLabel = String(translatedLabel || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const match = Object.entries(values).find(([fieldKey]) => {
    const normalizedField = String(fieldKey).toLowerCase().replace(/[^a-z0-9]/g, "");
    return normalizedField === normalizedKey || normalizedField === normalizedLabel;
  });

  return match?.[1];
}

export default function MeasurementFigure({ values = {}, compact = false }) {
  const { t } = useLanguage();
  return (
    <View style={[styles.stage, compact && styles.stageCompact]}>
      <View style={[styles.figureBase, compact && styles.figureBaseCompact]}>
        <View style={styles.head} />
        <View style={styles.neck} />
        <View style={styles.shoulders} />
        <View style={styles.leftArm} />
        <View style={styles.rightArm} />
        <View style={styles.torso} />
        <View style={styles.waistBand} />
        <View style={styles.hipBand} />
        <View style={styles.leftSkirt} />
        <View style={styles.rightSkirt} />
        <View style={styles.centerLine} />
      </View>

      {pinConfig.map((pin) => {
        const label = t(pin.labelKey);
        const value = getMeasurementValue(values, pin.key, label);
        const hasValue = value || value === 0;
        return (
          <View
            key={pin.key}
            style={[
              styles.pin,
              pin.left !== undefined
                ? { left: pin.left }
                : { right: pin.right },
              { top: pin.top },
              hasValue ? styles.pinActive : styles.pinMuted,
            ]}
          >
            <Text style={[styles.pinLabel, hasValue && styles.pinLabelActive]}>
              {label}
            </Text>
            <Text style={[styles.pinValue, hasValue && styles.pinValueActive]}>
              {formatValue(value, t)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    height: 320,
    justifyContent: "center",
    position: "relative",
    overflow: "visible",
  },
  stageCompact: {
    height: 238,
  },
  figureBase: {
    width: 140,
    height: 268,
    alignSelf: "center",
    position: "relative",
  },
  figureBaseCompact: {
    transform: [{ scale: 0.82 }],
  },
  head: {
    position: "absolute",
    top: 0,
    left: 48,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors123.warningLight,
    borderWidth: 2,
    borderColor: colors123.surface,
  },
  neck: {
    position: "absolute",
    top: 40,
    left: 62,
    width: 16,
    height: 16,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    backgroundColor: colors123.warningLight,
  },
  shoulders: {
    position: "absolute",
    top: 52,
    left: 18,
    width: 104,
    height: 28,
    borderRadius: 16,
    backgroundColor: colors123.primary,
  },
  leftArm: {
    position: "absolute",
    top: 76,
    left: 8,
    width: 14,
    height: 78,
    borderRadius: 10,
    backgroundColor: colors123.infoLight,
    transform: [{ rotate: "10deg" }],
  },
  rightArm: {
    position: "absolute",
    top: 76,
    right: 8,
    width: 14,
    height: 78,
    borderRadius: 10,
    backgroundColor: colors123.infoLight,
    transform: [{ rotate: "-10deg" }],
  },
  torso: {
    position: "absolute",
    top: 70,
    left: 30,
    width: 80,
    height: 112,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    backgroundColor: colors123.primary,
  },
  waistBand: {
    position: "absolute",
    top: 132,
    left: 38,
    width: 64,
    height: 12,
    borderRadius: radius.pill,
    backgroundColor: colors123.surface,
    opacity: 0.9,
  },
  hipBand: {
    position: "absolute",
    top: 176,
    left: 30,
    width: 80,
    height: 12,
    borderRadius: radius.pill,
    backgroundColor: colors123.warningLight,
  },
  leftSkirt: {
    position: "absolute",
    top: 184,
    left: 24,
    width: 40,
    height: 86,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 10,
    backgroundColor: colors123.infoLight,
    transform: [{ skewX: "6deg" }],
  },
  rightSkirt: {
    position: "absolute",
    top: 184,
    right: 24,
    width: 40,
    height: 86,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 20,
    backgroundColor: colors123.infoLight,
    transform: [{ skewX: "-6deg" }],
  },
  centerLine: {
    position: "absolute",
    top: 80,
    left: 68,
    width: 4,
    height: 172,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.55)",
  },
  pin: {
    position: "absolute",
    minWidth: 76,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
  },
  pinActive: {
    backgroundColor: colors123.surface,
    borderColor: colors123.border,
  },
  pinMuted: {
    backgroundColor: colors123.background,
    borderColor: colors123.border,
  },
  pinLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors123.textSoft,
  },
  pinLabelActive: {
    color: colors123.primary,
  },
  pinValue: {
    marginTop: 2,
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors123.textMuted,
  },
  pinValueActive: {
    color: colors123.text,
  },
});
