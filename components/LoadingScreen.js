import { colors123 } from "../utils/theme";
import React from 'react';
import { View, ActivityIndicator } from 'react-native';

export default function LoadingScreen() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors123.surface,
      }}
    >
      <ActivityIndicator size="large" color="#4F46E5" />
    </View>
  );
}
