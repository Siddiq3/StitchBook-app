import PrivateImage from './PrivateImage';
import React, { useState, useEffect } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { COLORS, fonts } from "../utils/theme";

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

// Same name, same colour: a soft tint of one brand-safe accent per person
const tintFor = (name = "") => {
  let hash = 0;
  for (const char of String(name)) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return COLORS.avatarColors[Math.abs(hash) % COLORS.avatarColors.length];
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
  const tint = tintFor(name || initials);

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
          backgroundColor: `${tint}1A`,
          borderColor: `${tint}33`,
        },
        style,
      ]}
    >
      <Text style={[styles.initials, { fontSize: size * 0.34, color: tint }]}>
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
  },
  initials: {
    fontFamily: fonts.bold,
  },
});
