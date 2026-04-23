"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import LoadingState from "@/components/LoadingState";
import { api, getErrorMessage, isUnauthorizedError } from "@/lib/api";
import { clearAccessToken, isLoggedIn } from "@/lib/auth";
import type { AppFlowTimelineResponse } from "@/lib/types";
import styles from "@/features/user-based-screen-flow/user-based-screen-flow.module.css";

interface UserFlowEvent {
  eventName?: string | null;
  screenName?: string | null;
  gapSec?: number | null;
  timestamp: string;
}

interface UserFlowSession {
  sessionId: string;
  startTime: string;
  events: UserFlowEvent[];
}

interface UserFlowRecord {
  userId: string;
  totalEvents: number;
  sessions: UserFlowSession[];
}

interface TimelineFilters {
  userId: string;
  deviceId: string;
  appVersion: string;
  from: string;
  to: string;
}

interface EventPoint {
  event: UserFlowEvent;
  sessionId: string;
  eventIndex: number;
  x: number;
  y: number;
  color: string;
}

type EventCategory = "lifecycle" | "navigation" | "action" | "data_commit" | "screen";
type SessionQuality =
  | "badest"
  | "bader"
  | "bad"
  | "normal"
  | "good"
  | "batter"
  | "best";

interface LabelBox {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
}

const FLOW_COLORS = [
  "#2563EB",
  "#059669",
  "#D97706",
  "#DC2626",
  "#7C3AED",
  "#0891B2",
] as const;

const BASE_Y = 230;
const START_X = 56;
const SESSION_GAP = 56;
const EVENT_PIXEL_FACTOR = 5;
const MIN_EVENT_LENGTH = 18;
const MAX_EVENT_LENGTH = 220;
const MIN_SESSION_GAP_LENGTH = 24;
const MAX_SESSION_GAP_LENGTH = 220;
const GRAPH_MIN_HEIGHT = 320;
const GRAPH_MIN_WIDTH = 1200;
const EVENT_LABEL_MIN_SPACING = 18;
const EVENT_LABEL_CHAR_WIDTH = 6.6;
const EVENT_LABEL_MIN_WIDTH = 72;
const EVENT_LABEL_MAX_WIDTH = 220;
const LABEL_HEIGHT = 16;
const LABEL_VERTICAL_STEP = 34;
const UPPER_LABEL_START_OFFSET = 24;
const LOWER_LABEL_START_OFFSET = 34;
const SESSION_GAP_LABEL_Y = BASE_Y + 26;
const LABEL_MAX_LEVEL_SEARCH = 24;
const EMPTY_FILTERS: TimelineFilters = {
  userId: "",
  deviceId: "",
  appVersion: "",
  from: "",
  to: "",
};
const LIFECYCLE_EVENTS = new Set([
  "app_foreground",
  "app_resumed",
  "app_paused",
  "app_background",
]);
const EVENT_CATEGORY_META: Record<EventCategory, { color: string; label: string }> = {
  lifecycle: { color: "#6b7280", label: "Lifecycle" },
  navigation: { color: "#2563eb", label: "Navigation" },
  action: { color: "#0ea5e9", label: "Action" },
  data_commit: { color: "#e11d48", label: "Data Commit" },
  screen: { color: "#7c3aed", label: "Screen" },
};
const EVENT_CATEGORY_LEGEND_ORDER: EventCategory[] = [
  "lifecycle",
  "screen",
  "navigation",
  "action",
  "data_commit",
];
const SESSION_QUALITY_META: Record<
  SessionQuality,
  { color: string; label: string; subtitle: string }
> = {
  badest: { color: "#b91c1c", label: "Badest", subtitle: "Zero events" },
  bader: { color: "#dc2626", label: "Bader", subtitle: "Lifecycle only" },
  bad: { color: "#ea580c", label: "Bad", subtitle: "Quit on Splash" },
  normal: { color: "#f59e0b", label: "Normal", subtitle: "Quit after Splash" },
  good: { color: "#16a34a", label: "Good", subtitle: "Has activity" },
  batter: { color: "#0f766e", label: "Batter", subtitle: "10 to 20 events" },
  best: { color: "#1d4ed8", label: "Best", subtitle: "More than 20 events" },
};

function getEventLabel(event: UserFlowEvent): string {
  const screenName = event.screenName?.trim();
  if (screenName) {
    return screenName;
  }

  const eventName = event.eventName?.trim();
  if (eventName) {
    return eventName;
  }

  return "MISSING_NAME";
}

function getSplashOnlySessionCount(user: UserFlowRecord): number {
  return user.sessions.filter((session) => {
    if (session.events.length !== 1) {
      return false;
    }

    const firstLabel = getEventLabel(session.events[0]).trim().toLowerCase();
    return firstLabel === "splash" || firstLabel === "splash_screen";
  }).length;
}

function getEventCategory(event: UserFlowEvent): EventCategory {
  const normalized = getEventLabel(event).trim().toLowerCase();

  if (LIFECYCLE_EVENTS.has(normalized)) {
    return "lifecycle";
  }

  if (normalized.includes("navigate")) {
    return "navigation";
  }

  if (normalized.includes("click")) {
    return "action";
  }

  if (normalized.includes("add")) {
    return "data_commit";
  }

  return "screen";
}

