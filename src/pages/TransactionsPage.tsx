import { useMemo, useState } from "react";
import { Download, Inbox, Search, SlidersHorizontal, X } from "lucide-react";
import { PageHeader } from "../components/common/PageHeader";
import { Card } from "../components/ui/Card";
import { Select } from "../components/ui/Field";
import { TransactionItem } from "../components/transactions/TransactionItem";
import { EmptyState } from "../components/ui/EmptyState";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { useAppData } from "../hooks/useAppData";
import { useToast } from "../hooks/useToast";
import { EXPENSE_CATEGORIES } from "../lib/categories";
import { formatDate } from "../lib/format";
import type { ExpenseEntry, IncomeEntry } from "../types";
import clsx from "clsx";

type Filter = "all" | "income" | "expense";

interface UnifiedRow {
  id: string;
  kind: "income" | "expense";
  date: string;
}

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export default function TransactionsPage() {
  const { data, deleteIncome, deleteExpense } = useAppData();
  const { showToast } = useToast();
  const [filter, setFilter] = useState<Filter>("all");
  const [pendingDelete, setPendingDelete] = useState<UnifiedRow | null>(null);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  // Empty = no date restriction, so the list isn't silently limited to a
  // window while someone is actively searching for something older.
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  // Kept separate per kind: expense statuses ("paid"/"planned") and income
  // statuses ("received"/"confirmed"/"forecast") don't overlap, so sharing
  // one variable meant picking a status while looking at expenses silently
  // hid every income row once you switched tabs (and vice versa).
  const [expenseStatusFilter, setExpenseStatusFilter] = useState<string>("");
  const [incomeStatusFilter, setIncomeStatusFilter] = useState<string>("");

  const findEntry = (row: UnifiedRow) =>
    row.kind === "income" ? data.income.find((i) => i.id === row.id) : data.expenses.find((e) => e.id === row.id);

  const rows = useMemo(() => {
    const incomeRows: UnifiedRow[] = data.income.map((i) => ({ id: i.id, kind: "income" as const, date: i.date }));
    const expenseRows: UnifiedRow[] = data.expenses.map((e) => ({ id: e.id, kind: "expense" as const, date: e.date }));
    const searchLower = search.trim().toLowerCase();

    return [...incomeRows, ...expenseRows]
      .filter((r) => filter === "all" || r.kind === filter)
      .filter((r) => !dateFrom || r.date >= dateFrom)
      .filter((r) => !dateTo || r.date <= dateTo)
      .filter((r) => {
        if (!searchLower) return true;
        if (r.kind === "income") {
          const e = data.income.find((i) => i.id === r.id);
          if (!e) return false;
          return [e.label, e.source, e.notes].some((v) => (v ?? "").toLowerCase().includes(searchLower));
        }
        const e = data.expenses.find((x) => x.id === r.id);
        if (!e) return false;
        return [e.name, e.category, e.notes].some((v) => (v ?? "").toLowerCase().includes(searchLower));
      })
      .filter((r) => {
        if (!categoryFilter || r.kind !== "expense") return true;
        const e = data.expenses.find((x) => x.id === r.id);
        return e?.category === categoryFilter;
      })
      .filter((r) => {
        if (r.kind === "expense") {
          if (!expenseStatusFilter) return true;
          const e = data.expenses.find((x) => x.id === r.id);
          return e?.status === expenseStatusFilter;
        }
        if (!incomeStatusFilter) return true;
        const e = data.income.find((x) => x.id === r.id);
        return e?.status === incomeStatusFilter;
      })
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [data, filter, dateFrom, dateTo, search, categoryFilter, expenseStatusFilter, incomeStatusFilter]);

  const activeFilterCount = [dateFrom, dateTo, categoryFilter, expenseStatusFilter, incomeStatusFilter].filter(
    Boolean,
  ).length;

  const clearFilters = () => {
    setDateFrom("");
    setDateTo("");
    setCategoryFilter("");
    setExpenseStatusFilter("");
    setIncomeStatusFilter("");
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    if (pendingDelete.kind === "income") deleteIncome(pendingDelete.id);
    else deleteExpense(pendingDelete.id);
    showToast("Transaction deleted", "neutral");
    setPendingDelete(null);
  };

  const exportCsv = () => {
    if (rows.length === 0) {
      showToast("Nothing to export with the current filters.", "warning");
      return;
    }
    const header = ["Date", "Type", "Name", "Category", "Status", "Amount"];
    const lines = rows.map((row) => {
      const entry = findEntry(row);
      if (!entry) return "";
      if (row.kind === "income") {
        const e = entry as IncomeEntry;
        const amount = e.actualAmount ?? e.expectedAmount;
        return [formatDate(e.date), "Income", e.label, e.source ?? "", e.status, amount.toFixed(2)]
          .map((v) => csvEscape(String(v)))
          .join(",");
      }
      const e = entry as ExpenseEntry;
      return [formatDate(e.date), "Expense", e.name, e.category, e.status, (-Math.abs(e.amount)).toFixed(2)]
        .map((v) => csvEscape(String(v)))
        .join(",");
    });
    const csv = [header.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clearing-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Exported to CSV", "success");
  };

  return (
    <div className="pb-6">
      <PageHeader title="Transactions" subtitle="Everything you've earned and spent." />

      <div className="mb-4 space-y-3">
        <div className="flex items-center gap-1.5">
          {(["all", "income", "expense"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={clsx(
                "rounded-full px-3.5 py-1.5 text-[13px] font-medium capitalize transition-colors",
                filter === f ? "bg-[var(--text)] text-[var(--bg)]" : "bg-[var(--surface-2)] text-[var(--text-muted)]",
              )}
            >
              {f}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-1.5">
            <button
              onClick={exportCsv}
              aria-label="Export CSV"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--surface-2)] text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
            >
              <Download size={15} />
            </button>
            <button
              onClick={() => setShowFilters((v) => !v)}
              aria-label="Toggle filters"
              className={clsx(
                "relative flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                showFilters ? "bg-[var(--text)] text-[var(--bg)]" : "bg-[var(--surface-2)] text-[var(--text-muted)]",
              )}
            >
              <SlidersHorizontal size={15} />
              {activeFilterCount > 0 && !showFilters && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--accent-blue)] text-[9px] font-semibold text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-faint)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, category, or notes..."
            className="w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] py-2.5 pl-10 pr-9 text-sm text-[var(--text)] placeholder:text-[var(--text-faint)] focus:border-[var(--accent-blue)] focus:outline-none"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-faint)] hover:text-[var(--text)]"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {showFilters && (
          <Card className="p-4">
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">From</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-2.5 py-2 text-[13px] text-[var(--text)]"
                  />
                </div>
                <div className="flex-1">
                  <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">To</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-2.5 py-2 text-[13px] text-[var(--text)]"
                  />
                </div>
              </div>

              {filter !== "income" && (
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">Category</label>
                    <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="!py-2 !text-[13px]">
                      <option value="">All categories</option>
                      {EXPENSE_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="flex-1">
                    <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">Status</label>
                    <Select value={expenseStatusFilter} onChange={(e) => setExpenseStatusFilter(e.target.value)} className="!py-2 !text-[13px]">
                      <option value="">All statuses</option>
                      <option value="paid">Paid</option>
                      <option value="planned">Planned</option>
                    </Select>
                  </div>
                </div>
              )}

              {filter !== "expense" && (
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">Income status</label>
                  <Select value={incomeStatusFilter} onChange={(e) => setIncomeStatusFilter(e.target.value)} className="!py-2 !text-[13px]">
                    <option value="">All statuses</option>
                    <option value="received">Received</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="forecast">Forecast</option>
                  </Select>
                </div>
              )}

              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-xs font-medium text-[var(--text)] transition-colors hover:bg-[var(--border)]/40"
                >
                  <X size={14} /> Clear filters
                </button>
              )}
            </div>
          </Card>
        )}
      </div>

      <Card>
        {rows.length === 0 ? (
          <EmptyState
            icon={<Inbox size={20} />}
            title="Nothing here yet"
            description={
              search || activeFilterCount > 0
                ? "Nothing matches these filters \u2014 try clearing some."
                : "Add your first expense to start understanding where your money goes."
            }
          />
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {rows.map((row) => {
              const entry = findEntry(row);
              if (!entry) return null;
              return (
                <TransactionItem key={`${row.kind}-${row.id}`} kind={row.kind} entry={entry} onDelete={() => setPendingDelete(row)} />
              );
            })}
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete transaction?"
        description="This can't be undone."
        confirmLabel="Delete"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
