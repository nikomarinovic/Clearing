import { useEffect, useState } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { AmountInput, Field, Input, Select } from "../ui/Field";
import { TRIP_EXPENSE_CATEGORIES } from "../../lib/categories";
import type { ExpenseEntry, ExpenseStatus, TripExpenseCategory } from "../../types";

export interface TripExpenseDraft {
  name: string;
  amount: string;
  category: TripExpenseCategory;
  date: string;
  status: ExpenseStatus;
}

const emptyDraft = (defaultDate: string): TripExpenseDraft => ({
  name: "",
  amount: "",
  category: "Other",
  date: defaultDate,
  status: "confirmed",
});

export function TripExpenseForm({
  open,
  onClose,
  onSave,
  initial,
  defaultDate,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (draft: TripExpenseDraft) => void;
  initial?: ExpenseEntry | null;
  defaultDate: string;
}) {
  const [draft, setDraft] = useState<TripExpenseDraft>(emptyDraft(defaultDate));

  useEffect(() => {
    if (initial) {
      setDraft({
        name: initial.name,
        amount: String(initial.amount),
        category: initial.category as TripExpenseCategory,
        date: initial.date,
        status: initial.status,
      });
    } else {
      setDraft(emptyDraft(defaultDate));
    }
  }, [initial, open, defaultDate]);

  const update = <K extends keyof TripExpenseDraft>(key: K, value: TripExpenseDraft[K]) => setDraft((d) => ({ ...d, [key]: value }));

  const handleSave = () => {
    if (!draft.name.trim() || !draft.amount || parseFloat(draft.amount) <= 0) return;
    onSave(draft);
  };

  return (
    <Modal open={open} onClose={onClose} title={initial ? "Edit trip expense" : "Add trip expense"}>
      <div className="flex flex-col gap-4">
        <Field label="Name">
          <Input value={draft.name} onChange={(e) => update("name", e.target.value)} placeholder="Return ticket" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Amount">
            <AmountInput value={draft.amount} onChange={(v) => update("amount", v)} placeholder="0.00" />
          </Field>
          <Field label="Category">
            <Select value={draft.category} onChange={(e) => update("category", e.target.value as TripExpenseCategory)}>
              {TRIP_EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Date">
            <Input type="date" value={draft.date} onChange={(e) => update("date", e.target.value)} />
          </Field>
          <Field label="Status">
            <Select value={draft.status} onChange={(e) => update("status", e.target.value as ExpenseStatus)}>
              <option value="considering">Estimated</option>
              <option value="confirmed">Confirmed</option>
              <option value="paid">Paid</option>
            </Select>
          </Field>
        </div>
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
