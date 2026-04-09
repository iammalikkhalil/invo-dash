"use client";
// features/ip-stats/hooks/useIpStats.ts

import { useState, useEffect, useCallback } from "react";
import { api, getErrorMessage } from "@/lib/api";
import type { IpStatsResponse } from "../types";

export function useIpStats(threshold: number = 10): {
    data: IpStatsResponse | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
} {
    const [data, setData] = useState<IpStatsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.getIpStats(threshold);
            setData(res);
        } catch (err) {
            setError(getErrorMessage(err, "Failed to fetch IP stats"));
        } finally {
            setLoading(false);
        }
    }, [threshold]);

    useEffect(() => {
        load();
    }, [load]);

    return { data, loading, error, refetch: load };
}