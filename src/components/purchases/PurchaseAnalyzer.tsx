import { formatCurrency } from "../../lib/format";
import type { PurchaseAnalysis } from "../../types";
import { Card } from "../ui/Card";

export function PurchaseAnalyzer({ analysis }: { analysis: PurchaseAnalysis }) {
  return (
    <Card>
      <h3 className="mb-4 text-[15px] font-semibold text-[var(--text)]">Current situation</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-[12px] font-medium text-[var(--text-muted)]">Without purchase</p>
          <p className="num mt-1 text-[19px] font-semibold text-[var(--text)]">{formatCurrency(analysis.balanceWithoutPurchase)}</p>
        </div>
        <div>
          <p className="text-[12px] font-medium text-[var(--text-muted)]">With purchase</p>
          <p className={`num mt-1 text-[19px] font-semibold ${analysis.affordable ? "text-[var(--text)]" : "text-[var(--accent-red)]"}`}>
            {formatCurrency(analysis.balanceWithPurchase)}
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-[14px] bg-[var(--surface-2)]/60 p-4">
        <p className="text-[13.5px] leading-relaxed text-[var(--text)]">
          {analysis.affordable
            ? `You can afford this purchase, but it would reduce your projected balance by ${formatCurrency(analysis.price)}.`
            : `This purchase would take your projected balance below zero, by ${formatCurrency(Math.abs(analysis.balanceWithPurchase))}.`}
        </p>
        {analysis.bufferReductionPercent > 0 && (
          <p className="mt-2 text-[13px] text-[var(--text-muted)]">
            That's roughly a {analysis.bufferReductionPercent}% reduction in your available buffer.
          </p>
        )}
      </div>

      {analysis.workHours !== undefined && (
        <div className="mt-4 flex items-center justify-between rounded-[14px] border border-[var(--border)] px-4 py-3">
          <span className="text-[13.5px] text-[var(--text-muted)]">Work equivalent</span>
          <span className="text-[13.5px] font-medium text-[var(--text)]">
            {analysis.workHours}h{analysis.workDays !== undefined ? ` \u2248 ${analysis.workDays} working days` : ""}
          </span>
        </div>
      )}
    </Card>
  );
}
