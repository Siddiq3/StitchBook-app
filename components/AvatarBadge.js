import PrivateImage from './PrivateImage';
import React, { useState, useEffect } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { colors123, fonts } from "../utils/theme";

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

export default function AvatarBadge({
  initials,
  name,
  size = 48,
  photoUrl,
  style,
}) {
  const [imageFailed, setImageFailed] = useState(false);
  useEffect(() => setImageFailed(false), [photoUrl]);
  const displayInitials = normalizeInitials(initials, name);

  if (photoUrl && !imageFailed)
    return (
      <PrivateImage
        accessibilityLabel={name}
        source={{ uri: photoUrl }}
        onError={() => setImageFailed(true)}
        style={[{ width: size, height: size, borderRadius: size / 2 }, style]}
      />
    );

  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors123.surfaceMuted,
        },
        style,
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
    borderColor: colors123.borderLight,
  },
  initials: {
    color: colors123.textSecondary,
    fontFamily: fonts.bold,
  },
});