function sessionHasActivity(session: UserFlowSession): boolean {
  return session.events.some((event) => {
    const category = getEventCategory(event);
    return category === "navigation" || category === "action" || category === "data_commit";
  });
}

function getSessionQuality(session: UserFlowSession): SessionQuality {
  if (session.events.length === 0) {
    return "badest";
  }

  if (session.events.every((event) => getEventCategory(event) === "lifecycle")) {
    return "bader";
  }

  const nonLifecycleEvents = session.events.filter((event) => getEventCategory(event) !== "lifecycle");
  const firstNonLifecycleLabel = nonLifecycleEvents[0]
    ? getEventLabel(nonLifecycleEvents[0]).trim().toLowerCase()
    : "";

  if (nonLifecycleEvents.length === 1 && (firstNonLifecycleLabel === "splash" || firstNonLifecycleLabel === "splash_screen")) {
    return "bad";
  }

  if (session.events.length > 20) {
    return "best";
  }

  if (session.events.length >= 10) {
    return "batter";
  }

  if (sessionHasActivity(session)) {
    return "good";
  }

  return "normal";
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  return Number.isNaN(date.getTime())
    ? timestamp
    : date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
        timeZone: "Asia/Karachi",
      });
}

function formatDateNormalized(timestamp: string): string {
  const date = new Date(timestamp);
  return Number.isNaN(date.getTime())
    ? timestamp
    : date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        timeZone: "Asia/Karachi",
      });
}

function formatDuration(seconds: number): string {
  const absoluteSeconds = Math.abs(seconds);
  const wholeSeconds = Math.round(absoluteSeconds);
  const days = Math.floor(wholeSeconds / 86400);
  const hours = Math.floor((wholeSeconds % 86400) / 3600);
  const minutes = Math.floor((wholeSeconds % 3600) / 60);
  const secs = wholeSeconds % 60;
  const prefix = seconds < 0 ? "-" : "";
  const parts: string[] = [];

  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

  return `${prefix}${parts.slice(0, 3).join(" ")}`;
}

function compactId(value: string, keepStart = 8, keepEnd = 6): string {
  if (value.length <= keepStart + keepEnd + 3) {
    return value;
  }

  return `${value.slice(0, keepStart)}...${value.slice(-keepEnd)}`;
}

function toUtcIso(value: string): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

function mapTimelineResponseToRecord(response: AppFlowTimelineResponse): UserFlowRecord {
  return {
    userId: response.userId || response.deviceId || "UNKNOWN_IDENTITY",
    totalEvents: response.totalEvents,
    sessions: response.sessions.map((session) => ({
      sessionId: session.sessionId,
      startTime: session.startTime,
      events: session.events.map((event) => ({
        eventName: event.eventName,
        screenName: event.screenName,
        timestamp: event.timestamp,
        gapSec: event.gapSec,
      })),
    })),
  };
}

function clampDistance(seconds: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, seconds * EVENT_PIXEL_FACTOR));
}

function estimateLabelWidth(label: string): number {
  return Math.min(
    EVENT_LABEL_MAX_WIDTH,
    Math.max(EVENT_LABEL_MIN_WIDTH, label.length * EVENT_LABEL_CHAR_WIDTH),
  );
}

function boxesOverlap(a: LabelBox, b: LabelBox): boolean {
  return !(a.x2 < b.x1 || a.x1 > b.x2 || a.y2 < b.y1 || a.y1 > b.y2);
}

