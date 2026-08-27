import type { ProjectionEvent } from "../../types";
import { formatCurrency, formatDate } from "../../lib/format";
import { EmptyState } from "../ui/EmptyState";
import { CalendarClock } from "lucide-react";

export function UpcomingList({ events }: { events: ProjectionEvent[] }) {
  const upcoming = events.slice(0, 6);

  if (upcoming.length === 0) {
    return (
      <EmptyState
        icon={<CalendarClock size={20} />}
        title="Nothing upcoming"
        description="Add income or planned expenses to see what's coming up."
      />
    );
  }

  return (
    <ul className="divide-y divide-[var(--border)]">
      {upcoming.map((e) => (
        <li key={e.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
          <div>
            <p className="text-[14px] font-medium text-[var(--text)]">{e.label}</p>
            <p className="text-xs text-[var(--text-faint)]">{formatDate(e.date)}</p>
          </div>
          <span className={`num text-[14px] font-medium ${e.kind === "income" ? "text-[var(--accent-green)]" : "text-[var(--accent-red)]"}`}>
            {e.amount > 0 ? "+" : ""}
            {formatCurrency(e.amount)}
          </span>
        </li>
      ))}
    </ul>
  );
}
