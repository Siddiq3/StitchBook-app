export function mergePage(previous, incoming, page) {
  const rows = page === 1 ? incoming : [...previous, ...incoming];
  return Array.from(
    new Map(rows.map((item) => [String(item.id), item])).values()
  );
}
