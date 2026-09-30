import React from 'react';
import { View, Text } from 'react-native';

export default function AvatarCircle({ name = '', size = 56 }) {
  const initials = (name || '')
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const fontSize = size === 56 ? 18 : 24;

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: '#3D3A8C',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text
        style={{
          color: '#FFFFFF',
          fontSize,
          fontWeight: 'bold',
        }}
      >
        {initials}
      </Text>
    </View>
  );
}
