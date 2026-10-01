// Layout is based on the available container, not a cached device width.
export function getGridLayout(
  width,
  minItemWidth = 168,
  gap = 12,
  maxColumns = 2
) {
  const available = Math.max(0, width);
  const columns = Math.max(
    1,
    Math.min(maxColumns, Math.floor((available + gap) / (minItemWidth + gap)))
  );
  return {
    columns,
    itemWidth: available
      ? Math.max(0, (available - gap * (columns - 1)) / columns)
      : undefined,
  };
}
