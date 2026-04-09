"use client";

import { useState } from "react";
import styles from "../styles/ip-stats.module.css";
import { IpStatsCards } from "./IpStatsCards";
import { IpLookupTool } from "./IpLookupTool";
import { SuspiciousIpsPanel } from "./SuspiciousIpsPanel";
import { ExclusionSidebar } from "./ExclusionSidebar";
import type { ExclusionRules } from "../types";

const EMPTY_RULES: ExclusionRules = {
    ips: [],
    countries: [],
    cities: [],
    isps: [],
    orgs: [],
};

export function IpStatsDashboard() {
    const [exclusionRules, setExclusionRules] =
        useState<ExclusionRules>(EMPTY_RULES);

    return (
        <div className={styles.dashboard}>
            {/* Header */}
            <div className={styles.dashboardHeader}>
                <h1 className={styles.dashboardTitle}>
                    IP Intelligence
                </h1>

                <p className={styles.dashboardSubtitle}>
                    Internal security monitoring — IP anomalies, lookups, and shared-IP detection
                </p>
            </div>

            {/* Stats */}
            <IpStatsCards />

            {/* Lookup */}
            <IpLookupTool />

            {/* Suspicious */}
            <SuspiciousIpsPanel exclusionRules={exclusionRules} />

            {/* Sidebar */}
            <ExclusionSidebar
                rules={exclusionRules}
                onChange={setExclusionRules}
            />
        </div>
    );
}