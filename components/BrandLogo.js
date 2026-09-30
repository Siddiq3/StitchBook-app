import React from "react";
import Svg, { Path } from "react-native-svg";
import { View, Text, StyleSheet } from "react-native";
import { colors123, fonts, spacing } from "../utils/theme";

export function BrandMark({ size = 48, light = false }) {
  const bg = light ? colors123.surface : colors123.primary;
  const page = light ? colors123.primary : colors123.surface;

  return (
    <View style={[styles.markWrap, { width: size, height: size, borderRadius: size * 0.22, backgroundColor: bg }]}>
      <Svg width={size * 0.72} height={size * 0.72} viewBox="0 0 40 40">
        <Path
          d="M9 9.5c0-1.38 1.12-2.5 2.5-2.5H18c1.66 0 3 1.34 3 3v22c0-1.66-1.34-3-3-3h-6.5A2.5 2.5 0 0 1 9 26.5v-17Z"
          fill={page}
          opacity={0.94}
        />
        <Path
          d="M31 9.5c0-1.38-1.12-2.5-2.5-2.5H22c-1.66 0-3 1.34-3 3v22c0-1.66 1.34-3 3-3h6.5a2.5 2.5 0 0 0 2.5-2.5v-17Z"
          fill={page}
          opacity={0.72}
        />
        <Path d="M14 13.5c2.2 1.8 2.2 3.7 0 5.5 2.2 1.8 2.2 3.7 0 5.5" stroke={colors123.accent} strokeLinecap="round" strokeWidth="2.2" />
        <Path d="M26 13.5c-2.2 1.8-2.2 3.7 0 5.5-2.2 1.8-2.2 3.7 0 5.5" stroke={colors123.accent} strokeLinecap="round" strokeWidth="2.2" />
        <Path d="M20 9v23" stroke={bg} strokeLinecap="round" strokeWidth="1.6" />
      </Svg>
    </View>
  );
}

export default function BrandLogo({ light = false, subtitle }) {
  return (
    <View style={styles.row}>
      <BrandMark light={light} />
      <View>
        <Text style={[styles.title, light && styles.lightText]}>StitchBook</Text>
        {subtitle ? <Text style={[styles.subtitle, light && styles.lightMuted]}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  markWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: fonts.extrabold,
    fontSize: 20,
    color: colors123.text,
  },
  subtitle: {
    marginTop: 2,
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors123.textMuted,
  },
  lightText: {
    color: colors123.surface,
  },
  lightMuted: {
    color: "rgba(255,255,255,0.72)",
  },
});
