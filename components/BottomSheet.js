import React, { useEffect, useRef } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useReducedMotion } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { colors123, fonts, radius, shadows, spacing } from "../utils/theme";

export default function BottomSheet({
  visible,
  title,
  subtitle,
  children,
  onClose,
  scrollRef,
}) {
  const reducedMotion = useReducedMotion();
  const translateY = useRef(new Animated.Value(420)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reducedMotion) {
      opacity.setValue(visible ? 1 : 0);
      translateY.setValue(visible ? 0 : 420);
      return;
    }
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          damping: 22,
          stiffness: 180,
          mass: 0.9,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      translateY.setValue(420);
      opacity.setValue(0);
    }
  }, [opacity, translateY, visible, reducedMotion]);

  return (
    <Modal
      animationType="none"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <Pressable onPress={onClose} style={styles.flex}>
          <Animated.View style={[styles.overlay, { opacity }]} />
        </Pressable>
        <Animated.View
          style={[
            styles.sheet,
            {
              transform: [{ translateY }],
            },
          ]}
        >
          <SafeAreaView edges={["bottom"]} style={{ flexShrink: 1 }}>
            <View style={styles.grabber} />
            <View style={styles.header}>
              <View style={styles.headerCopy}>
                <Text style={styles.title}>{title}</Text>
                {subtitle ? (
                  <Text style={styles.subtitle}>{subtitle}</Text>
                ) : null}
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={onClose} style={styles.closeButton}>
                <MaterialCommunityIcons
                  color={colors123.textMuted}
                  name="close"
                  size={20}
                />
              </Pressable>
            </View>
            <ScrollView
              ref={scrollRef}
              contentContainerStyle={styles.content}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {children}
            </ScrollView>
          </SafeAreaView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    justifyContent: "flex-end",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors123.overlay,
  },
  sheet: {
    backgroundColor: colors123.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: "90%",
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
    ...shadows.floating,
    borderWidth: 1,
    borderColor: colors123.border,
  },
  grabber: {
    width: 36,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors123.borderStrong,
    alignSelf: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  headerCopy: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors123.text,
  },
  subtitle: {
    marginTop: 4,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors123.textMuted,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors123.surfaceMuted,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
});
