import { Card } from "../ui/Card";
import { formatCurrency } from "../../lib/format";
import type { PurchaseAnalysis } from "../../types";
import { daysToReachGoal } from "../../lib/calculations";
import type { SavingsGoal } from "../../types";

export function SavingsImpact({ analysis, goal }: { analysis: PurchaseAnalysis; goal?: SavingsGoal }) {
  const buyDays = goal && goal.monthlyContribution ? daysToReachGoal(goal.targetAmount, goal.currentAmount, goal.monthlyContribution) : null;
  const dontBuyDays =
    goal && goal.monthlyContribution
      ? daysToReachGoal(goal.targetAmount, goal.currentAmount + analysis.price, goal.monthlyContribution)
      : null;

  return (
    <Card>
      <h3 className="mb-1 text-[15px] font-semibold text-[var(--text)]">How much could you save by not buying this?</h3>
      <p className="mb-4 text-[13px] text-[var(--text-muted)]">
        If you skip it, {formatCurrency(analysis.price)} stays in your account.
      </p>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-[14px] border border-[var(--border)] p-4">
          <p className="text-[12px] font-medium text-[var(--accent-red)]">Buy</p>
          <p className="num mt-1 text-[18px] font-semibold text-[var(--text)]">{formatCurrency(analysis.balanceWithPurchase)}</p>
          <p className="mt-0.5 text-[11.5px] text-[var(--text-faint)]">projected balance</p>
        </div>
        <div className="rounded-[14px] border border-[var(--accent-green)]/40 bg-[var(--accent-green-bg)]/40 p-4">
          <p className="text-[12px] font-medium text-[var(--accent-green)]">Don't buy</p>
          <p className="num mt-1 text-[18px] font-semibold text-[var(--text)]">{formatCurrency(analysis.balanceWithoutPurchase)}</p>
          <p className="mt-0.5 text-[11.5px] text-[var(--text-faint)]">projected balance</p>
        </div>
      </div>

      {goal && buyDays !== null && dontBuyDays !== null && buyDays > dontBuyDays && (
        <p className="mt-4 text-[13.5px] text-[var(--text-muted)]">
          Skipping this would reach your "{goal.name}" goal about{" "}
          <span className="font-medium text-[var(--text)]">{buyDays - dontBuyDays} days earlier</span>.
        </p>
      )}
    </Card>
  );
}