function buildGraph(user: UserFlowRecord | null) {
  const elements: ReactNode[] = [];
  const points: EventPoint[] = [];

  if (!user) {
    return { elements, points, width: GRAPH_MIN_WIDTH, height: GRAPH_MIN_HEIGHT };
  }

  let x = START_X;
  let previousSessionEndTime: string | null = null;
  const placedLabels: LabelBox[] = [];
  let maxLabelY = BASE_Y;
  const reserveLabel = (labelX: number, labelY: number, labelWidth: number): LabelBox => ({
      x1: labelX - (labelWidth / 2) - EVENT_LABEL_MIN_SPACING,
      x2: labelX + (labelWidth / 2) + EVENT_LABEL_MIN_SPACING,
      y1: labelY - LABEL_HEIGHT,
      y2: labelY + 4,
  });

  user.sessions.forEach((session, sessionIndex) => {
    const color = FLOW_COLORS[sessionIndex % FLOW_COLORS.length] || "#2563EB";
    let lastEventTime = session.startTime;
    let sessionEndTime = session.startTime;

    if (previousSessionEndTime && session.startTime) {
      const gapSec =
        (new Date(session.startTime).getTime() - new Date(previousSessionEndTime).getTime()) / 1000;
      const isNegativeGap = gapSec < 0;
      const gapLabel = formatDuration(gapSec);
      const gapWidth = clampDistance(
        Math.max(gapSec, 0),
        MIN_SESSION_GAP_LENGTH,
        MAX_SESSION_GAP_LENGTH,
      );
      const gapLabelX = x + (gapWidth / 2);

      elements.push(
        <line
          key={`session-gap-line-${session.sessionId}`}
          x1={x}
          y1={BASE_Y}
          x2={x + gapWidth}
          y2={BASE_Y}
          stroke={isNegativeGap ? "#d64545" : "#bcc7da"}
          strokeDasharray="5 5"
          strokeWidth="2"
        />,
      );

      const gapLabelWidth = estimateLabelWidth(gapLabel);
      const gapLabelBox = reserveLabel(gapLabelX, SESSION_GAP_LABEL_Y, gapLabelWidth);
      placedLabels.push(gapLabelBox);
      maxLabelY = Math.max(maxLabelY, gapLabelBox.y2);

      elements.push(
        <text
          key={`session-gap-label-${session.sessionId}`}
          x={gapLabelX}
          y={SESSION_GAP_LABEL_Y}
          textAnchor="middle"
          className={isNegativeGap ? styles.graphGapLabelWarning : styles.graphGapLabel}
        >
          {gapLabel}
        </text>,
      );

      x += gapWidth;
    }

    const sessionStartX = x;

    elements.push(
      <text
        key={`session-id-${session.sessionId}`}
        x={x}
        y={54}
        className={styles.graphSessionLabel}
        fill={color}
      >
        {compactId(session.sessionId, 6, 4)}
      </text>,
    );

    elements.push(
      <text
        key={`session-time-${session.sessionId}`}
        x={x}
        y={70}
        className={styles.graphSessionTime}
      >
        {formatTime(session.startTime)}
      </text>,
    );

    elements.push(
      <text
        key={`session-date-${session.sessionId}`}
        x={x}
        y={84}
        className={styles.graphSessionDate}
      >
        {formatDateNormalized(session.startTime)}
      </text>,
    );

    session.events.forEach((event, eventIndex) => {
      const label = getEventLabel(event);
      const labelWidth = estimateLabelWidth(label);
      const gap = Math.max(event.gapSec || 0, 0);
      const length = clampDistance(gap, MIN_EVENT_LENGTH, MAX_EVENT_LENGTH);
      const eventGapLabel = formatDuration(event.gapSec || 0);

      elements.push(
        <line
          key={`event-line-${session.sessionId}-${eventIndex}`}
          x1={x}
          y1={BASE_Y}
          x2={x + length}
          y2={BASE_Y}
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
        />,
      );

      x += length;
      const eventX = x;

      points.push({
        event,
        sessionId: session.sessionId,
        eventIndex,
        x: eventX,
        y: BASE_Y,
        color,
      });

      let labelY = BASE_Y - UPPER_LABEL_START_OFFSET;
      let isUpperLane = true;
      let chosenBox: LabelBox | null = null;

      for (let level = 0; level < LABEL_MAX_LEVEL_SEARCH; level += 1) {
        const upperY = BASE_Y - UPPER_LABEL_START_OFFSET - (level * LABEL_VERTICAL_STEP);
        const lowerY = BASE_Y + LOWER_LABEL_START_OFFSET + (level * LABEL_VERTICAL_STEP);

        const upperBox = {
          x1: eventX - (labelWidth / 2) - EVENT_LABEL_MIN_SPACING,
          x2: eventX + (labelWidth / 2) + EVENT_LABEL_MIN_SPACING,
          y1: upperY - LABEL_HEIGHT,
          y2: upperY + 4,
        };

        const lowerBox = {
          x1: eventX - (labelWidth / 2) - EVENT_LABEL_MIN_SPACING,
          x2: eventX + (labelWidth / 2) + EVENT_LABEL_MIN_SPACING,
          y1: lowerY - LABEL_HEIGHT,
          y2: lowerY + 4,
        };

        const upperBlocked = placedLabels.some((placed) => boxesOverlap(placed, upperBox));
        const lowerBlocked = placedLabels.some((placed) => boxesOverlap(placed, lowerBox));

        if (!upperBlocked && !lowerBlocked) {
          if ((BASE_Y - upperY) <= (lowerY - BASE_Y)) {
            labelY = upperY;
            isUpperLane = true;
            chosenBox = upperBox;
          } else {
            labelY = lowerY;
            isUpperLane = false;
            chosenBox = lowerBox;
          }
          break;
        }

        if (!upperBlocked) {
          labelY = upperY;
          isUpperLane = true;
          chosenBox = upperBox;
          break;
        }

        if (!lowerBlocked) {
          labelY = lowerY;
          isUpperLane = false;
          chosenBox = lowerBox;
          break;
        }
      }

      if (!chosenBox) {
        labelY = BASE_Y + LOWER_LABEL_START_OFFSET + (LABEL_MAX_LEVEL_SEARCH * LABEL_VERTICAL_STEP);
        isUpperLane = false;
        chosenBox = {
          x1: eventX - (labelWidth / 2) - EVENT_LABEL_MIN_SPACING,
          x2: eventX + (labelWidth / 2) + EVENT_LABEL_MIN_SPACING,
          y1: labelY - LABEL_HEIGHT,
          y2: labelY + 4,
        };
      }

      placedLabels.push(chosenBox);
      maxLabelY = Math.max(maxLabelY, chosenBox.y2);

      const connectorEndY = isUpperLane ? labelY + 10 : labelY - 10;

      elements.push(
        <line
          key={`event-connector-${session.sessionId}-${eventIndex}`}
          x1={eventX}
          y1={BASE_Y + (isUpperLane ? -7 : 7)}
          x2={eventX}
          y2={connectorEndY}
          stroke={color}
          strokeOpacity="0.55"
          strokeWidth="1.5"
        />,
      );

      elements.push(
        <text
          key={`event-label-${session.sessionId}-${eventIndex}`}
          x={eventX}
          y={labelY}
          textAnchor="middle"
          className={styles.graphEventLabel}
        >
          {label}
        </text>,
      );

      elements.push(
        <text
          key={`event-gap-${session.sessionId}-${eventIndex}`}
          x={eventX}
          y={BASE_Y + 18}
          textAnchor="middle"
          className={styles.graphEventGapLabel}
        >
          {eventGapLabel}
        </text>,
      );

      lastEventTime = event.timestamp;
      sessionEndTime = event.timestamp;
    });

    const sessionDurationSec =
      (new Date(sessionEndTime).getTime() - new Date(session.startTime).getTime()) / 1000;

    elements.push(
      <text
        key={`session-duration-${session.sessionId}`}
        x={sessionStartX}
        y={98}
        className={styles.graphSessionDuration}
      >
        {`Duration ${formatDuration(Math.max(sessionDurationSec, 0))}`}
      </text>,
    );

    const sessionEndX = x;

    elements.push(
      <rect
        key={`session-bg-${session.sessionId}`}
        x={sessionStartX}
        y={BASE_Y - 56}
        width={Math.max(sessionEndX - sessionStartX, 0)}
        height={112}
        fill={color}
        opacity="0.07"
      />,
    );

    previousSessionEndTime = lastEventTime;
    x += SESSION_GAP;
  });

  points.forEach((point) => {
    elements.push(
      <circle
        key={`event-dot-${point.sessionId}-${point.eventIndex}`}
        cx={point.x}
        cy={point.y}
        r="5"
        fill={point.color}
      >
        <title>
          {`Session: ${point.sessionId}
Event #: ${point.eventIndex + 1}
Name: ${getEventLabel(point.event)}
Gap: ${formatDuration(point.event.gapSec || 0)}
Time: ${point.event.timestamp}`}
        </title>
      </circle>,
    );
  });

  return {
    elements,
    points,
    width: Math.max(x + 80, GRAPH_MIN_WIDTH),
    height: Math.max(GRAPH_MIN_HEIGHT, maxLabelY + 18),
  };
}

