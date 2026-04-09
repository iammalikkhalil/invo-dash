"use client";

import { useState, type KeyboardEvent } from "react";
import styles from "../styles/ip-stats.module.css";
import { useIpLookup } from "../hooks/useIpLookup";
import { IpLookupResult } from "./IpLookupResult";
import { isValidIp } from "@/lib/format";

export function IpLookupTool() {
    const [inputValue, setInputValue] = useState("");
    const [validationError, setValidationError] = useState<string | null>(null);
    const { data, loading, error, lookup, reset } = useIpLookup();

    const handleLookup = async () => {
        const trimmed = inputValue.trim();

        if (!trimmed) {
            setValidationError("Please enter an IP address");
            return;
        }

        if (!isValidIp(trimmed)) {
            setValidationError("Invalid IP address format");
            return;
        }

        setValidationError(null);
        await lookup(trimmed);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") handleLookup();
    };

    const handleChange = (v: string) => {
        setInputValue(v);
        if (validationError) setValidationError(null);
        if (data || error) reset();
    };

    return (
        <section className={styles.lookupSection}>
            <h2 className={styles.lookupTitle}>IP Lookup</h2>

            {/* Input row */}
            <div className={styles.lookupRow}>
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => handleChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter IP address... e.g. 8.8.8.8"
                    className={styles.lookupInput}
                />

                <button
                    onClick={handleLookup}
                    disabled={loading}
                    className={styles.lookupBtn}
                >
                    {loading ? "..." : "Lookup"}
                </button>
            </div>

            {validationError && (
                <p className={styles.lookupErrorText}>{validationError}</p>
            )}

            {/* Loading */}
            {loading && (
                <div className={styles.lookupLoadingBox}>
                    <div className={styles.lookupSpinner} />
                </div>
            )}

            {/* Error */}
            {!loading && error && (
                <div className={styles.lookupErrorBox}>
                    <p className={styles.lookupErrorMsg}>⚠ {error}</p>
                </div>
            )}

            {/* Empty */}
            {!loading && !error && !data && (
                <div className={styles.lookupEmpty}>
                    <p className={styles.lookupEmptyText}>
                        Enter an IP address to begin lookup
                    </p>
                </div>
            )}

            {/* Result */}
            {!loading && data && <IpLookupResult record={data} />}
        </section>
    );
}