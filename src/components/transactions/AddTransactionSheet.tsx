import { useState } from "react";
import { ArrowDownLeft, ArrowUpRight, CalendarClock, Wallet } from "lucide-react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { AmountInput, Field, Input, Select } from "../ui/Field";
import { useAppData } from "../../hooks/useAppData";
import { useToast } from "../../hooks/useToast";
import { EXPENSE_CATEGORIES } from "../../lib/categories";
import { todayIso } from "../../lib/format";
import { haptic } from "../../lib/haptics";
import { ReceiptScanButton } from "./ReceiptScanButton";
import type { ScannedReceipt } from "../../lib/receiptScan";
import type { ExpenseCategory, ExpenseStatus, ExpenseType, IncomeStatus } from "../../types";

type QuickType = "expense" | "income" | "planned-expense" | "planned-income";

const QUICK_TYPES: { id: QuickType; label: string; icon: typeof ArrowDownLeft; hint: string }[] = [
  { id: "expense", label: "Expense", icon: ArrowUpRight, hint: "Already spent" },
  { id: "income", label: "Income", icon: ArrowDownLeft, hint: "Already received" },
  { id: "planned-expense", label: "Planned expense", icon: CalendarClock, hint: "Upcoming cost" },
  { id: "planned-income", label: "Planned income", icon: Wallet, hint: "Expected money" },
];

export function AddTransactionSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addExpense, addIncome, data } = useAppData();
  const { showToast } = useToast();

  const [step, setStep] = useState<"type" | "form">("type");
  const [quickType, setQuickType] = useState<QuickType>("expense");

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("Other");
  const [date, setDate] = useState(todayIso());

  const reset = () => {
    setStep("type");
    setName("");
    setAmount("");
    setCategory("Other");
    setDate(todayIso());
  };

  const close = () => {
    reset();
    onClose();
  };

  const chooseType = (type: QuickType) => {
    setQuickType(type);
    setStep("form");
  };

  const handleScanned = (result: ScannedReceipt) => {
    setQuickType("expense");
    setStep("form");
    if (result.merchant) setName(result.merchant);
    if (result.amount !== null) setAmount(result.amount.toFixed(2));
    if (result.date) setDate(result.date);
    setCategory(result.category);
  };

  const isExpenseFlow = quickType === "expense" || quickType === "planned-expense";

  const handleSubmit = () => {
    const value = parseFloat(amount);
    if (!name.trim() || Number.isNaN(value) || value <= 0) {
      showToast("Add a name and a valid amount first.", "warning");
      return;
    }

    if (isExpenseFlow) {
      const type: ExpenseType = quickType === "expense" ? "actual" : "planned";
      const status: ExpenseStatus = quickType === "expense" ? "paid" : "planned";
      addExpense({ name, amount: value, category, date, type, status, recurrence: "none" });
      showToast(`Added "${name}" to expenses`, "success");
    } else {
      const status: IncomeStatus = quickType === "income" ? "received" : "forecast";
      addIncome({ label: name, expectedAmount: value, date, status, kind: "one-time" });
      showToast(`Added "${name}" to income`, "success");
    }
    haptic("success", data.settings.hapticsEnabled);
    close();
  };

  return (
    <Modal open={open} onClose={close} title={step === "type" ? "Add transaction" : QUICK_TYPES.find((t) => t.id === quickType)!.label}>
      {step === "type" && (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2.5">
            {QUICK_TYPES.map((t) => (
              <button
                key={t.id}
                onClick={() => chooseType(t.id)}
                className="flex flex-col items-start gap-2.5 rounded-[16px] border border-[var(--border)] p-4 text-left transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)]/60"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--surface-2)] text-[var(--text)]">
                  <t.icon size={17} />
                </span>
                <span>
                  <span className="block text-[14px] font-medium text-[var(--text)]">{t.label}</span>
                  <span className="block text-xs text-[var(--text-faint)]">{t.hint}</span>
                </span>
              </button>
            ))}
          </div>
          <ReceiptScanButton onScanned={handleScanned} />
        </div>
      )}

      {step === "form" && (
        <div className="flex flex-col gap-4">
          <Field label={isExpenseFlow ? "What was it for?" : "Where's it from?"}>
            <Input

              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isExpenseFlow ? "Groceries" : "Freelance payment"}
            />
          </Field>
          <Field label="Amount">
            <AmountInput value={amount} onChange={setAmount} placeholder="0.00" />
          </Field>
          {isExpenseFlow && (
            <Field label="Category">
              <Select value={category} onChange={(e) => setCategory(e.target.value as ExpenseCategory)}>
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </Field>
          )}
          <Field label="Date">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>

          <div className="mt-2 flex gap-2">
            <Button variant="secondary" fullWidth onClick={() => setStep("type")}>
              Back
            </Button>
            <Button fullWidth onClick={handleSubmit}>
              Add
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