function renderCategoryMarker(
  category: EventCategory,
  x: number,
  y: number,
  sessionId: string,
  eventIndex: number,
  title: string,
) {
  const fill = EVENT_CATEGORY_META[category].color;

  if (category === "lifecycle") {
    return (
      <rect
        key={`event-marker-${sessionId}-${eventIndex}`}
        x={x - 4}
        y={y - 4}
        width="8"
        height="8"
        fill={fill}
      >
        <title>{title}</title>
      </rect>
    );
  }

  if (category === "navigation") {
    return (
      <polygon
        key={`event-marker-${sessionId}-${eventIndex}`}
        points={`${x},${y - 7} ${x + 7},${y} ${x},${y + 7} ${x - 7},${y}`}
        fill={fill}
      >
        <title>{title}</title>
      </polygon>
    );
  }

  if (category === "action") {
    return (
      <polygon
        key={`event-marker-${sessionId}-${eventIndex}`}
        points={`${x},${y - 7} ${x + 7},${y} ${x},${y + 7} ${x - 7},${y}`}
        fill={fill}
      >
        <title>{title}</title>
      </polygon>
    );
  }

  if (category === "data_commit") {
    return (
      <polygon
        key={`event-marker-${sessionId}-${eventIndex}`}
        points={`${x},${y - 7} ${x + 7},${y + 6} ${x - 7},${y + 6}`}
        fill={fill}
      >
        <title>{title}</title>
      </polygon>
    );
  }

  if (category === "screen") {
    return (
      <circle
        key={`event-marker-${sessionId}-${eventIndex}`}
        cx={x}
        cy={y}
        r="6"
        fill={fill}
      >
        <title>{title}</title>
      </circle>
    );
  }

  return (
    <circle
      key={`event-marker-${sessionId}-${eventIndex}`}
      cx={x}
      cy={y}
      r="5"
      fill={fill}
    >
      <title>{title}</title>
    </circle>
  );
}

function renderLegendMarker(category: EventCategory) {
  const fill = EVENT_CATEGORY_META[category].color;

  if (category === "lifecycle") {
    return <rect x="5" y="5" width="8" height="8" fill={fill} />;
  }

  if (category === "navigation") {
    return <polygon points="9,1 17,9 9,17 1,9" fill={fill} />;
  }

  if (category === "action") {
    return <polygon points="9,1 17,9 9,17 1,9" fill={fill} />;
  }

  if (category === "data_commit") {
    return <polygon points="9,2 17,16 1,16" fill={fill} />;
  }

  return <circle cx="9" cy="9" r="6" fill={fill} />;
}

