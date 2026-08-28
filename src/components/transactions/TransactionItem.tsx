import { ArrowDownLeft, ArrowUpRight, Trash2 } from "lucide-react";
import type { ExpenseEntry, IncomeEntry } from "../../types";
import { formatCurrency, formatDate } from "../../lib/format";
import { StatusPill } from "../ui/StatusPill";
import { colorForCategory } from "../../lib/categories";

interface TransactionItemProps {
  kind: "income" | "expense";
  entry: IncomeEntry | ExpenseEntry;
  onDelete: () => void;
}

export function TransactionItem({ kind, entry, onDelete }: TransactionItemProps) {
  const isIncome = kind === "income";
  const label = isIncome ? (entry as IncomeEntry).label : (entry as ExpenseEntry).name;
  const amount = isIncome
    ? (entry as IncomeEntry).actualAmount ?? (entry as IncomeEntry).expectedAmount
    : (entry as ExpenseEntry).amount;
  const category = !isIncome ? (entry as ExpenseEntry).category : undefined;

  return (
    <div className="group flex items-center gap-3 py-3">
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
        style={{
          background: isIncome ? "var(--accent-green-bg)" : `${colorForCategory(category ?? "Other")}22`,
          color: isIncome ? "var(--accent-green)" : colorForCategory(category ?? "Other"),
        }}
      >
        {isIncome ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-medium text-[var(--text)]">{label}</p>
        <p className="flex items-center gap-1.5 text-xs text-[var(--text-faint)]">
          {formatDate(entry.date)}
          {category && <span>&middot; {category}</span>}
        </p>
      </div>

      <StatusPill status={entry.status} />

      <span className={`num shrink-0 text-[14px] font-medium ${isIncome ? "text-[var(--accent-green)]" : "text-[var(--text)]"}`}>
        {isIncome ? "+" : "\u2212"}
        {formatCurrency(Math.abs(amount))}
      </span>

      <button
        onClick={onDelete}
        aria-label={`Delete ${label}`}
        className="shrink-0 rounded-full p-1.5 text-[var(--text-faint)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--accent-red)] active:bg-[var(--surface-2)] active:text-[var(--accent-red)]"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}
