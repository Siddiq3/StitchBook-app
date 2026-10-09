import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from "react-native-reanimated";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { colors123 } from "../utils/theme";

const STITCHES_PER_STEP = 6;

// Step progress drawn as a seam: finished steps are sewn in solid stitches, the
// rest are faint guide stitches, and a needle travels to the current step.
// Same motif as the splash loader, so first run reads as one stitched journey.
export default function StitchProgress({ step, total }) {
  const reduced = useReducedMotion();
  const [width, setWidth] = useState(0);
  const sewn = useSharedValue((step + 1) / total);

  useEffect(() => {
    sewn.value = withTiming((step + 1) / total, { duration: reduced ? 0 : 520, easing: Easing.out(Easing.cubic) });
  }, [step, total, reduced, sewn]);

  const sewnStyle = useAnimatedStyle(() => ({ width: sewn.value * width }));
  const needleStyle = useAnimatedStyle(() => ({ transform: [{ translateX: sewn.value * width - 9 }] }));
  const stitches = Array.from({ length: total * STITCHES_PER_STEP });

  return (
    <View
      style={s.wrap}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 1, max: total, now: step + 1 }}
    >
      <View style={s.row}>{stitches.map((_, i) => <View key={i} style={s.guide} />)}</View>
      <Animated.View style={[s.sewn, sewnStyle]}>
        <View style={[s.row, { width }]}>{stitches.map((_, i) => <View key={i} style={s.stitch} />)}</View>
      </Animated.View>
      {width > 0 ? (
        <Animated.View style={[s.needle, needleStyle]} pointerEvents="none">
          <MaterialCommunityIcons name="needle" size={18} color={colors123.text} style={{ transform: [{ rotate: "135deg" }] }} />
        </Animated.View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { height: 18, justifyContent: "center" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  guide: { width: 7, height: 2, borderRadius: 1, backgroundColor: "#CFE3FA" },
  stitch: { width: 7, height: 3, borderRadius: 1.5, backgroundColor: colors123.primary },
  sewn: { position: "absolute", left: 0, top: 0, bottom: 0, overflow: "hidden", justifyContent: "center" },
  needle: { position: "absolute", left: 0, top: -4 },
});
