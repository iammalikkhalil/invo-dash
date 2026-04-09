"use client";
// features/ip-stats/hooks/useIpLookup.ts

import { useState, useCallback } from "react";
import { api, getErrorMessage } from "@/lib/api";
import type { IpRecordResponse } from "../types";

export function useIpLookup(): {
    data: IpRecordResponse | null;
    loading: boolean;
    error: string | null;
    lookup: (ip: string) => Promise<void>;
    reset: () => void;
} {
    const [data, setData] = useState<IpRecordResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const lookup = useCallback(async (ip: string) => {
        setLoading(true);
        setError(null);
        setData(null);
        try {
            const res = await api.getIpRecord(ip);
            setData(res);
        } catch (err) {
            setError(getErrorMessage(err, "Lookup failed"));
        } finally {
            setLoading(false);
        }
    }, []);

    const reset = useCallback(() => {
        setData(null);
        setError(null);
        setLoading(false);
    }, []);

    return { data, loading, error, lookup, reset };
}