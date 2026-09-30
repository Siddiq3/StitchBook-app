import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors123, fonts, radius, shadows, spacing } from "../utils/theme";

const toneStyles = {
  success: {
    backgroundColor: colors123.success,
    icon: "check-circle",
  },
  error: {
    backgroundColor: colors123.danger,
    icon: "alert-circle",
  },
  info: {
    backgroundColor: colors123.primary,
    icon: "information",
  },
};

export default function ToastHost({ toast, onHide }) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(80)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const tone = toneStyles[toast.tone] || toneStyles.success;

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 16,
        stiffness: 160,
      }),
    ]).start();

    const timeout = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 50,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start(onHide);
    }, 2600);

    return () => clearTimeout(timeout);
  }, [onHide, opacity, toast, translateY]);

  if (!toast) {
    return null;
  }

  const tone = toneStyles[toast.tone] || toneStyles.success;

  return (
    <View
      pointerEvents="none"
      style={[styles.container, { bottom: Math.max(insets.bottom, 16) + 78 }]}
    >
      <Animated.View
        style={[
          styles.toast,
          {
            backgroundColor: tone.backgroundColor,
            opacity,
            transform: [{ translateY }],
          },
        ]}
      >
        <MaterialCommunityIcons
          color={colors123.surface}
          name={tone.icon}
          size={18}
        />
        <Text style={styles.message}>{toast.message}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: spacing.md,
    right: spacing.md,
    zIndex: 50,
  },
  toast: {
    borderRadius: radius.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    ...shadows.card,
  },
  message: {
    flex: 1,
    color: colors123.surface,
    fontFamily: fonts.semibold,
    fontSize: 14,
  },
});
