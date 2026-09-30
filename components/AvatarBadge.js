import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors123, fonts, radius } from "../utils/theme";

const getFallbackInitials = (name = "") => {
  const words = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return "ST";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
};

const normalizeInitials = (initials, name) => {
  const value = String(initials || "").trim();
  if (!value || value === "?") return getFallbackInitials(name);
  return value.slice(0, 2).toUpperCase();
};

export default function AvatarBadge({ initials, name, size = 48 }) {
  const displayInitials = normalizeInitials(initials, name);

  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors123.primary,
        },
      ]}
    >
      <Text style={[styles.initials, { fontSize: size * 0.34 }]}>
        {displayInitials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors123.backgroundAccent,
  },
  initials: {
    color: colors123.surface,
    fontFamily: fonts.bold,
  },
});
