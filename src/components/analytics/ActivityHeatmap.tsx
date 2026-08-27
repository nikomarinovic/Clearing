import { useMemo, useState } from "react";
import { useAppData } from "../../hooks/useAppData";
import { addDaysIso, formatDate, todayIso } from "../../lib/format";
import type { AppData } from "../../types";

interface DayActivity {
  date: string;
  count: number;
}

/** How many transactions (income + expenses) were logged with this exact date, per day, over the trailing window. */
function buildActivity(data: AppData, days: number): DayActivity[] {
  const today = todayIso();
  const start = addDaysIso(today, -(days - 1));
  const counts = new Map<string, number>();

  for (const entry of data.income) {
    if (entry.date < start || entry.date > today) continue;
    counts.set(entry.date, (counts.get(entry.date) ?? 0) + 1);
  }
  for (const entry of data.expenses) {
    if (entry.date < start || entry.date > today) continue;
    counts.set(entry.date, (counts.get(entry.date) ?? 0) + 1);
  }

  const out: DayActivity[] = [];
  for (let i = 0; i < days; i++) {
    const date = addDaysIso(start, i);
    out.push({ date, count: counts.get(date) ?? 0 });
  }
  return out;
}

/** GitHub uses 5 buckets (0 + 4 intensity levels). Thresholds scale with the busiest day so a habit of 1-2 logs/day still lights up. */
function intensityClass(count: number, max: number): string {
  if (count === 0) return "bg-[var(--surface-2)]";
  if (max <= 1) return "bg-[var(--accent-green)]";
  const ratio = count / max;
  if (ratio <= 0.25) return "bg-[var(--accent-green)]/25";
  if (ratio <= 0.5) return "bg-[var(--accent-green)]/50";
  if (ratio <= 0.75) return "bg-[var(--accent-green)]/75";
  return "bg-[var(--accent-green)]";
}

export function ActivityHeatmap({ weeks = 18 }: { weeks?: number }) {
  const { data } = useAppData();
  const days = weeks * 7;
  const activity = useMemo(() => buildActivity(data, days), [data, days]);
  const [hovered, setHovered] = useState<DayActivity | null>(null);
  const max = Math.max(1, ...activity.map((d) => d.count));

  // Group into week columns, Monday-first, padded so the grid stays rectangular.
  const columns = useMemo(() => {
    const cols: DayActivity[][] = [];
    let col: DayActivity[] = [];
    const firstDow = (new Date(activity[0].date).getDay() + 6) % 7; // Mon=0
    for (let i = 0; i < firstDow; i++) col.push({ date: "", count: -1 });
    for (const d of activity) {
      col.push(d);
      if (col.length === 7) {
        cols.push(col);
        col = [];
      }
    }
    if (col.length > 0) cols.push(col);
    return cols;
  }, [activity]);

  const totalLogs = activity.reduce((s, d) => s + d.count, 0);
  const activeDays = activity.filter((d) => d.count > 0).length;

  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between">
        <p className="text-[13px] text-[var(--text-muted)]">
          <span className="font-semibold text-[var(--text)]">{totalLogs}</span> transactions logged over the last{" "}
          {weeks * 7} days
        </p>
        <p className="text-[12px] text-[var(--text-faint)]">{activeDays} active days</p>
      </div>

      <div className="overflow-x-auto">
        <div className="flex gap-[3px]">
          {columns.map((col, ci) => (
            <div key={ci} className="flex flex-col gap-[3px]">
              {col.map((d, di) =>
                d.count === -1 ? (
                  <div key={di} className="h-[11px] w-[11px]" />
                ) : (
                  <div
                    key={di}
                    onMouseEnter={() => setHovered(d)}
                    onMouseLeave={() => setHovered(null)}
                    className={`h-[11px] w-[11px] rounded-[3px] transition-colors ${intensityClass(d.count, max)}`}
                    title={`${formatDate(d.date)}: ${d.count} logged`}
                  />
                ),
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-2.5 flex items-center justify-between text-[11px] text-[var(--text-faint)]">
        <span>{hovered ? `${formatDate(hovered.date)} \u2014 ${hovered.count} logged` : "Less"}</span>
        <div className="flex items-center gap-1">
          {!hovered && (
            <>
              <span>Less</span>
              <span className="h-[10px] w-[10px] rounded-[2px] bg-[var(--surface-2)]" />
              <span className="h-[10px] w-[10px] rounded-[2px] bg-[var(--accent-green)]/25" />
              <span className="h-[10px] w-[10px] rounded-[2px] bg-[var(--accent-green)]/50" />
              <span className="h-[10px] w-[10px] rounded-[2px] bg-[var(--accent-green)]/75" />
              <span className="h-[10px] w-[10px] rounded-[2px] bg-[var(--accent-green)]" />
              <span>More</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