function buildGraphV2(user: UserFlowRecord | null) {
  const elements: ReactNode[] = [];
  const points: EventPoint[] = [];

  if (!user) {
    return { elements, points, width: GRAPH_MIN_WIDTH, height: GRAPH_MIN_HEIGHT };
  }

  let x = START_X;
  let previousSessionEndTime: string | null = null;
  const placedLabels: LabelBox[] = [];
  let maxLabelY = BASE_Y;
  const reserveLabel = (labelX: number, labelY: number, labelWidth: number): LabelBox => ({
    x1: labelX - (labelWidth / 2) - EVENT_LABEL_MIN_SPACING,
    x2: labelX + (labelWidth / 2) + EVENT_LABEL_MIN_SPACING,
    y1: labelY - LABEL_HEIGHT,
    y2: labelY + 4,
  });

  user.sessions.forEach((session) => {
    const sessionQuality = getSessionQuality(session);
    const sessionColor = SESSION_QUALITY_META[sessionQuality].color;
    let lastEventTime = session.startTime;
    let sessionEndTime = session.startTime;

    if (previousSessionEndTime && session.startTime) {
      const gapSec =
        (new Date(session.startTime).getTime() - new Date(previousSessionEndTime).getTime()) / 1000;
      const isNegativeGap = gapSec < 0;
      const gapLabel = formatDuration(gapSec);
      const gapWidth = clampDistance(
        Math.max(gapSec, 0),
        MIN_SESSION_GAP_LENGTH,
        MAX_SESSION_GAP_LENGTH,
      );
      const gapLabelX = x + (gapWidth / 2);

      elements.push(
        <line
          key={`session-gap-line-v2-${session.sessionId}`}
          x1={x}
          y1={BASE_Y}
          x2={x + gapWidth}
          y2={BASE_Y}
          stroke={isNegativeGap ? "#d64545" : "#bcc7da"}
          strokeDasharray="5 5"
          strokeWidth="2"
        />,
      );

      const gapLabelWidth = estimateLabelWidth(gapLabel);
      const gapLabelBox = reserveLabel(gapLabelX, SESSION_GAP_LABEL_Y, gapLabelWidth);
      placedLabels.push(gapLabelBox);
      maxLabelY = Math.max(maxLabelY, gapLabelBox.y2);

      elements.push(
        <text
          key={`session-gap-label-v2-${session.sessionId}`}
          x={gapLabelX}
          y={SESSION_GAP_LABEL_Y}
          textAnchor="middle"
          className={isNegativeGap ? styles.graphGapLabelWarning : styles.graphGapLabel}
        >
          {gapLabel}
        </text>,
      );

      x += gapWidth;
    }

    const sessionStartX = x;

    elements.push(
      <text
        key={`session-id-v2-${session.sessionId}`}
        x={x}
        y={54}
        className={styles.graphSessionLabel}
        fill={sessionColor}
      >
        {compactId(session.sessionId, 6, 4)}
      </text>,
    );

    elements.push(
      <text
        key={`session-time-v2-${session.sessionId}`}
        x={x}
        y={70}
        className={styles.graphSessionTime}
      >
        {formatTime(session.startTime)}
      </text>,
    );

    elements.push(
      <text
        key={`session-date-v2-${session.sessionId}`}
        x={x}
        y={84}
        className={styles.graphSessionDate}
      >
        {formatDateNormalized(session.startTime)}
      </text>,
    );

    elements.push(
      <text
        key={`session-duration-v2-${session.sessionId}`}
        x={x}
        y={98}
        className={styles.graphSessionDuration}
      >
        {`Duration ${formatDuration(
          Math.max(
            (new Date(
              session.events.length > 0
                ? session.events[session.events.length - 1]?.timestamp || session.startTime
                : session.startTime,
            ).getTime() - new Date(session.startTime).getTime()) / 1000,
            0,
          ),
        )}`}
      </text>,
    );

    session.events.forEach((event, eventIndex) => {
      const label = getEventLabel(event);
      const labelWidth = estimateLabelWidth(label);
      const gap = Math.max(event.gapSec || 0, 0);
      const length = clampDistance(gap, MIN_EVENT_LENGTH, MAX_EVENT_LENGTH);
      const eventGapLabel = formatDuration(event.gapSec || 0);
      const category = getEventCategory(event);

      elements.push(
        <line
          key={`event-line-v2-${session.sessionId}-${eventIndex}`}
          x1={x}
          y1={BASE_Y}
          x2={x + length}
          y2={BASE_Y}
          stroke={sessionColor}
          strokeWidth="3"
          strokeLinecap="round"
        />,
      );

      x += length;
      const eventX = x;

      points.push({
        event,
        sessionId: session.sessionId,
        eventIndex,
        x: eventX,
        y: BASE_Y,
        color: EVENT_CATEGORY_META[category].color,
      });

      let labelY = BASE_Y - UPPER_LABEL_START_OFFSET;
      let isUpperLane = true;
      let chosenBox: LabelBox | null = null;

      for (let level = 0; level < LABEL_MAX_LEVEL_SEARCH; level += 1) {
        const upperY = BASE_Y - UPPER_LABEL_START_OFFSET - (level * LABEL_VERTICAL_STEP);
        const lowerY = BASE_Y + LOWER_LABEL_START_OFFSET + (level * LABEL_VERTICAL_STEP);

        const upperBox = {
          x1: eventX - (labelWidth / 2) - EVENT_LABEL_MIN_SPACING,
          x2: eventX + (labelWidth / 2) + EVENT_LABEL_MIN_SPACING,
          y1: upperY - LABEL_HEIGHT,
          y2: upperY + 4,
        };

        const lowerBox = {
          x1: eventX - (labelWidth / 2) - EVENT_LABEL_MIN_SPACING,
          x2: eventX + (labelWidth / 2) + EVENT_LABEL_MIN_SPACING,
          y1: lowerY - LABEL_HEIGHT,
          y2: lowerY + 4,
        };

        const upperBlocked = placedLabels.some((placed) => boxesOverlap(placed, upperBox));
        const lowerBlocked = placedLabels.some((placed) => boxesOverlap(placed, lowerBox));

        if (!upperBlocked && !lowerBlocked) {
          if ((BASE_Y - upperY) <= (lowerY - BASE_Y)) {
            labelY = upperY;
            isUpperLane = true;
            chosenBox = upperBox;
          } else {
            labelY = lowerY;
            isUpperLane = false;
            chosenBox = lowerBox;
          }
          break;
        }

        if (!upperBlocked) {
          labelY = upperY;
          isUpperLane = true;
          chosenBox = upperBox;
          break;
        }

        if (!lowerBlocked) {
          labelY = lowerY;
          isUpperLane = false;
          chosenBox = lowerBox;
          break;
        }
      }

      if (!chosenBox) {
        labelY = BASE_Y + LOWER_LABEL_START_OFFSET + (LABEL_MAX_LEVEL_SEARCH * LABEL_VERTICAL_STEP);
        isUpperLane = false;
        chosenBox = {
          x1: eventX - (labelWidth / 2) - EVENT_LABEL_MIN_SPACING,
          x2: eventX + (labelWidth / 2) + EVENT_LABEL_MIN_SPACING,
          y1: labelY - LABEL_HEIGHT,
          y2: labelY + 4,
        };
      }

      placedLabels.push(chosenBox);
      maxLabelY = Math.max(maxLabelY, chosenBox.y2);

      const connectorEndY = isUpperLane ? labelY + 10 : labelY - 10;

      elements.push(
        <line
          key={`event-connector-v2-${session.sessionId}-${eventIndex}`}
          x1={eventX}
          y1={BASE_Y + (isUpperLane ? -7 : 7)}
          x2={eventX}
          y2={connectorEndY}
          stroke={EVENT_CATEGORY_META[category].color}
          strokeOpacity="0.55"
          strokeWidth="1.5"
        />,
      );

      elements.push(
        <text
          key={`event-label-v2-${session.sessionId}-${eventIndex}`}
          x={eventX}
          y={labelY}
          textAnchor="middle"
          className={styles.graphEventLabel}
        >
          {label}
        </text>,
      );

      elements.push(
        <text
          key={`event-gap-v2-${session.sessionId}-${eventIndex}`}
          x={eventX}
          y={BASE_Y + 18}
          textAnchor="middle"
          className={styles.graphEventGapLabel}
        >
          {eventGapLabel}
        </text>,
      );

      lastEventTime = event.timestamp;
      sessionEndTime = event.timestamp;
    });

    const sessionEndX = x;

    elements.push(
      <rect
        key={`session-bg-v2-${session.sessionId}`}
        x={sessionStartX}
        y={BASE_Y - 56}
        width={Math.max(sessionEndX - sessionStartX, 0)}
        height={112}
        fill={sessionColor}
        opacity="0.09"
      />,
    );

    previousSessionEndTime = lastEventTime;
    x += SESSION_GAP;
  });

  points.forEach((point) => {
    const category = getEventCategory(point.event);
    const meta = EVENT_CATEGORY_META[category];
    const title = `Session: ${point.sessionId}
Event #: ${point.eventIndex + 1}
Name: ${getEventLabel(point.event)}
Category: ${meta.label}
Gap: ${formatDuration(point.event.gapSec || 0)}
Time: ${point.event.timestamp}`;

    elements.push(renderCategoryMarker(category, point.x, point.y, point.sessionId, point.eventIndex, title));
  });

  return {
    elements,
    points,
    width: Math.max(x + 80, GRAPH_MIN_WIDTH),
    height: Math.max(GRAPH_MIN_HEIGHT, maxLabelY + 18),
  };
}

