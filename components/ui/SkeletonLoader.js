import React, { useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors123, SIZES } from '../../utils/theme';

export default function SkeletonLoader({
  width = '100%',
  height = 50,
  borderRadius = SIZES.radiusMd,
  style,
}) {
  const shimmerValue = new Animated.Value(0);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerValue, {
          toValue: 1,
          duration: 800,
          useNativeDriver: false,
        }),
        Animated.timing(shimmerValue, {
          toValue: 0,
          duration: 800,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [shimmerValue]);

  const backgroundColor = shimmerValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E2E8F0', '#F8FAFC'],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  skeleton: {
    marginBottom: SIZES.md2,
  },
});
