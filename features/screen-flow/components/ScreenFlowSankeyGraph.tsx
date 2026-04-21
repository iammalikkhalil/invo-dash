"use client";

import { useMemo, useState } from "react";
import styles from "@/features/screen-flow/styles/screen-flow.module.css";
import type { ScreenFlowEdge, ScreenFlowResponse, ScreenFlowTree } from "@/features/screen-flow/types";

interface ScreenFlowSankeyGraphProps {
  data: ScreenFlowResponse;
}

interface GraphNode {
  id: string;
  label: string;
  stepNumber: number;
  visits: number;
  dropOff: number;
  kind: "screen" | "entry" | "exit";
}

interface GraphEdge {
  from: string;
  to: string;
  count: number;
  flowKey: string;
  flowColor: string;
  percentage: number;
  kind: "entry" | "transition" | "dropoff";
}

interface FlowLegendItem {
  key: string;
  color: string;
  totalSessions: number;
}

interface PositionedNode extends GraphNode {
  x: number;
  y: number;
  width: number;
  height: number;
  flowKeys: string[];
}

interface RenderPath extends GraphEdge {
  key: string;
  path: string;
  thickness: number;
  sourceLabel: string;
  targetLabel: string;
  labelX: number;
  labelY: number;
}

type InteractionState =
  | { type: "idle" }
  | { type: "edge"; edgeKey: string }
  | { type: "node"; nodeId: string };

const GRAPH_PADDING = 44;
const COLUMN_GAP = 200;
const NODE_WIDTH = 10;
const NODE_GAP = 60;
const NODE_TEXT_GAP = 5;
const MIN_NODE_HEIGHT = 26;
const STEP_LABEL_HEIGHT = 50;
const GRAPH_RIGHT_SAFE_SPACE = 260;
const GRAPH_BOTTOM_SAFE_SPACE = 120;
const APP_OPEN_NODE_ID = "App_Open_step_-1";
const EDGE_OPACITY = 0.32;
const EDGE_MIN_THICKNESS = 3;
const EDGE_MAX_THICKNESS = 38;
const EDGE_LABEL_WIDTH = 92;
const EDGE_LABEL_HEIGHT = 20;
const EDGE_LABEL_GAP = 8;

const GRAPH_CANVAS_MIN_WIDTH = 1600;
const GRAPH_CANVAS_MAX_WIDTH = 6200;
const GRAPH_CANVAS_MIN_HEIGHT = 720;
const GRAPH_CANVAS_MAX_HEIGHT = 2800;
const ZOOM_MIN = 0.6;
const ZOOM_MAX = 2;
const ZOOM_STEP = 0.2;

