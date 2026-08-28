import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { colorForCategory } from "../../lib/categories";
import { formatCurrency } from "../../lib/format";

export function CategoryDonutChart({ data }: { data: { category: string; amount: number }[] }) {
  const total = data.reduce((s, d) => s + d.amount, 0);

  if (total === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-[var(--text-faint)]">
        No spending recorded yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-[minmax(0,180px)_1fr]">
      <div className="relative h-48 w-48 justify-self-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="amount"
              nameKey="category"
              innerRadius="68%"
              outerRadius="100%"
              paddingAngle={2}
              stroke="none"
            >
              {data.map((d) => (
                <Cell key={d.category} fill={colorForCategory(d.category)} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [formatCurrency(Number(value) || 0), String(name)]}
              contentStyle={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                fontSize: 12,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="num text-lg font-semibold text-[var(--text)]">{formatCurrency(total)}</span>
          <span className="text-[11px] text-[var(--text-faint)]">total</span>
        </div>
      </div>
      <ul className="space-y-2">
        {data
          .slice()
          .sort((a, b) => b.amount - a.amount)
          .map((d) => (
            <li key={d.category} className="flex items-center justify-between text-[13px]">
              <span className="flex items-center gap-2 text-[var(--text)]">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: colorForCategory(d.category) }} />
                {d.category}
              </span>
              <span className="num flex items-center gap-2 text-[var(--text-muted)]">
                {Math.round((d.amount / total) * 100)}%
                <span className="text-[var(--text)]">{formatCurrency(d.amount)}</span>
              </span>
            </li>
          ))}
      </ul>
    </div>
  );
}
