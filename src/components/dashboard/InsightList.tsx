import { Lightbulb } from "lucide-react";
import type { Insight } from "../../lib/insights";

const toneStyles: Record<Insight["tone"], string> = {
  positive: "border-l-[var(--accent-green)]",
  warning: "border-l-[var(--accent-red)]",
  neutral: "border-l-[var(--accent-blue)]",
};

export function InsightList({ insights }: { insights: Insight[] }) {
  if (insights.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      {insights.map((insight) => (
        <div
          key={insight.id}
          className={`flex items-start gap-2.5 rounded-[12px] border-l-[3px] bg-[var(--surface-2)]/60 px-3.5 py-3 text-[13.5px] leading-snug text-[var(--text)] ${toneStyles[insight.tone]}`}
        >
          <Lightbulb size={15} className="mt-0.5 shrink-0 text-[var(--text-muted)]" />
          <span>{insight.text}</span>
        </div>
      ))}
    </div>
  );
}
