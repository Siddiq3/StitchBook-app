import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { colors123, SIZES, normalize } from '../../utils/theme';

export default function Avatar({ name = '', size = 48, photoUrl = null }) {
  const getInitials = (fullName) => {
    if (!fullName) return '?';
    return fullName
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getColorIndex = (str) => {
    if (!str) return 0;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash) % colors123.avatarColors.length;
  };

  const initials = getInitials(name);
  const colorIndex = getColorIndex(name);
  const backgroundColor = colors123.avatarColors[colorIndex];

  if (photoUrl) {
    return (
      <Image
        source={{ uri: photoUrl }}
        style={[
          styles.avatar,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor,
        },
      ]}
    >
      <Text
        style={[
          styles.initials,
          {
            fontSize: normalize(size * 0.35),
          },
        ]}
      >
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontWeight: '700',
    color: colors123.surface,
  },
});
