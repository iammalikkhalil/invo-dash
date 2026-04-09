"use client";
// features/ip-stats/hooks/useSuspiciousIps.ts

import { useState, useEffect, useCallback } from "react";
import { api, getErrorMessage } from "@/lib/api";
import type { SuspiciousIpFullResponse } from "../types";

export function useSuspiciousIps(threshold: number = 10): {
    data: SuspiciousIpFullResponse[];
    loading: boolean;
    error: string | null;
    refetch: (threshold: number) => void;
} {
    const [data, setData] = useState<SuspiciousIpFullResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async (t: number) => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.getSuspiciousIps(t);
            setData(res);
        } catch (err) {
            setError(getErrorMessage(err, "Failed to fetch suspicious IPs"));
            setData([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load(threshold);
    }, [load, threshold]);

    return { data, loading, error, refetch: load };
}