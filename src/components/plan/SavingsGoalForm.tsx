import { useEffect, useState } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { AmountInput, Field, Input } from "../ui/Field";
import type { SavingsGoal } from "../../types";

export interface GoalDraft {
  name: string;
  targetAmount: string;
  currentAmount: string;
  targetDate: string;
  monthlyContribution: string;
}

const emptyDraft = (): GoalDraft => ({ name: "", targetAmount: "", currentAmount: "0", targetDate: "", monthlyContribution: "" });

export function SavingsGoalForm({
  open,
  onClose,
  onSave,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (draft: GoalDraft) => void;
  initial?: SavingsGoal | null;
}) {
  const [draft, setDraft] = useState<GoalDraft>(emptyDraft());

  useEffect(() => {
    if (initial) {
      setDraft({
        name: initial.name,
        targetAmount: String(initial.targetAmount),
        currentAmount: String(initial.currentAmount),
        targetDate: initial.targetDate ?? "",
        monthlyContribution: initial.monthlyContribution ? String(initial.monthlyContribution) : "",
      });
    } else {
      setDraft(emptyDraft());
    }
  }, [initial, open]);

  const update = <K extends keyof GoalDraft>(key: K, value: GoalDraft[K]) => setDraft((d) => ({ ...d, [key]: value }));

  const handleSave = () => {
    if (!draft.name.trim() || !draft.targetAmount || parseFloat(draft.targetAmount) <= 0) return;
    onSave(draft);
  };

  return (
    <Modal open={open} onClose={onClose} title={initial ? "Edit goal" : "New savings goal"}>
      <div className="flex flex-col gap-4">
        <Field label="Goal name">
          <Input value={draft.name} onChange={(e) => update("name", e.target.value)} placeholder="Emergency fund" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Target amount">
            <AmountInput value={draft.targetAmount} onChange={(v) => update("targetAmount", v)} placeholder="0.00" />
          </Field>
          <Field label="Already saved">
            <AmountInput value={draft.currentAmount} onChange={(v) => update("currentAmount", v)} placeholder="0.00" />
          </Field>
        </div>
        <Field label="Target date (optional)">
          <Input type="date" value={draft.targetDate} onChange={(e) => update("targetDate", e.target.value)} />
        </Field>
        <Field label="Monthly contribution (optional)">
          <AmountInput value={draft.monthlyContribution} onChange={(v) => update("monthlyContribution", v)} placeholder="0.00" />
        </Field>
      </div>
      <div className="mt-6 flex gap-2">
        <Button variant="secondary" fullWidth onClick={onClose}>
          Cancel
        </Button>
        <Button fullWidth onClick={handleSave}>
          Save
        </Button>
      </div>
    </Modal>
  );
}
