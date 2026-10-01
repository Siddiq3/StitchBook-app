import React from "react";
import { View } from "react-native";
import { MotiView as AnimatedView } from "moti";
import { useReducedMotion } from "react-native-reanimated";
export function MotiView({ from, animate, transition, ...props }) {
  const reducedMotion = useReducedMotion();
  if (reducedMotion) return <View {...props} />;
  return (
    <AnimatedView
      {...props}
      from={from}
      animate={animate}
      transition={{ ...transition, duration: 200, delay: 0 }}
    />
  );
}
