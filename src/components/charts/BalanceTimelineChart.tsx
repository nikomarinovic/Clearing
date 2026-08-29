import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import type { ProjectionPoint } from "../../types";
import { formatCurrency, formatDate } from "../../lib/format";

function TooltipContent({ active, payload }: { active?: boolean; payload?: { payload: ProjectionPoint }[] }) {
  if (!active || !payload || !payload.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-[12px] border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-xs shadow-[var(--shadow-md)]">
      <p className="font-medium text-[var(--text)]">{formatDate(point.date)}</p>
      <p className="num mt-0.5 text-[var(--text)]">{formatCurrency(point.balance)}</p>
      {point.events.length > 0 && (
        <div className="mt-1.5 space-y-0.5 border-t border-[var(--border)] pt-1.5">
          {point.events.slice(0, 3).map((e) => (
            <p key={e.id} className={e.kind === "income" ? "text-[var(--accent-green)]" : "text-[var(--accent-red)]"}>
              {e.label} {e.amount > 0 ? "+" : ""}
              {formatCurrency(e.amount)}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

export function BalanceTimelineChart({ points }: { points: ProjectionPoint[] }) {
  return (
    <div className="h-44 w-full sm:h-56">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="balanceFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent-blue)" stopOpacity={0.22} />
              <stop offset="100%" stopColor="var(--accent-blue)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis
            dataKey="date"
            tickFormatter={(d: string) => formatDate(d)}
            tick={{ fontSize: 11, fill: "var(--text-faint)" }}
            axisLine={false}
            tickLine={false}
            minTickGap={40}
          />
          <YAxis
            tickFormatter={(v: number) => formatCurrency(v).replace(/\.00$/, "")}
            tick={{ fontSize: 11, fill: "var(--text-faint)" }}
            axisLine={false}
            tickLine={false}
            width={64}
          />
          <Tooltip content={<TooltipContent />} />
          <Area
            type="monotone"
            dataKey="balance"
            stroke="var(--accent-blue)"
            strokeWidth={2.25}
            fill="url(#balanceFill)"
            activeDot={{ r: 4.5, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
