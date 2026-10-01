import { fonts } from "../utils/theme";
import React, { useMemo } from "react";
import { StyleSheet, View, Text } from "react-native";
import Svg, { G, Circle, Ellipse, Path, Line, Defs, Stop } from "react-native-svg";
import { useLanguage } from "../context/LanguageContext";
import { colors123, spacing } from "../utils/theme";

// Body zones mapping: field name to SVG coordinates and zone info
const BODY_ZONES_UPPER = {
  'Neck': { x: 100, y: 40, rx: 15, ry: 20, labelKey: 'neck' },
  'Shoulder Width': { x: 100, y: 60, rx: 35, ry: 15, labelKey: 'shoulders' },
  'Chest': { x: 100, y: 100, rx: 40, ry: 35, labelKey: 'chest' },
  'Arm Hole': { x: 100, y: 95, rx: 20, ry: 25, labelKey: 'armHole' },
  'Waist': { x: 100, y: 150, rx: 35, ry: 25, labelKey: 'waist' },
  'Hip Circumference': { x: 100, y: 190, rx: 40, ry: 30, labelKey: 'hips' },
  'Sleeve Length': { x: 50, y: 120, rx: 15, ry: 60, labelKey: 'sleeve' },
  'Wrist Circumference': { x: 50, y: 180, rx: 12, ry: 15, labelKey: 'wrist' },
  'Back Length': { x: 130, y: 140, rx: 10, ry: 40, labelKey: 'backLabel' },
};

const BODY_ZONES_LOWER = {
  'Length': { x: 100, y: 100, rx: 20, ry: 80, labelKey: 'length' },
  'Waist': { x: 100, y: 30, rx: 35, ry: 20, labelKey: 'waist' },
  'Hip': { x: 100, y: 70, rx: 40, ry: 25, labelKey: 'hip' },
  'Thigh Circumference': { x: 100, y: 110, rx: 38, ry: 25, labelKey: 'thigh' },
  'Knee Circumference': { x: 100, y: 160, rx: 32, ry: 20, labelKey: 'knee' },
  'Ankle Circumference': { x: 100, y: 200, rx: 25, ry: 15, labelKey: 'ankle' },
};

const BODY_ZONES_FULL = {
  ...BODY_ZONES_UPPER,
  ...BODY_ZONES_LOWER,
};

export default function BodyDiagram({
  outfitType = 'upper',
  focusedField = null,
  gender = 'male',
  compact = false,
}) {
  const { t } = useLanguage();

  // Select body zones based on outfit type
  const bodyZones = useMemo(() => {
    switch (outfitType) {
      case 'lower':
        return BODY_ZONES_LOWER;
      case 'full':
        return BODY_ZONES_FULL;
      case 'upper':
      default:
        return BODY_ZONES_UPPER;
    }
  }, [outfitType]);

  // SVG viewBox based on outfit type
  const viewBox = outfitType === 'lower' ? '0 0 200 260' : '0 0 200 280';
  const svgHeight = compact ? (outfitType === 'lower' ? 230 : 260) : (outfitType === 'lower' ? 280 : 320);

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      <Text style={[styles.title, compact && styles.titleCompact]}>{t("bodyDiagram")}</Text>
      <View style={styles.diagram}>
        <Svg height={svgHeight} width="100%" viewBox={viewBox}>
          <Defs>
            <View id="skinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#F5DEB3" stopOpacity="1" />
              <Stop offset="100%" stopColor="#D2B48C" stopOpacity="1" />
            </View>
            <View id="focusGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={colors123.primary} stopOpacity="0.3" />
              <Stop offset="100%" stopColor={colors123.primary} stopOpacity="0.1" />
            </View>
          </Defs>

          {/* Draw body silhouette */}
          {outfitType !== 'lower' && (
            <G>
              {/* Head */}
              <Circle cx="100" cy="30" r="20" fill="url(#skinGradient)" stroke={colors123.border} strokeWidth="1" />
              {/* Neck */}
              <Path d="M 90 50 L 85 65 L 115 65 L 110 50 Z" fill="url(#skinGradient)" stroke={colors123.border} strokeWidth="1" />
            </G>
          )}

          {/* Torso/Upper body */}
          {outfitType !== 'lower' && (
            <Ellipse
              cx="100"
              cy="110"
              rx="40"
              ry="50"
              fill="url(#skinGradient)"
              stroke={colors123.border}
              strokeWidth="1"
            />
          )}

          {/* Arms */}
          {outfitType !== 'lower' && (
            <G>
              <Path d="M 60 90 Q 40 100 35 140" stroke="url(#skinGradient)" strokeWidth="20" fill="none" />
              <Path d="M 140 90 Q 160 100 165 140" stroke="url(#skinGradient)" strokeWidth="20" fill="none" />
            </G>
          )}

          {/* Lower body / Legs */}
          {outfitType !== 'upper' && (
            <G>
              {/* Left leg */}
              <Path d="M 85 160 L 80 240" stroke="url(#skinGradient)" strokeWidth="18" fill="none" strokeLinecap="round" />
              {/* Right leg */}
              <Path d="M 115 160 L 120 240" stroke="url(#skinGradient)" strokeWidth="18" fill="none" strokeLinecap="round" />
            </G>
          )}

          {/* Highlighted zones */}
          {Object.entries(bodyZones).map(([fieldName, zone]) => {
            const isFocused = focusedField === fieldName;

            return (
              <G key={fieldName}>
                {isFocused && (
                  <>
                    {/* Dashed border highlight */}
                    <Ellipse
                      cx={zone.x}
                      cy={zone.y}
                      rx={zone.rx + 8}
                      ry={zone.ry + 8}
                      fill="url(#focusGradient)"
                      stroke={colors123.primary}
                      strokeWidth="2"
                      strokeDasharray="5,3"
                    />
                    {/* Label line */}
                    <Line
                      x1={zone.x + zone.rx + 10}
                      y1={zone.y}
                      x2={zone.x + zone.rx + 30}
                      y2={zone.y}
                      stroke={colors123.primary}
                      strokeWidth="1"
                      strokeDasharray="2,2"
                    />
                  </>
                )}

                {/* Zone indicator circle */}
                <Circle
                  cx={zone.x}
                  cy={zone.y}
                  r={4}
                  fill={isFocused ? colors123.primary : colors123.textMuted}
                  opacity={isFocused ? 1 : 0.5}
                />
              </G>
            );
          })}
        </Svg>
      </View>

      {/* Legend */}
      {focusedField && bodyZones[focusedField] && (
        <View style={styles.legend}>
          <View style={styles.legendDot} />
          <Text style={styles.legendText}>{t(bodyZones[focusedField].labelKey)}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    backgroundColor: colors123.surfaceMuted,
    borderRadius: 12,
  },
  containerCompact: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  title: {
    fontSize: 14,
    fontFamily: fonts.semibold,
    color: colors123.text,
    marginBottom: spacing.md,
  },
  titleCompact: {
    fontSize: 12,
    marginBottom: spacing.xs,
  },
  diagram: {
    alignItems: "center",
    backgroundColor: colors123.surface,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors123.border,
  },
  legend: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors123.primary,
    marginRight: spacing.sm,
  },
  legendText: {
    fontSize: 13,
    color: colors123.text,
    fontFamily: fonts.medium,
  },
});
