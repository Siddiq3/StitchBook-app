import React, { useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useReducedMotion } from "react-native-reanimated";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { colors123, fonts, radius, SHADOWS, spacing, typography } from "../utils/theme";

// What StitchBook does, one feature per slide. Each illustration is built from the
// app's own pieces (order steps, measurement chips, staff rows, a WhatsApp update),
// so the first screen already looks like the product. Auto-advances until touched.
const ADVANCE_MS = 3800;

function Panel({ tint, children }) {
  return <View style={[styles.panel, { backgroundColor: tint }]}>{children}</View>;
}

function OrdersArt({ t }) {
  const steps = [t("cutting"), t("stitching"), t("ready")];
  return (
    <Panel tint="#EAF4FF">
      <View style={styles.paper}>
        <View style={styles.rowBetween}>
          <View style={styles.row}>
            <View style={[styles.dot, { backgroundColor: "#DDEEFF" }]}><Text style={styles.glyph}>👔</Text></View>
            <View>
              <Text style={styles.strong}>Shirt × 2</Text>
              <Text style={styles.muted}>Rahul</Text>
            </View>
          </View>
          <View style={styles.dueChip}><Text style={styles.dueText}>Fri</Text></View>
        </View>
        <View style={styles.timeline}>
          {steps.map((label, i) => (
            <View key={label} style={styles.timelineStep}>
              <View style={[styles.node, i < 2 && styles.nodeDone]}>
                {i < 2 ? <MaterialCommunityIcons name={i === 0 ? "check" : "needle"} size={12} color={colors123.surface} /> : null}
              </View>
              <Text style={[styles.stepText, i < 2 && styles.stepTextDone]} numberOfLines={1}>{label}</Text>
              {i < steps.length - 1 ? <View style={[styles.connector, i < 1 && styles.connectorDone]} /> : null}
            </View>
          ))}
        </View>
      </View>
    </Panel>
  );
}

function MeasureArt() {
  const sizes = [["Chest", "36"], ["Waist", "30"], ["Shoulder", "14.5"], ["Length", "40"]];
  return (
    <Panel tint="#FFF4DD">
      <View style={styles.tape}>
        {Array.from({ length: 18 }).map((_, i) => <View key={i} style={[styles.tick, i % 3 === 0 && styles.tickLong]} />)}
      </View>
      <View style={styles.chips}>
        {sizes.map(([label, value]) => (
          <View key={label} style={styles.sizeChip}>
            <Text style={styles.sizeLabel}>{label}</Text>
            <Text style={styles.sizeValue}>{value}<Text style={styles.unit}> in</Text></Text>
          </View>
        ))}
      </View>
    </Panel>
  );
}

function StaffArt({ t }) {
  const staff = [
    { name: "Anil", task: t("stitching"), count: 3, tint: "#DDF5EA", color: "#147A48" },
    { name: "Sita", task: t("cutting"), count: 2, tint: "#FFE9DC", color: "#9A5A08" },
  ];
  return (
    <Panel tint="#E9F7F0">
      <View style={styles.paper}>
        {staff.map((person) => (
          <View key={person.name} style={[styles.rowBetween, styles.staffRow]}>
            <View style={styles.row}>
              <View style={[styles.avatar, { backgroundColor: person.tint }]}>
                <Text style={[styles.avatarText, { color: person.color }]}>{person.name[0]}</Text>
              </View>
              <View>
                <Text style={styles.strong}>{person.name}</Text>
                <Text style={styles.muted}>{person.task}</Text>
              </View>
            </View>
            <Text style={styles.countPill}>{person.count} {t("welcomeItems")}</Text>
          </View>
        ))}
        <View style={styles.earned}>
          <Text style={styles.muted}>{t("thisMonthPay")}</Text>
          <Text style={styles.money}>₹12,000</Text>
        </View>
      </View>
    </Panel>
  );
}

function PayArt({ t }) {
  return (
    <Panel tint="#E8F8EE">
      <View style={styles.paper}>
        <View style={styles.rowBetween}>
          <Text style={styles.muted}>{t("paid")}</Text>
          <Text style={styles.strong}>₹500</Text>
        </View>
        <View style={[styles.rowBetween, { marginTop: 6 }]}>
          <Text style={styles.muted}>{t("balance")}</Text>
          <Text style={[styles.money, { color: colors123.warning }]}>₹1,300</Text>
        </View>
      </View>
      <View style={styles.bubble}>
        <MaterialCommunityIcons name="whatsapp" size={18} color="#128C4A" />
        <Text style={styles.bubbleText} numberOfLines={2}>{t("welcomeReadyMessage")} 🧵</Text>
      </View>
    </Panel>
  );
}

