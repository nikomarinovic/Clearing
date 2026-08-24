import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Select } from "../ui/Field";
import { EXPENSE_CATEGORIES, colorForCategory } from "../../lib/categories";
import { formatCurrency, monthEndIso, todayIso } from "../../lib/format";
import { spendingByCategory } from "../../lib/calculations";
import { useAppData } from "../../hooks/useAppData";
import type { ExpenseCategory } from "../../types";

export function CategoryBudgets() {
  const { data, updateSettings } = useAppData();
  const { budgets } = data.settings;
  const [newCategory, setNewCategory] = useState<ExpenseCategory>("Food");
  const [newLimit, setNewLimit] = useState("");

  const today = todayIso();
  const monthStart = `${today.slice(0, 7)}-01`;
  const spend = spendingByCategory(data.expenses, monthStart, monthEndIso(today));

  const availableCategories = EXPENSE_CATEGORIES.filter((c) => !budgets.some((b) => b.category === c));

  const addBudget = () => {
    const limit = Number.parseFloat(newLimit);
    if (!newCategory || Number.isNaN(limit) || limit <= 0) return;
    updateSettings({ budgets: [...budgets, { category: newCategory, limit }] });
    setNewLimit("");
    const next = availableCategories.filter((c) => c !== newCategory)[0];
    if (next) setNewCategory(next);
  };

  const removeBudget = (category: string) => {
    updateSettings({ budgets: budgets.filter((b) => b.category !== category) });
  };

  const updateLimit = (category: string, limit: number) => {
    updateSettings({ budgets: budgets.map((b) => (b.category === category ? { ...b, limit } : b)) });
  };

  return (
    <Card>
      <h2 className="mb-1 text-[15px] font-semibold text-[var(--text)]">Category budgets</h2>
      <p className="mb-4 text-[13px] text-[var(--text-muted)]">
        Set a monthly limit per category to see how close you are, and get a reminder when you go over.
      </p>

      <div className="flex flex-col gap-3">
        {budgets.length === 0 && (
          <p className="text-[13px] text-[var(--text-faint)]">No budgets set yet — add one below.</p>
        )}
        {budgets.map((budget) => {
          const spent = spend[budget.category] ?? 0;
          const pct = budget.limit > 0 ? Math.min(100, Math.round((spent / budget.limit) * 100)) : 0;
          const over = spent > budget.limit;
          return (
            <div key={budget.category} className="rounded-[14px] border border-[var(--border)] p-3.5">
              <div className="mb-2 flex items-center justify-between text-[13.5px]">
                <span className="flex items-center gap-2 font-medium text-[var(--text)]">
                  <span className="h-2 w-2 rounded-full" style={{ background: colorForCategory(budget.category) }} />
                  {budget.category}
                </span>
                <span className={over ? "font-medium text-[var(--accent-red)]" : "text-[var(--text-muted)]"}>
                  {formatCurrency(spent)} / {formatCurrency(budget.limit)}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-2)]">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${pct}%`,
                    background: over ? "var(--accent-red)" : colorForCategory(budget.category),
                  }}
                />
              </div>
              <div className="mt-2.5 flex items-center gap-2">
                <input
                  type="number"
                  value={budget.limit}
                  onChange={(e) => updateLimit(budget.category, Number.parseFloat(e.target.value) || 0)}
                  className="w-24 rounded-[10px] border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-[13px] text-[var(--text)]"
                />
                <button
                  type="button"
                  onClick={() => removeBudget(budget.category)}
                  className="ml-auto rounded-full p-1.5 text-[var(--text-faint)] hover:bg-[var(--accent-red-bg)] hover:text-[var(--accent-red)]"
                  aria-label={`Remove ${budget.category} budget`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {availableCategories.length > 0 && (
        <div className="mt-4 flex items-center gap-2 border-t border-[var(--border)] pt-4">
          <Select value={newCategory} onChange={(e) => setNewCategory(e.target.value as ExpenseCategory)} className="flex-1">
            {availableCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <input
            type="number"
            value={newLimit}
            onChange={(e) => setNewLimit(e.target.value)}
            placeholder="Limit"
            className="w-24 rounded-[10px] border border-[var(--border)] bg-[var(--surface)] px-2.5 py-2 text-[13px] text-[var(--text)] placeholder:text-[var(--text-faint)]"
          />
          <Button size="sm" variant="secondary" icon={<Plus size={14} />} onClick={addBudget}>
            Add
          </Button>
        </div>
      )}
    </Card>
  );
}
