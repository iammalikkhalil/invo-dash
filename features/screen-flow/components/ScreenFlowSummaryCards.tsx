import styles from "@/features/screen-flow/styles/screen-flow.module.css";
import type { ScreenFlowResponse } from "@/features/screen-flow/types";

interface ScreenFlowSummaryCardsProps {
  data: ScreenFlowResponse;
}

function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function ScreenFlowSummaryCards({ data }: ScreenFlowSummaryCardsProps) {
  const averageSessionsPerTree =
    data.summary.totalTrees > 0
      ? data.summary.totalSessions / data.summary.totalTrees
      : 0;

  const deepestTreeSteps = data.trees.reduce(
    (max, tree) => Math.max(max, tree.totalSteps),
    0,
  );

  const cards = [
    { label: "Sessions", value: formatCompactNumber(data.summary.totalSessions) },
    { label: "Root Trees", value: formatCompactNumber(data.summary.totalTrees) },
    { label: "Avg Sessions / Tree", value: averageSessionsPerTree.toFixed(1) },
    { label: "Deepest Flow", value: `${deepestTreeSteps} steps` },
  ];

  return (
    <section className={styles.summaryGrid}>
      {cards.map((card) => (
        <article key={card.label} className={styles.summaryCard}>
          <p className={styles.summaryLabel}>{card.label}</p>
          <p className={styles.summaryValue}>{card.value}</p>
        </article>
      ))}
    </section>
  );
}
