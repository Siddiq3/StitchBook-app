import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { colors123, fonts, radius, SHADOWS, spacing } from "../utils/theme";

// Get-started hero: one order card that cycles through the garments a tailor makes,
// with two tilted cards behind it. Before reading a word, the owner sees "this is for
// a shop like mine". Only transforms and opacity animate, so it never blocks the buttons.
const ORDERS = [
  { garment: "Blouse", glyph: "👚", tint: "#EDE7FF", customer: "Lakshmi", status: "Stitching", due: "Fri" },
  { garment: "Kurta", glyph: "👔", tint: "#FFE9DC", customer: "Ravi", status: "Cutting", due: "Mon" },
  { garment: "Lehenga", glyph: "👗", tint: "#FFE4EC", customer: "Priya", status: "Ready", due: "Today" },
  { garment: "Saree fall", glyph: "🥻", tint: "#FFF4CC", customer: "Anitha", status: "Pending", due: "Wed" },
  { garment: "Sherwani", glyph: "🧥", tint: "#DDF5EA", customer: "Imran", status: "Stitching", due: "Sat" },
  { garment: "Trousers", glyph: "👖", tint: "#DDEEFF", customer: "Kiran", status: "Ready", due: "Tue" },
];
const STEPS = ["Cutting", "Stitching", "Ready"];
const DWELL = 2600;

export default function HeroShowcase() {
  const reducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const order = ORDERS[index];
  const behindA = ORDERS[(index + 1) % ORDERS.length];
  const behindB = ORDERS[(index + 2) % ORDERS.length];

  useEffect(() => {
    if (reducedMotion) return undefined;
    const timer = setInterval(() => setIndex((i) => (i + 1) % ORDERS.length), DWELL);
    return () => clearInterval(timer);
  }, [reducedMotion]);

  const turn = useSharedValue(1);
  useEffect(() => {
    turn.value = 0;
    turn.value = withTiming(1, { duration: 460, easing: Easing.out(Easing.cubic) });
  }, [index, turn]);

  const drift = useSharedValue(0);
  useEffect(() => {
    if (reducedMotion) return;
    drift.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 3000, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    );
  }, [drift, reducedMotion]);

  const stackStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(drift.value, [0, 1], [-5, 5]) }],
  }));
  const faceStyle = useAnimatedStyle(() => ({
    opacity: turn.value,
    transform: [{ translateY: interpolate(turn.value, [0, 1], [10, 0]) }],
  }));

  const reached = STEPS.indexOf(order.status);

  return (
    <View style={styles.stage} pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Animated.View style={[styles.stack, stackStyle]}>
        <View style={[styles.card, styles.behind, styles.behindTwo, { backgroundColor: behindB.tint }]} />
        <View style={[styles.card, styles.behind, styles.behindOne, { backgroundColor: behindA.tint }]} />

        <View style={styles.card}>
          <Animated.View style={[styles.face, faceStyle]}>
            <View style={[styles.hero, { backgroundColor: order.tint }]}>
              <Text style={styles.heroGlyph}>{order.glyph}</Text>
              <View style={styles.due}>
                <Text style={styles.dueText}>Due {order.due}</Text>
              </View>
            </View>
            <Text style={styles.garment} numberOfLines={1}>{order.garment}</Text>
            <Text style={styles.customer} numberOfLines={1}>for {order.customer}</Text>
            <View style={styles.steps}>
              {STEPS.map((step, i) => (
                <View key={step} style={[styles.step, i <= reached && styles.stepDone]}>
                  <Text style={[styles.stepText, i <= reached && styles.stepTextDone]}>{step}</Text>
                </View>
              ))}
            </View>
          </Animated.View>
        </View>
      </Animated.View>
    </View>
  );
}

const CARD_W = 232;
const CARD_H = 272;

const styles = StyleSheet.create({
  stage: { height: CARD_H + 44, alignItems: "center", justifyContent: "center" },
  stack: { width: CARD_W, height: CARD_H, alignItems: "center", justifyContent: "center" },
  card: {
    position: "absolute",
    width: CARD_W,
    height: CARD_H,
    borderRadius: radius.xl,
    backgroundColor: colors123.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors123.borderLight,
    padding: spacing.md,
    ...SHADOWS.lg,
    shadowOpacity: 0.1,
  },
  behind: { ...SHADOWS.sm },
  behindOne: { transform: [{ rotate: "6deg" }, { translateX: 16 }, { scale: 0.96 }] },
  behindTwo: { transform: [{ rotate: "-7deg" }, { translateX: -16 }, { scale: 0.92 }] },
  face: { flex: 1 },
  hero: { flex: 1, borderRadius: radius.lg, alignItems: "center", justifyContent: "center" },
  heroGlyph: { fontSize: 72, lineHeight: 88 },
  due: {
    position: "absolute",
    top: 10,
    right: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.85)",
  },
  dueText: { fontFamily: fonts.semibold, fontSize: 11, color: colors123.text },
  garment: { marginTop: spacing.sm, fontFamily: fonts.bold, fontSize: 19, color: colors123.text },
  customer: { fontFamily: fonts.regular, fontSize: 13, color: colors123.textMuted },
  steps: { flexDirection: "row", gap: 6, marginTop: spacing.sm },
  step: { flex: 1, paddingVertical: 5, borderRadius: radius.pill, alignItems: "center", backgroundColor: colors123.surfaceMuted },
  stepDone: { backgroundColor: colors123.primarySoft },
  stepText: { fontFamily: fonts.medium, fontSize: 10.5, color: colors123.textMuted },
  stepTextDone: { color: colors123.primary, fontFamily: fonts.semibold },
});
