import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { spacing } from "../utils/theme";
import { getGridLayout } from "../utils/layout";
// Measure the actual container, including nested cards and tablet sheets.
export default function ResponsiveGrid({
  children,
  minItemWidth = 168,
  gap = spacing.sm,
  maxColumns = 2,
  style,
}) {
  const [width, setWidth] = useState(0);
  const { itemWidth } = getGridLayout(width, minItemWidth, gap, maxColumns);
  return (
    <View
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      style={[style, styles.grid, { gap }]}
    >
      {React.Children.toArray(children).map((child, index) => (
        <View
          key={child.key ?? index}
          style={{ width: itemWidth, flexGrow: width ? 0 : 1 }}
        >
          {child}
        </View>
      ))}
    </View>
  );
}
const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", alignItems: "stretch" },
});
