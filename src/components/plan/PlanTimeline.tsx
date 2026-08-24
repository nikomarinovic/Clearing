import type { ProjectionPoint } from "../../types";
import { formatCurrency, formatDate } from "../../lib/format";
import { EmptyState } from "../ui/EmptyState";
import { History } from "lucide-react";

export function Timeline({ points }: { points: ProjectionPoint[] }) {
  const withEvents = points.filter((p) => p.events.length > 0);

  if (withEvents.length === 0) {
    return (
      <EmptyState
        icon={<History size={20} />}
        title="No events in this window"
        description="Income and planned expenses in this period will appear here, in order."
      />
    );
  }

  return (
    <ol className="relative border-l border-[var(--border)] pl-5">
      {withEvents.map((point) => (
        <li key={point.date} className="mb-5 last:mb-0">
          <span className="absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full bg-[var(--text)]" />
          <p className="text-[13px] font-medium text-[var(--text-muted)]">{formatDate(point.date)}</p>
          <div className="mt-1.5 space-y-1.5">
            {point.events.map((e) => (
              <div key={e.id} className="flex items-center justify-between text-[14px]">
                <span className="text-[var(--text)]">{e.label}</span>
                <span className={`num font-medium ${e.kind === "income" ? "text-[var(--accent-green)]" : "text-[var(--accent-red)]"}`}>
                  {e.amount > 0 ? "+" : ""}
                  {formatCurrency(e.amount)}
                </span>
              </div>
            ))}
          </div>
          <p className="num mt-1.5 text-xs text-[var(--text-faint)]">Balance: {formatCurrency(point.balance)}</p>
        </li>
      ))}
    </ol>
  );
}
