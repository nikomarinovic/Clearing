import { Pencil, Trash2 } from "lucide-react";
import type { ExpenseEntry } from "../../types";
import { formatCurrency, formatDate } from "../../lib/format";
import { StatusPill } from "../ui/StatusPill";

export function FutureExpenseCard({
  expense,
  onEdit,
  onDelete,
}: {
  expense: ExpenseEntry;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="group flex items-center gap-3 py-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-medium text-[var(--text)]">{expense.name}</p>
        <p className="text-xs text-[var(--text-faint)]">
          {formatDate(expense.date)} &middot; {expense.category}
          {expense.recurrence && expense.recurrence !== "none" && <> &middot; {expense.recurrence}</>}
        </p>
      </div>
      <StatusPill status={expense.status} />
      <span className="num shrink-0 text-[14px] font-medium text-[var(--text)]">{formatCurrency(expense.amount)}</span>
      <div className="flex shrink-0 gap-1">
        <button onClick={onEdit} aria-label="Edit" className="rounded-full p-1.5 text-[var(--text-faint)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]">
          <Pencil size={14} />
        </button>
        <button onClick={onDelete} aria-label="Delete" className="rounded-full p-1.5 text-[var(--text-faint)] hover:bg-[var(--surface-2)] hover:text-[var(--accent-red)]">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
