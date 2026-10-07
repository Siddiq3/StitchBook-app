import React from "react";
import { MotiView } from "./AccessibleMotionView";

// Section entrance: fades up, staggered by index (capped so long screens don't lag).
// Uses animated styles rather than Reanimated layout animations, which misbehave
// on Fabric when screens mount and unmount quickly. Skipped under reduced motion.
export default function Reveal({ index = 0, style, children }) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 12 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 320, delay: Math.min(index, 6) * 55 }}
      style={style}
    >
      {children}
    </MotiView>
  );
}