export function UserBasedScreenFlowDashboard() {
  const router = useRouter();
  const [filters, setFilters] = useState<TimelineFilters>(EMPTY_FILTERS);
  const [timeline, setTimeline] = useState<AppFlowTimelineResponse | null>(null);
  const [record, setRecord] = useState<UserFlowRecord | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<EventPoint | null>(null);
  const [zoom, setZoom] = useState(1);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/login");
    }
  }, [router]);

  const selectedUser = record;

  const splashOnlySessions = useMemo(() => {
    if (!selectedUser) {
      return 0;
    }

    return getSplashOnlySessionCount(selectedUser);
  }, [selectedUser]);

  useEffect(() => {
    setSelectedPoint(null);
  }, [record]);

  const graph = useMemo(() => buildGraph(selectedUser), [selectedUser]);
  const graphV2 = useMemo(() => buildGraphV2(selectedUser), [selectedUser]);

  function updateFilter<K extends keyof TimelineFilters>(key: K, value: TimelineFilters[K]) {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleLoadTimeline() {
    const normalizedUserId = filters.userId.trim();
    const normalizedDeviceId = filters.deviceId.trim();
    const normalizedVersion = filters.appVersion.trim();
    const normalizedFrom = filters.from.trim();
    const normalizedTo = filters.to.trim();

    if (!normalizedUserId && !normalizedDeviceId) {
      setValidationError("Provide at least one of User ID or Device ID.");
      return;
    }

    if (!normalizedFrom && normalizedTo) {
      setValidationError("Both From and To must be provided together.");
      return;
    }

    const fromIso = normalizedFrom ? toUtcIso(normalizedFrom) : null;
    const resolvedToValue = normalizedTo || (normalizedFrom ? new Date().toISOString() : "");
    const toIso = resolvedToValue ? toUtcIso(resolvedToValue) ?? resolvedToValue : null;

    if ((normalizedFrom && !fromIso) || (normalizedTo && !toIso)) {
      setValidationError("From and To must be valid timestamps.");
      return;
    }

    if (fromIso && toIso && new Date(toIso).getTime() < new Date(fromIso).getTime()) {
      setValidationError("'To' must be after 'From'.");
      return;
    }

    setValidationError("");
    setError("");
    setIsLoading(true);

    try {
      const response = await api.getAppFlowTimeline({
        userId: normalizedUserId || undefined,
        deviceId: normalizedDeviceId || undefined,
        appVersion: normalizedVersion || undefined,
        from: fromIso || undefined,
        to: toIso || undefined,
      });

      setTimeline(response);
      setRecord(mapTimelineResponseToRecord(response));
      setHasLoaded(true);
    } catch (loadError) {
      if (isUnauthorizedError(loadError)) {
        clearAccessToken({ sessionExpired: true });
        router.replace("/login");
        return;
      }

      setTimeline(null);
      setRecord(null);
      setHasLoaded(true);
      setError(getErrorMessage(loadError, "Failed to load timeline."));
    } finally {
      setIsLoading(false);
    }
  }

  function handleReset() {
    setFilters(EMPTY_FILTERS);
    setTimeline(null);
    setRecord(null);
    setSelectedPoint(null);
    setValidationError("");
    setError("");
    setHasLoaded(false);
  }

  return (
    <>
      <Navbar title="User Based Screen Flow" />
      <div className="content-wrap">
        <section className="section-card">
          <div className={styles.headerRow}>
            <div>
              <h2>User Timeline Graph</h2>
              <p className="section-subtitle">
                Load a single activity timeline by user ID, device ID, or both. The graph stays the same; only the data source now comes from the timeline API.
              </p>
            </div>
          </div>
        </section>

        <section className="section-card">
          <div className={styles.controlRow}>
            <label className={styles.controlBlock}>
              <span>User ID</span>
              <input
                className="input"
                type="text"
                value={filters.userId}
                onChange={(event) => updateFilter("userId", event.target.value)}
                placeholder="UUID"
              />
            </label>

            <label className={styles.controlBlock}>
              <span>Device ID</span>
              <input
                className="input"
                type="text"
                value={filters.deviceId}
                onChange={(event) => updateFilter("deviceId", event.target.value)}
                placeholder="device-123"
              />
            </label>

            <label className={styles.controlBlock}>
              <span>App Version</span>
              <input
                className="input"
                type="text"
                value={filters.appVersion}
                onChange={(event) => updateFilter("appVersion", event.target.value)}
                placeholder="e.g. 1.3.0"
              />
            </label>

            <label className={styles.controlBlock}>
              <span>From</span>
              <input
                className="input"
                type="datetime-local"
                value={filters.from}
                onChange={(event) => updateFilter("from", event.target.value)}
              />
            </label>

            <label className={styles.controlBlock}>
              <span>To</span>
              <input
                className="input"
                type="datetime-local"
                value={filters.to}
                onChange={(event) => updateFilter("to", event.target.value)}
              />
            </label>

            <label className={styles.controlBlock}>
              <span>Zoom</span>
              <input
                className={styles.rangeInput}
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={zoom}
                onChange={(event) => setZoom(Number(event.target.value))}
              />
            </label>

            <div className={styles.zoomValue}>{`${Math.round(zoom * 100)}%`}</div>
          </div>

          <div className={styles.actionRow}>
            <button type="button" className="btn btn-outline" onClick={handleReset}>
              Reset
            </button>
            <button type="button" className="btn" onClick={() => void handleLoadTimeline()}>
              Load Timeline
            </button>
          </div>

          {validationError ? <p className="error-text">{validationError}</p> : null}
        </section>

        {isLoading ? <LoadingState message="Loading timeline..." /> : null}
        {!isLoading && error ? <ErrorState message={error} /> : null}

        {!isLoading && !selectedUser && hasLoaded ? (
          <EmptyState message="No matching sessions were found for the supplied user/device filters." />
        ) : null}

        {selectedUser && timeline ? (
          <>
            <section className={styles.statsGrid}>
              <article className={`stat-card ${styles.equalStatCard}`}>
                <p>Identity</p>
                <h3 className={styles.fullUserIdValue}>{timeline.userId || timeline.deviceId || "Unknown"}</h3>
              </article>
              <article className={`stat-card ${styles.equalStatCard}`}>
                <p>Total Events</p>
                <h3>{timeline.totalEvents}</h3>
              </article>
              <article className={`stat-card ${styles.equalStatCard}`}>
                <p>Sessions</p>
                <h3>{timeline.totalSessions}</h3>
              </article>
              <article className={`stat-card ${styles.equalStatCard}`}>
                <p>Splash Only</p>
                <h3>{splashOnlySessions}</h3>
              </article>
            </section>

            <section className="section-card">
              <div className={styles.headerRow}>
                <div>
                  <h2>Timeline Graph V1</h2>
                  <p className="section-subtitle">
                    Current session-colored timeline.
                  </p>
                </div>
              </div>
              <div className={styles.timelineViewport}>
                <div
                  className={styles.timelineCanvas}
                  style={{
                    width: `${Math.round(graph.width * zoom)}px`,
                    height: `${Math.round(graph.height * zoom)}px`,
                  }}
                >
                  <svg
                    width={graph.width}
                    height={graph.height}
                    viewBox={`0 0 ${graph.width} ${graph.height}`}
                    className={styles.timelineSvg}
                    style={{
                      transform: `scale(${zoom})`,
                      transformOrigin: "top left",
                    }}
                  >
                    <g>{graph.elements}</g>
                    {graph.points.map((point) => (
                      <circle
                        key={`event-hit-${point.sessionId}-${point.eventIndex}`}
                        cx={point.x}
                        cy={point.y}
                        r="14"
                        fill="transparent"
                        onClick={() => setSelectedPoint(point)}
                        style={{ cursor: "pointer" }}
                      />
                    ))}
                  </svg>
                </div>
              </div>
            </section>

            <section className="section-card">
              <div className={styles.headerRow}>
                <div>
                  <h2>Timeline Graph V2</h2>
                  <p className="section-subtitle">
                    Session quality colors plus category-based event shapes and colors.
                  </p>
                </div>
              </div>
              <div className={styles.v2Legend}>
                {EVENT_CATEGORY_LEGEND_ORDER.map((category) => (
                  <div key={category} className={styles.legendItem}>
                    <svg
                      className={styles.legendIcon}
                      viewBox="0 0 18 18"
                      aria-hidden="true"
                    >
                      {renderLegendMarker(category)}
                    </svg>
                    <span>{EVENT_CATEGORY_META[category].label}</span>
                  </div>
                ))}
              </div>
              <div className={styles.timelineViewport}>
                <div
                  className={styles.timelineCanvas}
                  style={{
                    width: `${Math.round(graphV2.width * zoom)}px`,
                    height: `${Math.round(graphV2.height * zoom)}px`,
                  }}
                >
                  <svg
                    width={graphV2.width}
                    height={graphV2.height}
                    viewBox={`0 0 ${graphV2.width} ${graphV2.height}`}
                    className={styles.timelineSvg}
                    style={{
                      transform: `scale(${zoom})`,
                      transformOrigin: "top left",
                    }}
                  >
                    <g>{graphV2.elements}</g>
                    {graphV2.points.map((point) => (
                      <circle
                        key={`event-hit-copy-${point.sessionId}-${point.eventIndex}`}
                        cx={point.x}
                        cy={point.y}
                        r="14"
                        fill="transparent"
                        onClick={() => setSelectedPoint(point)}
                        style={{ cursor: "pointer" }}
                      />
                    ))}
                  </svg>
                </div>
              </div>
            </section>

            <section className="section-card">
              <div className={styles.detailGrid}>
                <div>
                  <h2>Selected Event</h2>
                  <p className="section-subtitle">
                    Click any event node in the timeline to inspect its details.
                  </p>
                </div>

                {selectedPoint ? (
                  <div className={styles.eventDetailCard}>
                    <div>
                      <p className={styles.detailLabel}>Session</p>
                      <p className={styles.detailValue}>{selectedPoint.sessionId}</p>
                    </div>
                    <div>
                      <p className={styles.detailLabel}>Event #</p>
                      <p className={styles.detailValue}>{selectedPoint.eventIndex + 1}</p>
                    </div>
                    <div>
                      <p className={styles.detailLabel}>Name</p>
                      <p className={styles.detailValue}>{getEventLabel(selectedPoint.event)}</p>
                    </div>
                    <div>
                      <p className={styles.detailLabel}>Gap</p>
                      <p className={styles.detailValue}>{formatDuration(selectedPoint.event.gapSec || 0)}</p>
                    </div>
                    <div>
                      <p className={styles.detailLabel}>Time</p>
                      <p className={styles.detailValue}>{selectedPoint.event.timestamp}</p>
                    </div>
                  </div>
                ) : (
                  <p className={styles.emptyNote}>No event selected yet.</p>
                )}
              </div>
            </section>
          </>
        ) : !hasLoaded && !isLoading ? (
          <section className="section-card">
            <p className={styles.emptyNote}>Provide a `User ID` or `Device ID`, then load the timeline.</p>
          </section>
        ) : null}
      </div>
    </>
  );
}
