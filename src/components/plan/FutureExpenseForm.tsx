import { useEffect, useState } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { AmountInput, Field, Input, Select, Textarea } from "../ui/Field";
import { EXPENSE_CATEGORIES } from "../../lib/categories";
import { todayIso } from "../../lib/format";
import type { ExpenseCategory, ExpenseEntry, ExpenseStatus, ExpenseType } from "../../types";

export interface FutureExpenseDraft {
  name: string;
  amount: string;
  category: ExpenseCategory;
  date: string;
  type: ExpenseType;
  recurrence: "monthly" | "weekly" | "yearly" | "none";
  status: ExpenseStatus;
  notes: string;
}

const emptyDraft = (): FutureExpenseDraft => ({
  name: "",
  amount: "",
  category: "Other",
  date: todayIso(),
  type: "planned",
  recurrence: "none",
  status: "planned",
  notes: "",
});

export function FutureExpenseForm({
  open,
  onClose,
  onSave,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (draft: FutureExpenseDraft) => void;
  initial?: ExpenseEntry | null;
}) {
  const [draft, setDraft] = useState<FutureExpenseDraft>(emptyDraft());

  useEffect(() => {
    if (initial) {
      setDraft({
        name: initial.name,
        amount: String(initial.amount),
        category: initial.category,
        date: initial.date,
        type: initial.type,
        recurrence: initial.recurrence ?? "none",
        status: initial.status,
        notes: initial.notes ?? "",
      });
    } else {
      setDraft(emptyDraft());
    }
  }, [initial, open]);

  const update = <K extends keyof FutureExpenseDraft>(key: K, value: FutureExpenseDraft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const handleSave = () => {
    if (!draft.name.trim() || !draft.amount || parseFloat(draft.amount) <= 0) return;
    onSave(draft);
  };

  return (
    <Modal open={open} onClose={onClose} title={initial ? "Edit expense" : "Add future expense"}>
      <div className="flex flex-col gap-4">
        <Field label="Name">
          <Input value={draft.name} onChange={(e) => update("name", e.target.value)} placeholder="Car payment" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Amount">
            <AmountInput value={draft.amount} onChange={(v) => update("amount", v)} placeholder="0.00" />
          </Field>
          <Field label="Date">
            <Input type="date" value={draft.date} onChange={(e) => update("date", e.target.value)} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Category">
            <Select value={draft.category} onChange={(e) => update("category", e.target.value as ExpenseCategory)}>
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Status">
            <Select value={draft.status} onChange={(e) => update("status", e.target.value as ExpenseStatus)}>
              <option value="considering">Considering</option>
              <option value="planned">Planned</option>
              <option value="confirmed">Confirmed</option>
              <option value="paid">Paid</option>
            </Select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Repeats">
            <Select
              value={draft.recurrence}
              onChange={(e) => {
                const recurrence = e.target.value as FutureExpenseDraft["recurrence"];
                update("recurrence", recurrence);
                update("type", recurrence === "none" ? "planned" : "recurring");
              }}
            >
              <option value="none">Doesn't repeat</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </Select>
          </Field>
        </div>
        <Field label="Notes (optional)">
          <Textarea value={draft.notes} onChange={(e) => update("notes", e.target.value)} placeholder="Anything worth remembering" />
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
