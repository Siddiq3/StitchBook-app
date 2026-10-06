import { useCallback, useRef, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { mergePage } from "../utils/pagination";

// Lists own their pages so searches in one screen cannot overwrite another.
export default function usePagedList(fetchPage, collection, params = {}) {
  const key = JSON.stringify(params);
  const generation = useRef(0);
  const busy = useRef(false);
  const [state, setState] = useState({
    items: [],
    pagination: null,
    summary: null,
    loading: false,
    error: null,
  });
  const request = useCallback(
    async (page = 1) => {
      if (page > 1 && busy.current) return;
      const version = page === 1 ? ++generation.current : generation.current;
      busy.current = true;
      setState((previous) => ({
        ...previous,
        ...(page === 1 ? { items: [], pagination: null, summary: null } : {}),
        loading: true,
        error: null,
      }));
      try {
        const response = await fetchPage({
          ...JSON.parse(key),
          page,
          limit: 50,
        });
        if (version !== generation.current) return;
        const data = response.data?.data || {};
        const items = data[collection] || data.items || [];
        setState((previous) => ({
          items: mergePage(previous.items, items, page),
          summary: data.summary || null,
          pagination: data.pagination || { page, hasMore: items.length === 50 },
          loading: false,
          error: null,
        }));
      } catch (error) {
        if (version === generation.current)
          setState((previous) => ({
            ...previous,
            loading: false,
            error:
              error.response?.data?.message ||
              error.message ||
              "Unable to load data",
          }));
      } finally {
        if (version === generation.current) busy.current = false;
      }
    },
    [fetchPage, collection, key]
  );
  useFocusEffect(
    useCallback(() => {
      request(1);
      return () => {
        generation.current++;
        busy.current = false;
      };
    }, [request])
  );
  const reload = useCallback(() => request(1), [request]);
  const loadMore = useCallback(
    () =>
      state.pagination?.hasMore && request((state.pagination.page || 1) + 1),
    [request, state.pagination]
  );
  return { ...state, reload, loadMore };
}
