import { useMemo } from "react";
import { PageHeader } from "../components/common/PageHeader";
import { Card } from "../components/ui/Card";
import { CategoryDonutChart } from "../components/charts/CategoryDonutChart";
import { MonthlySpendingChart } from "../components/charts/MonthlySpendingChart";
import { IncomeExpenseChart } from "../components/charts/IncomeExpenseChart";
import { BalanceTimelineChart } from "../components/charts/BalanceTimelineChart";
import { CategoryBudgets } from "../components/analytics/CategoryBudgets";
import { useAppData } from "../hooks/useAppData";
import { buildProjection, monthlyTotals, spendingByCategory } from "../lib/calculations";
import { addDaysIso, formatCurrency, todayIso } from "../lib/format";

export default function AnalyticsPage() {
  const { data } = useAppData();

  const categoryData = useMemo(() => {
    const totals = spendingByCategory(data.expenses);
    return Object.entries(totals).map(([category, amount]) => ({ category, amount }));
  }, [data.expenses]);

  const months = useMemo(() => monthlyTotals(data.income, data.expenses, 5, 0), [data.income, data.expenses]);

  const projection = useMemo(() => buildProjection(data, { to: addDaysIso(todayIso(), 60) }), [data]);

  const plannedVsActual = useMemo(() => {
    const planned = data.expenses.filter((e) => e.status === "planned" || e.status === "confirmed").reduce((s, e) => s + e.amount, 0);
    const actual = data.expenses.filter((e) => e.status === "paid").reduce((s, e) => s + e.amount, 0);
    return { planned, actual };
  }, [data.expenses]);

  return (
    <div className="pb-6">
      <PageHeader title="Analytics" subtitle="Patterns in how you earn and spend." />

      <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-[15px] font-semibold text-[var(--text)]">Spending by category</h2>
          <CategoryDonutChart data={categoryData} />
        </Card>

        <CategoryBudgets />

        <Card>
          <h2 className="mb-4 text-[15px] font-semibold text-[var(--text)]">Monthly spending</h2>
          <MonthlySpendingChart data={months.map((m) => ({ month: m.month, expenses: m.expenses }))} />
        </Card>

        <Card>
          <h2 className="mb-4 text-[15px] font-semibold text-[var(--text)]">Income vs expenses</h2>
          <IncomeExpenseChart data={months} />
        </Card>

        <Card>
          <h2 className="mb-4 text-[15px] font-semibold text-[var(--text)]">Projected balance</h2>
          <BalanceTimelineChart points={projection.points} />
        </Card>

        <Card className="lg:col-span-2">
          <h2 className="mb-4 text-[15px] font-semibold text-[var(--text)]">Planned vs actual</h2>
          <p className="mb-4 text-[13px] text-[var(--text-muted)]">
            Especially useful if your income and spending vary month to month.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-[14px] border border-[var(--border)] p-4">
              <p className="text-[12px] font-medium text-[var(--text-muted)]">Planned</p>
              <p className="num mt-1 text-[19px] font-semibold text-[var(--text)]">{formatCurrency(plannedVsActual.planned)}</p>
            </div>
            <div className="rounded-[14px] border border-[var(--border)] p-4">
              <p className="text-[12px] font-medium text-[var(--text-muted)]">Actual</p>
              <p className="num mt-1 text-[19px] font-semibold text-[var(--text)]">{formatCurrency(plannedVsActual.actual)}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
