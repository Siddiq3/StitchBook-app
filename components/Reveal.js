import React from "react";
import Animated, { FadeInDown } from "react-native-reanimated";

// Section entrance: fades up, staggered by index (capped so long screens don't lag).
// Reanimated skips it automatically when the system asks for reduced motion.
export default function Reveal({ index = 0, style, children }) {
  return (
    <Animated.View entering={FadeInDown.delay(Math.min(index, 6) * 55).duration(340)} style={style}>
      {children}
    </Animated.View>
  );
}
