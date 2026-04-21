import styles from "@/features/screen-flow/styles/screen-flow.module.css";
import type { ScreenFlowEdge, ScreenFlowTree } from "@/features/screen-flow/types";

interface ScreenFlowTreeCardProps {
  tree: ScreenFlowTree;
}

function edgeLabel(edge: ScreenFlowEdge): string {
  return `${edge.count} transitions (${edge.percentage.toFixed(1)}%)`;
}

export function ScreenFlowTreeCard({ tree }: ScreenFlowTreeCardProps) {
  return (
    <article className={styles.treeCard}>
      <div className={styles.treeHeader}>
        <div>
          <p className={styles.treeEyebrow}>Root Screen</p>
          <h3 className={styles.treeTitle}>{tree.rootScreen}</h3>
        </div>
        <div className={styles.treeStats}>
          <span className={styles.treeStatChip}>{tree.totalSessions} sessions</span>
          <span className={styles.treeStatChip}>{tree.totalSteps} steps</span>
          <span className={styles.treeStatChip}>{tree.edges.length} edges</span>
        </div>
      </div>

      <div className={styles.stepsScroller}>
        <div className={styles.stepsGrid}>
          {tree.steps.map((step) => (
            <section key={step.stepNumber} className={styles.stepColumn}>
              <div className={styles.stepHeader}>
                <p className={styles.stepTitle}>Step {step.stepNumber}</p>
                <p className={styles.stepMeta}>{step.totalVisitsAtStep} visits</p>
                <p className={styles.stepDropOff}>{step.droppedAtStep} dropped</p>
              </div>

              <div className={styles.nodesList}>
                {step.nodes.map((node) => (
                  <article key={node.nodeId} className={styles.nodeCard}>
                    <div className={styles.nodeTopRow}>
                      <p className={styles.nodeName}>{node.screenName}</p>
                      <span className={styles.nodeVisits}>{node.visits}</span>
                    </div>
                    <div className={styles.nodeBottomRow}>
                      <span>Drop-off {node.dropOff}</span>
                      <span>{node.dropOffPercentage.toFixed(1)}%</span>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      <div className={styles.transitionsBlock}>
        <div className={styles.transitionsHeader}>
          <h4 className={styles.transitionsTitle}>Transitions</h4>
          <p className={styles.transitionsSubtitle}>Top edges ordered by count from the API</p>
        </div>

        {tree.edges.length === 0 ? (
          <p className={styles.emptyCopy}>No transitions recorded for this root screen.</p>
        ) : (
          <div className={styles.edgeList}>
            {tree.edges.map((edge) => (
              <div key={`${edge.from}-${edge.to}`} className={styles.edgeItem}>
                <div className={styles.edgeRoute}>
                  <span className={styles.edgeNode}>{edge.from}</span>
                  <span className={styles.edgeArrow}>→</span>
                  <span className={styles.edgeNode}>{edge.to}</span>
                </div>
                <span className={styles.edgeMetric}>{edgeLabel(edge)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
