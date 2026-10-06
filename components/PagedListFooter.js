import React from "react";
import { View, Text } from "react-native";
import { colors123, fonts } from "../utils/theme";
import AppButton from "./AppButton";
export default function PagedListFooter({ list }) {
  return (
    <View style={{ paddingVertical: 16, gap: 8 }}>
      {list.error && (
        <Text style={{ color: colors123.danger }} accessibilityRole="alert">
          {list.error}
        </Text>
      )}
      {list.error && !list.items.length && (
        <AppButton label="Retry" onPress={list.reload} />
      )}
      {list.pagination?.total != null && (
        <Text
          style={{ color: colors123.textSecondary, fontFamily: fonts.regular }}
        >
          {list.items.length} of {list.pagination.total}
        </Text>
      )}
      {list.pagination?.hasMore && (
        <AppButton
          label={list.loading ? "Loading…" : "Load more"}
          disabled={list.loading}
          onPress={list.loadMore}
        />
      )}
    </View>
  );
}
