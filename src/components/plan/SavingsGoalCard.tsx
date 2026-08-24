import { Pencil, Trash2, Target } from "lucide-react";
import type { SavingsGoal } from "../../types";
import { formatCurrency, formatDate } from "../../lib/format";
import { ProgressBar } from "../ui/ProgressBar";
import { requiredMonthlySaving } from "../../lib/calculations";

export function SavingsGoalCard({
  goal,
  onEdit,
  onDelete,
}: {
  goal: SavingsGoal;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
  const monthly = goal.monthlyContribution ?? requiredMonthlySaving(goal.targetAmount, goal.currentAmount, goal.targetDate);

  return (
    <div className="rounded-[16px] border border-[var(--border)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent-green-bg)] text-[var(--accent-green)]">
            <Target size={15} />
          </span>
          <div>
            <p className="text-[14px] font-medium text-[var(--text)]">{goal.name}</p>
            {goal.targetDate && <p className="text-xs text-[var(--text-faint)]">by {formatDate(goal.targetDate)}</p>}
          </div>
        </div>
        <div className="flex gap-1">
          <button onClick={onEdit} aria-label="Edit goal" className="rounded-full p-1.5 text-[var(--text-faint)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]">
            <Pencil size={14} />
          </button>
          <button onClick={onDelete} aria-label="Delete goal" className="rounded-full p-1.5 text-[var(--text-faint)] hover:bg-[var(--surface-2)] hover:text-[var(--accent-red)]">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-1.5 flex items-baseline justify-between text-[13px]">
          <span className="num font-medium text-[var(--text)]">{formatCurrency(goal.currentAmount)}</span>
          <span className="num text-[var(--text-faint)]">of {formatCurrency(goal.targetAmount)}</span>
        </div>
        <ProgressBar value={progress} />
      </div>

      {monthly !== null && monthly > 0 && (
        <p className="mt-3 text-xs text-[var(--text-muted)]">
          Save {formatCurrency(monthly)}/month to reach this goal{goal.targetDate ? " on time" : ""}.
        </p>
      )}
    </div>
  );
}