const FLOW_COLORS = [
  "#2563EB",
  "#DC2626",
  "#059669",
  "#D97706",
  "#7C3AED",
  "#DB2777",
  "#0F766E",
  "#4338CA",
  "#C2410C",
  "#0891B2",
] as const;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function compactLabel(value: string, maxLength = 20): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1)}…`;
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

function getNodeColor(node: PositionedNode, legend: FlowLegendItem[]): string {
  if (node.kind === "entry") {
    return "#1E3A8A";
  }

  if (node.kind === "exit") {
    return "#000000";
  }

  const firstFlowKey = node.flowKeys[0];
  if (!firstFlowKey) {
    return "#2563EB";
  }

  return legend.find((item) => item.key === firstFlowKey)?.color || "#2563EB";
}

function buildFlowColors(trees: ScreenFlowTree[]): Map<string, string> {
  return new Map(
    trees.map((tree, index) => [
      tree.rootScreen,
      FLOW_COLORS[index % FLOW_COLORS.length] || "#2563EB",
    ]),
  );
}

function aggregateGraph(
  data: ScreenFlowResponse,
): {
  nodes: GraphNode[];
  edges: GraphEdge[];
  legend: FlowLegendItem[];
  nodeFlowMap: Map<string, Set<string>>;
} {
  const flowColorMap = buildFlowColors(data.trees);
  const nodeMap = new Map<string, GraphNode>();
  const edgeMap = new Map<string, GraphEdge>();
  const nodeFlowMap = new Map<string, Set<string>>();

  nodeMap.set(APP_OPEN_NODE_ID, {
    id: APP_OPEN_NODE_ID,
    label: "App Open",
    stepNumber: -1,
    visits: data.summary.totalSessions,
    dropOff: 0,
    kind: "entry",
  });

  const markNodeFlow = (nodeId: string, flowKey: string) => {
    const current = nodeFlowMap.get(nodeId) ?? new Set<string>();
    current.add(flowKey);
    nodeFlowMap.set(nodeId, current);
  };

  const addNode = (node: GraphNode, flowKey?: string) => {
    const existing = nodeMap.get(node.id);
    if (existing) {
      existing.visits += node.visits;
      existing.dropOff += node.dropOff;
    } else {
      nodeMap.set(node.id, { ...node });
    }

    if (flowKey) {
      markNodeFlow(node.id, flowKey);
    }
  };

  const addEdge = (edge: GraphEdge) => {
    const key = `${edge.flowKey}:${edge.from}->${edge.to}:${edge.kind}`;
    const existing = edgeMap.get(key);
    if (existing) {
      existing.count += edge.count;
      return;
    }

    edgeMap.set(key, { ...edge });
  };

  data.trees.forEach((tree) => {
    const flowKey = tree.rootScreen;
    const flowColor = flowColorMap.get(flowKey) || "#2563EB";

    tree.steps.forEach((step) => {
      const exitStepNumber = step.stepNumber + 1;
      const exitNodeId = `Exit_step_${exitStepNumber}`;
      if (step.droppedAtStep > 0) {
        addNode(
          {
            id: exitNodeId,
            label: "Exit",
            stepNumber: exitStepNumber,
            visits: step.droppedAtStep,
            dropOff: 0,
            kind: "exit",
          },
          flowKey,
        );
      }

      step.nodes.forEach((node) => {
        addNode(
          {
            id: node.nodeId,
            label: node.screenName,
            stepNumber: node.stepNumber,
            visits: node.visits,
            dropOff: node.dropOff,
            kind: "screen",
          },
          flowKey,
        );

        if (node.dropOff > 0) {
          addEdge({
            from: node.nodeId,
            to: exitNodeId,
            count: node.dropOff,
            flowKey,
            flowColor: "#000000",
            percentage: node.dropOffPercentage,
            kind: "dropoff",
          });
        }
      });
    });

    const rootStep = tree.steps.find((step) => step.stepNumber === 0);
    if (rootStep) {
      rootStep.nodes.forEach((rootNode) => {
        addEdge({
          from: APP_OPEN_NODE_ID,
          to: rootNode.nodeId,
          count: rootNode.visits,
          flowKey,
          flowColor,
          percentage:
            data.summary.totalSessions > 0
              ? (rootNode.visits / data.summary.totalSessions) * 100
              : 0,
          kind: "entry",
        });
      });
    }

    tree.edges.forEach((edge: ScreenFlowEdge) => {
      addEdge({
        from: edge.from,
        to: edge.to,
        count: edge.count,
        flowKey,
        flowColor,
        percentage: edge.percentage,
        kind: "transition",
      });
    });
  });

  return {
    nodes: Array.from(nodeMap.values()).sort(
      (a, b) =>
        a.stepNumber - b.stepNumber ||
        b.visits - a.visits ||
        a.label.localeCompare(b.label),
    ),
    edges: Array.from(edgeMap.values()).sort((a, b) => b.count - a.count),
    legend: data.trees.map((tree) => ({
      key: tree.rootScreen,
      color: flowColorMap.get(tree.rootScreen) || "#2563EB",
      totalSessions: tree.totalSessions,
    })),
    nodeFlowMap,
  };
}

function buildLayout(
  nodes: GraphNode[],
  edges: GraphEdge[],
  nodeFlowMap: Map<string, Set<string>>,
) {
  const steps = Array.from(new Set(nodes.map((node) => node.stepNumber))).sort((a, b) => a - b);
  const columns = steps.map((stepNumber) =>
    nodes
      .filter((node) => node.stepNumber === stepNumber)
      .sort((a, b) => {
        if (a.kind === "entry") return -1;
        if (b.kind === "entry") return 1;
        if (a.kind === "exit" && b.kind !== "exit") return 1;
        if (b.kind === "exit" && a.kind !== "exit") return -1;
        return b.visits - a.visits || a.label.localeCompare(b.label);
      }),
  );

  const columnTotals = columns.map((column) =>
    column.reduce((sum, node) => sum + Math.max(node.visits, 1), 0),
  );
  const columnHeights = columns.map((column, index) => {
    const usableHeight =
      column.reduce((sum, node) => sum + Math.max(node.visits, 1), 0) +
      (Math.max(0, column.length - 1) * NODE_GAP);
    return Math.max(usableHeight, columnTotals[index] || 0);
  });

  const graphHeight = clamp(
    Math.max(560, ...columnHeights) + GRAPH_PADDING * 2 + STEP_LABEL_HEIGHT + GRAPH_BOTTOM_SAFE_SPACE,
    GRAPH_CANVAS_MIN_HEIGHT,
    GRAPH_CANVAS_MAX_HEIGHT,
  );
  const graphWidth =
    GRAPH_PADDING * 2 +
    GRAPH_RIGHT_SAFE_SPACE +
    (columns.length * NODE_WIDTH) +
    (Math.max(0, columns.length - 1) * COLUMN_GAP);

  const nodeScaleByColumn = columns.map((column, index) => {
    if (column.length === 0) return 1;
    const usableHeight =
      graphHeight -
      (GRAPH_PADDING * 2) -
      STEP_LABEL_HEIGHT -
      (Math.max(0, column.length - 1) * NODE_GAP);
    const totalVisits = columnTotals[index] || 1;
    return usableHeight / totalVisits;
  });

  const positionedNodes = new Map<string, PositionedNode>();

  columns.forEach((column, columnIndex) => {
    const x = GRAPH_PADDING + (columnIndex * (NODE_WIDTH + COLUMN_GAP));
    let currentY = GRAPH_PADDING + STEP_LABEL_HEIGHT;
    const scale = nodeScaleByColumn[columnIndex] || 1;

    column.forEach((node) => {
      const scaledHeight = Math.max(MIN_NODE_HEIGHT, Math.max(node.visits, 1) * scale);
      positionedNodes.set(node.id, {
        ...node,
        x,
        y: currentY,
        width: NODE_WIDTH,
        height: scaledHeight,
        flowKeys: Array.from(nodeFlowMap.get(node.id) ?? []),
      });
      currentY += scaledHeight + NODE_GAP;
    });
  });

  const outgoingOffsetByNode = new Map<string, number>();
  const incomingOffsetByNode = new Map<string, number>();
  const maxEdgeCount = Math.max(...edges.map((edge) => edge.count), 1);

  const paths: RenderPath[] = edges.flatMap((edge, index) => {
    const source = positionedNodes.get(edge.from);
    const target = positionedNodes.get(edge.to);
    if (!source || !target) {
      return [];
    }

    const normalizedCount = edge.count / maxEdgeCount;
    const thickness =
      EDGE_MIN_THICKNESS +
      (Math.sqrt(normalizedCount) * (EDGE_MAX_THICKNESS - EDGE_MIN_THICKNESS));

    const sourceOffset = outgoingOffsetByNode.get(source.id) ?? 0;
    const targetOffset = incomingOffsetByNode.get(target.id) ?? 0;
    outgoingOffsetByNode.set(source.id, sourceOffset + thickness);
    incomingOffsetByNode.set(target.id, targetOffset + thickness);

    const sourceX = source.x + source.width;
    const sourceY = source.y + sourceOffset + (thickness / 2);
    const targetX = target.x;
    const targetY = target.y + targetOffset + (thickness / 2);
    const controlOffset = Math.max(60, (targetX - sourceX) * 0.45);
    const labelX = (sourceX + targetX) / 2;
    const labelY = (sourceY + targetY) / 2;
    const path = [
      `M ${sourceX} ${sourceY}`,
      `C ${sourceX + controlOffset} ${sourceY}, ${targetX - controlOffset} ${targetY}, ${targetX} ${targetY}`,
    ].join(" ");

    return {
      ...edge,
      key: `${edge.flowKey}-${edge.from}-${edge.to}-${edge.kind}-${index}`,
      path,
      thickness,
      sourceLabel: source.label,
      targetLabel: target.label,
      labelX,
      labelY,
    };
  });

  return {
    steps,
    graphWidth,
    graphHeight,
    positionedNodes: Array.from(positionedNodes.values()),
    paths,
  };
}

export function ScreenFlowSankeyGraph({ data }: ScreenFlowSankeyGraphProps) {
  const [interaction, setInteraction] = useState<InteractionState>({ type: "idle" });
  const [zoom, setZoom] = useState(1);

  const graph = useMemo(() => aggregateGraph(data), [data]);
  const layout = useMemo(
    () => buildLayout(graph.nodes, graph.edges, graph.nodeFlowMap),
    [graph.edges, graph.nodeFlowMap, graph.nodes],
  );

  const canvasWidth = clamp(layout.graphWidth, GRAPH_CANVAS_MIN_WIDTH, GRAPH_CANVAS_MAX_WIDTH);
  const canvasHeight = clamp(layout.graphHeight, GRAPH_CANVAS_MIN_HEIGHT, GRAPH_CANVAS_MAX_HEIGHT);
  const zoomedCanvasWidth = Math.round(canvasWidth * zoom);
  const zoomedCanvasHeight = Math.round(canvasHeight * zoom);

  const edgeMap = useMemo(
    () => new Map(layout.paths.map((path) => [path.key, path])),
    [layout.paths],
  );

  const edgesByFlow = useMemo(() => {
    const map = new Map<string, RenderPath[]>();
    layout.paths.forEach((path) => {
      const current = map.get(path.flowKey) ?? [];
      current.push(path);
      map.set(path.flowKey, current);
    });
    return map;
  }, [layout.paths]);

  const pathsBySource = useMemo(() => {
    const map = new Map<string, RenderPath[]>();
    layout.paths.forEach((path) => {
      const current = map.get(path.from) ?? [];
      current.push(path);
      map.set(path.from, current);
    });
    return map;
  }, [layout.paths]);

  const pathsByTarget = useMemo(() => {
    const map = new Map<string, RenderPath[]>();
    layout.paths.forEach((path) => {
      const current = map.get(path.to) ?? [];
      current.push(path);
      map.set(path.to, current);
    });
    return map;
  }, [layout.paths]);

  const highlighted = useMemo(() => {
    const highlightedEdges = new Set<string>();
    const highlightedNodes = new Set<string>();
    let selectedEdge: RenderPath | null = null;

    if (interaction.type === "edge") {
      selectedEdge = edgeMap.get(interaction.edgeKey) ?? null;
      if (!selectedEdge) {
        return { highlightedEdges, highlightedNodes, selectedEdge };
      }

      const flowEdges = edgesByFlow.get(selectedEdge.flowKey) ?? [];
      const outgoing = new Map<string, RenderPath[]>();
      const incoming = new Map<string, RenderPath[]>();
      flowEdges.forEach((edge) => {
        const fromCurrent = outgoing.get(edge.from) ?? [];
        fromCurrent.push(edge);
        outgoing.set(edge.from, fromCurrent);

        const toCurrent = incoming.get(edge.to) ?? [];
        toCurrent.push(edge);
        incoming.set(edge.to, toCurrent);
      });

      highlightedEdges.add(selectedEdge.key);
      highlightedNodes.add(selectedEdge.from);
      highlightedNodes.add(selectedEdge.to);

      const backwardQueue = [selectedEdge.from];
      const visitedBackwardNodes = new Set<string>();

      while (backwardQueue.length > 0) {
        const nodeId = backwardQueue.shift();
        if (!nodeId || visitedBackwardNodes.has(nodeId)) {
          continue;
        }

        visitedBackwardNodes.add(nodeId);
        highlightedNodes.add(nodeId);

        const previousEdges = incoming.get(nodeId) ?? [];
        previousEdges.forEach((edge) => {
          highlightedEdges.add(edge.key);
          highlightedNodes.add(edge.from);
          if (!visitedBackwardNodes.has(edge.from)) {
            backwardQueue.push(edge.from);
          }
        });
      }

      const forwardQueue = [selectedEdge.to];
      const visitedForwardNodes = new Set<string>();

      while (forwardQueue.length > 0) {
        const nodeId = forwardQueue.shift();
        if (!nodeId || visitedForwardNodes.has(nodeId)) {
          continue;
        }

        visitedForwardNodes.add(nodeId);
        highlightedNodes.add(nodeId);

        const nextEdges = outgoing.get(nodeId) ?? [];
        nextEdges.forEach((edge) => {
          highlightedEdges.add(edge.key);
          highlightedNodes.add(edge.to);
          if (!visitedForwardNodes.has(edge.to)) {
            forwardQueue.push(edge.to);
          }
        });
      }
    }

    if (interaction.type === "node") {
      highlightedNodes.add(interaction.nodeId);
      const incomingPaths = pathsByTarget.get(interaction.nodeId) ?? [];
      const outgoingPaths = pathsBySource.get(interaction.nodeId) ?? [];

      incomingPaths.forEach((path) => {
        highlightedEdges.add(path.key);
        highlightedNodes.add(path.from);
      });

      outgoingPaths.forEach((path) => {
        highlightedEdges.add(path.key);
        highlightedNodes.add(path.to);
      });
    }

    return {
      highlightedEdges,
      highlightedNodes,
      selectedEdge,
    };
  }, [edgeMap, edgesByFlow, interaction, pathsBySource, pathsByTarget]);

  const selectedNode =
    interaction.type === "node"
      ? layout.positionedNodes.find((node) => node.id === interaction.nodeId) ?? null
      : null;

  const edgeLabelPositions = useMemo(() => {
    const highlightedPaths = layout.paths
      .filter((path) => highlighted.highlightedEdges.has(path.key))
      .sort((a, b) => a.labelX - b.labelX || a.labelY - b.labelY);

    const placed: Array<{ x: number; y: number }> = [];
    const positions = new Map<string, { x: number; y: number }>();

    const overlaps = (candidateX: number, candidateY: number) =>
      placed.some(
        (label) =>
          Math.abs(label.x - candidateX) < EDGE_LABEL_WIDTH &&
          Math.abs(label.y - candidateY) < (EDGE_LABEL_HEIGHT + EDGE_LABEL_GAP),
      );

    highlightedPaths.forEach((path) => {
      const baseX = path.labelX;
      const minY = EDGE_LABEL_HEIGHT / 2;
      const maxY = layout.graphHeight - (EDGE_LABEL_HEIGHT / 2);

      let resolvedY = clamp(path.labelY, minY, maxY);

      if (overlaps(baseX, resolvedY)) {
        for (let attempt = 1; attempt <= 16; attempt += 1) {
          const direction = attempt % 2 === 1 ? 1 : -1;
          const step = Math.ceil(attempt / 2);
          const candidateY = clamp(
            path.labelY + (direction * step * (EDGE_LABEL_HEIGHT + EDGE_LABEL_GAP)),
            minY,
            maxY,
          );

          if (!overlaps(baseX, candidateY)) {
            resolvedY = candidateY;
            break;
          }
        }
      }

      placed.push({ x: baseX, y: resolvedY });
      positions.set(path.key, { x: baseX, y: resolvedY });
    });

    return positions;
  }, [highlighted.highlightedEdges, layout.graphHeight, layout.paths]);

  return (
    <section className={styles.graphCard}>
      <div className={styles.graphHeader}>
        <div>
          <p className={styles.graphEyebrow}>Graph View</p>
          <h3 className={styles.graphTitle}>Sankey-style Session Flow</h3>
        </div>
        <p className={styles.graphSubtitle}>
          Starts from synthetic <strong>Step -1 / App Open</strong>, then fans into all step 0 roots and continues through merged flow transitions. Each root flow has its own color, exit is shown at every step, and edge details open on click.
        </p>
      </div>

      <div className={styles.graphToolbar}>
        <div className={styles.graphZoomControls}>
          <button
            type="button"
            className={styles.graphZoomButton}
            onClick={() => setZoom((current) => clamp(Number((current - ZOOM_STEP).toFixed(2)), ZOOM_MIN, ZOOM_MAX))}
            disabled={zoom <= ZOOM_MIN}
            aria-label="Zoom out graph"
            title="Zoom out"
          >
            -
          </button>
          <span className={styles.graphZoomValue}>{Math.round(zoom * 100)}%</span>
          <button
            type="button"
            className={styles.graphZoomButton}
            onClick={() => setZoom((current) => clamp(Number((current + ZOOM_STEP).toFixed(2)), ZOOM_MIN, ZOOM_MAX))}
            disabled={zoom >= ZOOM_MAX}
            aria-label="Zoom in graph"
            title="Zoom in"
          >
            +
          </button>
        </div>
      </div>

      <div className={styles.flowLegend}>
        {graph.legend.map((item) => (
          <div key={item.key} className={styles.flowLegendItem}>
            <span
              className={styles.flowLegendSwatch}
              style={{ backgroundColor: item.color }}
              aria-hidden="true"
            />
            <span className={styles.flowLegendLabel}>{compactLabel(item.key, 28)}</span>
            <span className={styles.flowLegendMeta}>{item.totalSessions} sessions</span>
          </div>
        ))}
      </div>

      <div className={styles.graphViewport}>
        <div
          className={styles.graphCanvas}
          style={{
            width: `${zoomedCanvasWidth}px`,
            height: `${zoomedCanvasHeight}px`,
          }}
        >
          <svg
            className={styles.graphSvg}
            viewBox={`0 0 ${layout.graphWidth} ${layout.graphHeight}`}
            preserveAspectRatio="xMinYMin meet"
            role="img"
            aria-label="Screen flow sankey graph"
            style={{
              width: `${canvasWidth}px`,
              height: `${canvasHeight}px`,
              transform: `scale(${zoom})`,
              transformOrigin: "top left",
            }}
          >
            {layout.steps.map((stepNumber, index) => {
              const x = GRAPH_PADDING + (index * (NODE_WIDTH + COLUMN_GAP));
              return (
                <g key={stepNumber}>
                  <text x={x} y={GRAPH_PADDING} className={styles.graphStepLabel}>
                    {stepNumber === -1 ? "Step -1" : `Step ${stepNumber}`}
                  </text>
                  <text x={x} y={GRAPH_PADDING + 16} className={styles.graphStepHint}>
                    {stepNumber === -1 ? "App Open" : "Screens and Exit"}
                  </text>
                </g>
              );
            })}

            {layout.paths.map((path) => (
              <g key={path.key}>
                <path
                  d={path.path}
                  className={`${styles.graphEdge} ${highlighted.highlightedEdges.has(path.key) ? styles.graphEdgeSelected : ""}`}
                  style={{
                    stroke: path.flowColor,
                    strokeWidth: path.thickness,
                    opacity:
                      interaction.type === "idle"
                        ? EDGE_OPACITY
                        : highlighted.highlightedEdges.has(path.key)
                          ? 0.82
                          : 0.08,
                  }}
                  onClick={() => setInteraction({ type: "edge", edgeKey: path.key })}
                >
                  <title>{`${path.flowKey}\n${path.sourceLabel} → ${path.targetLabel}\n${path.count} transitions\n${formatPercent(path.percentage)}`}</title>
                </path>
              </g>
            ))}

            {layout.positionedNodes.map((node) => (
              <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                <rect
                  width={node.width}
                  height={node.height}
                  rx={0}
                  ry={0}
                  className={`${styles.graphNode} ${node.kind === "exit" ? styles.graphExitNode : ""} ${highlighted.highlightedNodes.has(node.id) ? styles.graphNodeHighlighted : ""}`}
                  fill={getNodeColor(node, graph.legend)}
                  onClick={() => setInteraction({ type: "node", nodeId: node.id })}
                  style={{
                    opacity:
                      interaction.type === "idle"
                        ? 1
                        : highlighted.highlightedNodes.has(node.id)
                          ? 1
                          : 0.22,
                    cursor: "pointer",
                  }}
                >
                  <title>{`${node.label}\nStep ${node.stepNumber}\nVisits: ${node.visits}\nDrop-off: ${node.dropOff}`}</title>
                </rect>

                <text x={node.width + NODE_TEXT_GAP} y={16} className={styles.graphNodeTitle}>
                  {node.label}
                </text>
                <text x={node.width + NODE_TEXT_GAP} y={30} className={styles.graphNodeMeta}>
                  {node.kind === "exit" ? `${node.visits} exits` : `${node.visits} visits`}
                </text>
              </g>
            ))}

            {layout.paths.map((path) =>
              highlighted.highlightedEdges.has(path.key) && edgeLabelPositions.get(path.key) ? (
                <g
                  key={`${path.key}-label`}
                  className={styles.graphEdgeLabel}
                  transform={`translate(${edgeLabelPositions.get(path.key)?.x}, ${edgeLabelPositions.get(path.key)?.y})`}
                >
                  <rect
                    x={-(EDGE_LABEL_WIDTH / 2)}
                    y={-10}
                    width={EDGE_LABEL_WIDTH}
                    height={EDGE_LABEL_HEIGHT}
                    rx={6}
                    ry={6}
                    className={styles.graphEdgeLabelBg}
                    style={{ fill: path.flowColor }}
                  />
                  <text
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className={styles.graphEdgeLabelText}
                  >
                    {`${path.count} • ${formatPercent(path.percentage)}`}
                  </text>
                </g>
              ) : null,
            )}
          </svg>
        </div>
      </div>

      <div className={styles.graphDetailsPanel}>
        {interaction.type === "edge" && highlighted.selectedEdge ? (
          <>
            <div className={styles.graphDetailsHeader}>
              <div className={styles.graphDetailsFlow}>
                <span
                  className={styles.graphDetailsSwatch}
                  style={{ backgroundColor: highlighted.selectedEdge.flowColor }}
                  aria-hidden="true"
                />
                <span>{highlighted.selectedEdge.flowKey}</span>
              </div>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setInteraction({ type: "idle" })}
              >
                Clear
              </button>
            </div>
            <div className={styles.graphDetailsGrid}>
              <div>
                <p className={styles.graphDetailsLabel}>From</p>
                <p className={styles.graphDetailsValue}>{highlighted.selectedEdge.sourceLabel}</p>
              </div>
              <div>
                <p className={styles.graphDetailsLabel}>To</p>
                <p className={styles.graphDetailsValue}>{highlighted.selectedEdge.targetLabel}</p>
              </div>
              <div>
                <p className={styles.graphDetailsLabel}>Traffic</p>
                <p className={styles.graphDetailsValue}>{highlighted.selectedEdge.count} sessions</p>
              </div>
              <div>
                <p className={styles.graphDetailsLabel}>Percentage</p>
                <p className={styles.graphDetailsValue}>{formatPercent(highlighted.selectedEdge.percentage)}</p>
              </div>
              <div>
                <p className={styles.graphDetailsLabel}>Edge Type</p>
                <p className={styles.graphDetailsValue}>{highlighted.selectedEdge.kind}</p>
              </div>
              <div>
                <p className={styles.graphDetailsLabel}>Highlight Mode</p>
                <p className={styles.graphDetailsValue}>Full stream from Step -1 to terminal node</p>
              </div>
            </div>
          </>
        ) : interaction.type === "node" && selectedNode ? (
          <>
            <div className={styles.graphDetailsHeader}>
              <div className={styles.graphDetailsFlow}>
                <span>{selectedNode.label}</span>
              </div>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setInteraction({ type: "idle" })}
              >
                Clear
              </button>
            </div>
            <div className={styles.graphDetailsGrid}>
              <div>
                <p className={styles.graphDetailsLabel}>Node</p>
                <p className={styles.graphDetailsValue}>{selectedNode.label}</p>
              </div>
              <div>
                <p className={styles.graphDetailsLabel}>Step</p>
                <p className={styles.graphDetailsValue}>{selectedNode.stepNumber}</p>
              </div>
              <div>
                <p className={styles.graphDetailsLabel}>
                  {selectedNode.kind === "exit" ? "Incoming Edges" : "Outgoing Edges"}
                </p>
                <p className={styles.graphDetailsValue}>
                  {selectedNode.kind === "exit"
                    ? layout.paths.filter((path) => path.to === selectedNode.id).length
                    : layout.paths.filter((path) => path.from === selectedNode.id).length}
                </p>
              </div>
              <div>
                <p className={styles.graphDetailsLabel}>Highlight Mode</p>
                <p className={styles.graphDetailsValue}>
                  {selectedNode.kind === "exit"
                    ? "Immediate backward flow into Exit for one step"
                    : "Immediate outgoing flow for one step"}
                </p>
              </div>
            </div>
          </>
        ) : (
          <p className={styles.graphFootnote}>
            Click an edge to highlight its full stream from Step -1 to its terminal node. Click a node to highlight only its next-step outgoing flow.
          </p>
        )}
      </div>
    </section>
  );
}
