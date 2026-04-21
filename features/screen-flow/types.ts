export type ScreenFlowPlatform = "Android" | "iOS" | "Web" | "Unknown";

export interface ScreenFlowFilters {
  from: string;
  to: string;
  appVersion: string | null;
  platform: ScreenFlowPlatform | null;
}

export interface ScreenFlowSummary {
  totalSessions: number;
  totalTrees: number;
  appVersion: string | null;
}

export interface ScreenFlowNode {
  nodeId: string;
  screenName: string;
  stepNumber: number;
  visits: number;
  dropOff: number;
  dropOffPercentage: number;
}

export interface ScreenFlowStep {
  stepNumber: number;
  totalVisitsAtStep: number;
  droppedAtStep: number;
  nodes: ScreenFlowNode[];
}

export interface ScreenFlowEdge {
  from: string;
  to: string;
  count: number;
  percentage: number;
}

export interface ScreenFlowTree {
  rootScreen: string;
  totalSessions: number;
  totalSteps: number;
  steps: ScreenFlowStep[];
  edges: ScreenFlowEdge[];
}

export interface ScreenFlowResponse {
  filters: ScreenFlowFilters;
  summary: ScreenFlowSummary;
  trees: ScreenFlowTree[];
}

export interface ScreenFlowQuery {
  from: string;
  to: string;
  appVersion: string;
  platform: "" | ScreenFlowPlatform;
}
