import { useEffect, useState } from "react";
import { SettingsBackHeader } from "../../components/settings/SettingsBackHeader";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { useAppData } from "../../hooks/useAppData";
import { useToast } from "../../hooks/useToast";

export default function BalanceSettingsPage() {
  const { data, setCurrentBalance } = useAppData();
  const { showToast } = useToast();
  const [balanceDraft, setBalanceDraft] = useState(data.currentBalance.toFixed(2));

  useEffect(() => {
    setBalanceDraft(data.currentBalance.toFixed(2));
  }, [data.currentBalance]);

  const saveBalance = () => {
    const parsed = Number.parseFloat(balanceDraft);
    if (Number.isNaN(parsed)) {
      showToast("Enter a valid number", "warning");
      setBalanceDraft(data.currentBalance.toFixed(2));
      return;
    }
    setCurrentBalance(Math.round(parsed * 100) / 100);
    showToast("Balance updated", "success");
  };

  return (
    <div className="mx-auto max-w-xl pb-6">
      <SettingsBackHeader title="Balance" subtitle="Reconcile with your real bank balance." />
      <Card>
        <p className="mb-4 text-[13px] text-[var(--text-muted)]">
          Updates automatically whenever you log something as paid or received. Adjust it here only to reconcile
          with your real bank balance (cash, bank fees, interest, anything not logged in the app).
        </p>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-faint)]">&euro;</span>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              value={balanceDraft}
              onChange={(e) => setBalanceDraft(e.target.value)}
              className="num w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] py-2.5 pl-8 pr-3.5 text-[15px] text-[var(--text)] focus:border-[var(--accent-blue)] focus:outline-none"
            />
          </div>
          <Button size="sm" onClick={saveBalance} disabled={Number.parseFloat(balanceDraft) === data.currentBalance}>
            Save
          </Button>
        </div>
      </Card>
    </div>
  );
}
