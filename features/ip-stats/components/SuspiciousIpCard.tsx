"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../styles/ip-stats.module.css";
import { countryCodeToFlag, formatRelativeTime } from "@/lib/format";
import type { SuspiciousIpFullResponse } from "../types";

interface SuspiciousIpCardProps {
    record: SuspiciousIpFullResponse;
}

function DataRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className={styles.dataRow}>
            <span className={styles.dataLabel}>{label}</span>
            <span className={styles.dataValue}>{value ?? "—"}</span>
        </div>
    );
}

export function SuspiciousIpCard({ record }: SuspiciousIpCardProps) {
    const [expanded, setExpanded] = useState(false);
    const router = useRouter();

    const details = record.ipDetails;
    const flag = countryCodeToFlag(details?.countryCode ?? null);

    return (
        <div className={styles.suspiciousCard}>
            {/* 🔥 HEADER CLICKABLE */}
            <div
                className={styles.suspiciousHeader}
                onClick={() => setExpanded((v) => !v)}
            >
                <span className={styles.suspiciousIp}>{record.ip}</span>

                <span className={styles.userBadge}>
                    {record.userCount} users
                </span>

                {details?.country && (
                    <span className={styles.countryText}>
                        {flag} {details.country}
                    </span>
                )}

                {details?.isp && (
                    <span className={styles.ispText}>
                        {details.isp}
                        {details.org && ` / ${details.org}`}
                    </span>
                )}

                {/* 🔥 Arrow instead of text
                <span
                    className={`${styles.expandArrow} ${expanded ? styles.expanded : ""
                        }`}
                >
                    ▼
                </span> */}
            </div>

            {/* Expandable */}
            <div
                className={styles.expandWrapper}
                style={{ maxHeight: expanded ? "9999px" : "0px" }}
            >
                <div className={styles.expandContent}>
                    {/* Details */}
                    {details && (
                        <div className={styles.detailsGrid}>
                            <DataRow label="Hostname" value={details.hostname} />
                            <DataRow label="Region" value={details.region} />
                            <DataRow label="City" value={details.city} />
                            <DataRow label="Timezone" value={details.timezone} />
                            <DataRow label="ASN" value={details.asn} />
                            <DataRow label="Domain" value={details.domain} />
                            <DataRow
                                label="Last Fetched"
                                value={formatRelativeTime(details.lastFetchedAt)}
                            />
                        </div>
                    )}

                    {/* 🔥 USERS (IMPORTANT SECTION) */}
                    <div>
                        <p className={styles.usersTitle}>Associated Users</p>

                        {!record.users || record.users.length === 0 ? (
                            <p className={styles.usersEmpty}>
                                No user details available
                            </p>
                        ) : (
                            <div
                                className={styles.usersTableWrapper}
                                style={{
                                    maxHeight: record.users.length > 10 ? "16rem" : undefined,
                                    overflowY: record.users.length > 10 ? "auto" : undefined,
                                }}
                            >
                                <table className={styles.usersTable}>
                                    <thead>
                                        <tr className={styles.tableHeadRow}>
                                            <th className={styles.th}>#</th>
                                            <th className={styles.th}>User ID</th>
                                            <th className={styles.th}>Email</th>
                                            <th className={styles.th}>Username</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {record.users.map((user, i) => (
                                            <tr
                                                key={user.id}
                                                className={`${styles.tableRow} ${i % 2 !== 0 ? styles.rowAlt : ""
                                                    }`}
                                                onClick={() =>
                                                    router.push(`/users/${user.id}`)
                                                }
                                            >
                                                <td className={styles.tdIndex}>{i + 1}</td>
                                                <td className={styles.tdMuted}>
                                                    {user.id.slice(0, 8)}...
                                                </td>
                                                <td className={styles.tdPrimary}>{user.email}</td>
                                                <td className={styles.tdPrimary}>{user.username}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}