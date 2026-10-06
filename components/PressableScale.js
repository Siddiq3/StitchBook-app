import React, { useState } from "react";
import { Pressable } from "react-native";
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSpring } from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const SPRING = { damping: 18, stiffness: 320, mass: 0.6 };

// Drop-in Pressable that springs down slightly while held. Accepts style as a function like Pressable.
export default function PressableScale({ style, onPressIn, onPressOut, scaleTo = 0.97, disabled, ...props }) {
  const reducedMotion = useReducedMotion();
  const scale = useSharedValue(1);
  const [pressed, setPressed] = useState(false);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      {...props}
      disabled={disabled}
      onPressIn={(event) => {
        setPressed(true);
        if (!reducedMotion) scale.value = withSpring(scaleTo, SPRING);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        setPressed(false);
        scale.value = withSpring(1, SPRING);
        onPressOut?.(event);
      }}
      style={[typeof style === "function" ? style({ pressed }) : style, animatedStyle]}
    />
  );
}