export default function FeatureSlides({ t }) {
  const { width } = useWindowDimensions();
  const reducedMotion = useReducedMotion();
  const scroller = useRef(null);
  const [index, setIndex] = useState(0);
  const [touched, setTouched] = useState(false);

  const slides = [
    { key: "orders", Art: OrdersArt, title: t("welcomeOrdersTitle"), body: t("welcomeOrdersBody") },
    { key: "measure", Art: MeasureArt, title: t("welcomeMeasureTitle"), body: t("welcomeMeasureBody") },
    { key: "staff", Art: StaffArt, title: t("welcomeStaffTitle"), body: t("welcomeStaffBody") },
    { key: "pay", Art: PayArt, title: t("welcomePayTitle"), body: t("welcomePayBody") },
  ];

  useEffect(() => {
    if (reducedMotion || touched) return undefined;
    const timer = setInterval(() => {
      setIndex((current) => {
        const next = (current + 1) % slides.length;
        scroller.current?.scrollTo({ x: next * width, animated: true });
        return next;
      });
    }, ADVANCE_MS);
    return () => clearInterval(timer);
  }, [reducedMotion, touched, width, slides.length]);

  return (
    <View>
      <ScrollView
        ref={scroller}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScrollBeginDrag={() => setTouched(true)}
        onMomentumScrollEnd={(event) => setIndex(Math.round(event.nativeEvent.contentOffset.x / width))}
      >
        {slides.map(({ key, Art, title, body }) => (
          <View key={key} style={[styles.slide, { width }]} accessible accessibilityLabel={`${title}. ${body}`}>
            <View importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
              <Art t={t} />
            </View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.body}>{body}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.dots}>
        {slides.map((slide, i) => <View key={slide.key} style={[styles.pageDot, i === index && styles.pageDotActive]} />)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  slide: { paddingHorizontal: 24 },
  panel: { height: 230, borderRadius: radius.xl, padding: spacing.lg, justifyContent: "center", gap: spacing.sm },
  paper: { backgroundColor: colors123.surface, borderRadius: radius.lg, padding: spacing.md, ...SHADOWS.md },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  dot: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  glyph: { fontSize: 22 },
  strong: { fontFamily: fonts.semibold, fontSize: 15, color: colors123.text },
  muted: { fontFamily: fonts.regular, fontSize: 12.5, color: colors123.textMuted },
  dueChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: colors123.warningLight },
  dueText: { fontFamily: fonts.semibold, fontSize: 12, color: colors123.warning },
  timeline: { flexDirection: "row", marginTop: spacing.md },
  timelineStep: { flex: 1, alignItems: "center" },
  node: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center", backgroundColor: colors123.borderLight, zIndex: 1 },
  nodeDone: { backgroundColor: colors123.primary },
  connector: { position: "absolute", top: 10, left: "60%", right: "-40%", height: 2, backgroundColor: colors123.borderLight },
  connectorDone: { backgroundColor: colors123.primary },
  stepText: { marginTop: 6, fontFamily: fonts.medium, fontSize: 11, color: colors123.textMuted },
  stepTextDone: { color: colors123.primary, fontFamily: fonts.semibold },
  tape: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", height: 26, paddingHorizontal: 6, borderRadius: 6, backgroundColor: "#F5C451" },
  tick: { width: 1.5, height: 8, backgroundColor: "rgba(0,0,0,0.45)" },
  tickLong: { height: 14 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  sizeChip: { flexBasis: "47%", flexGrow: 1, backgroundColor: colors123.surface, borderRadius: radius.md, paddingVertical: 8, paddingHorizontal: 12, ...SHADOWS.sm },
  sizeLabel: { fontFamily: fonts.regular, fontSize: 12, color: colors123.textMuted },
  sizeValue: { fontFamily: fonts.bold, fontSize: 18, color: colors123.text },
  unit: { fontFamily: fonts.regular, fontSize: 12, color: colors123.textMuted },
  staffRow: { paddingVertical: 6 },
  avatar: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  avatarText: { fontFamily: fonts.bold, fontSize: 14 },
  countPill: { fontFamily: fonts.semibold, fontSize: 12, color: colors123.primary, backgroundColor: colors123.primarySoft, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, overflow: "hidden" },
  earned: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 6, paddingTop: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors123.border },
  money: { fontFamily: fonts.bold, fontSize: 17, color: colors123.text },
  bubble: { flexDirection: "row", alignItems: "center", gap: spacing.xs, alignSelf: "flex-end", maxWidth: "92%", backgroundColor: "#DCF8C6", borderRadius: radius.lg, borderBottomRightRadius: 4, paddingHorizontal: 12, paddingVertical: 8, ...SHADOWS.sm },
  bubbleText: { flexShrink: 1, fontFamily: fonts.medium, fontSize: 13, color: "#1F2C24" },
  title: { marginTop: spacing.lg, fontFamily: fonts.bold, fontSize: 24, lineHeight: 31, letterSpacing: -0.4, color: colors123.text },
  body: { ...typography.body, marginTop: 6, color: colors123.textSecondary },
  dots: { flexDirection: "row", gap: 6, paddingHorizontal: 24, marginTop: spacing.md },
  pageDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors123.borderLight },
  pageDotActive: { width: 22, backgroundColor: colors123.primary },
});
