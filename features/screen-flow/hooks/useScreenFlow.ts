"use client";

import { useCallback, useEffect, useState } from "react";
import { api, getErrorMessage, isUnauthorizedError } from "@/lib/api";
import type { ScreenFlowQuery, ScreenFlowResponse } from "@/features/screen-flow/types";

interface UseScreenFlowResult {
  data: ScreenFlowResponse | null;
  loading: boolean;
  error: string;
  unauthorized: boolean;
  refetch: (query: ScreenFlowQuery) => Promise<void>;
}

export function useScreenFlow(initialQuery: ScreenFlowQuery): UseScreenFlowResult {
  const [data, setData] = useState<ScreenFlowResponse | null>(null);
  const [loading, setLoading] = useState(Boolean(initialQuery.from && initialQuery.to));
  const [error, setError] = useState("");
  const [unauthorized, setUnauthorized] = useState(false);

  const refetch = useCallback(async (query: ScreenFlowQuery) => {
    setLoading(true);
    setError("");
    setUnauthorized(false);

    try {
      const response = (await api.getScreenFlow({
        from: query.from,
        to: query.to,
        appVersion: query.appVersion || undefined,
        platform: query.platform || undefined,
      })) as ScreenFlowResponse;

      setData(response);
    } catch (loadError) {
      if (isUnauthorizedError(loadError)) {
        setUnauthorized(true);
        return;
      }

      setError(getErrorMessage(loadError, "Failed to load screen flow analytics."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialQuery.from || !initialQuery.to) {
      setLoading(false);
      return;
    }

    void refetch(initialQuery);
  }, [initialQuery, refetch]);

  return {
    data,
    loading,
    error,
    unauthorized,
    refetch,
  };
}
