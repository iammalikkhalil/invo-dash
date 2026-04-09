import type { CSSProperties } from "react";

interface DonutChartProps {
    percentage: number;
    color?: string;
    trackColor?: string;
    size?: number;
    strokeWidth?: number;
}

export function DonutChart({
    percentage,
    color = "#f59e0b",
    trackColor = "#e5e7eb",
    size = 160,
    strokeWidth = 22,
}: DonutChartProps) {
    const clamped = Math.min(100, Math.max(0, percentage));
    const cx = size / 2;
    const cy = size / 2;
    const r = (size - strokeWidth) / 2;
    const circ = 2 * Math.PI * r;
    const dash = (clamped / 100) * circ;
    const gap = circ - dash;
    // offset by 1/4 circumference so arc starts at top (12 o'clock)
    const offset = circ / 4;

    return (
        <div style={{ position: "relative", width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {/* Track ring */}
                <circle
                    cx={cx} cy={cy} r={r}
                    fill="none"
                    stroke={trackColor}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                />
                {/* Progress arc */}
                <circle
                    cx={cx} cy={cy} r={r}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={`${dash} ${gap}`}
                    strokeDashoffset={offset}
                    style={{ transition: "stroke-dasharray 0.6s ease" }}
                />
                {/* Center label */}
                <text
                    x={cx} y={cy}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontFamily="system-ui, sans-serif"
                    fontSize={size * 0.175}
                    fontWeight="500"
                    fill={color}
                >
                    {Math.round(clamped)}%
                </text>
            </svg>
        </div>
    );
}