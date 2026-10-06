import React from "react";
import { View } from "react-native";
import { MotiView as AnimatedView } from "moti";
import { useReducedMotion } from "react-native-reanimated";

// Moti wrapper: skips motion when the system asks for reduced motion and caps
// timings so long lists never feel slow (stagger stops growing after ~8 rows).
export function MotiView({ from, animate, transition, ...props }) {
  const reducedMotion = useReducedMotion();
  if (reducedMotion) return <View {...props} />;
  return (
    <AnimatedView
      {...props}
      from={from}
      animate={animate}
      transition={{
        type: "timing",
        ...transition,
        duration: Math.min(transition?.duration ?? 280, 320),
        delay: Math.min(transition?.delay ?? 0, 320),
      }}
    />
  );
}
