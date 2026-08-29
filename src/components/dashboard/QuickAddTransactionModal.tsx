import { useEffect, useMemo, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Plus } from "lucide-react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { AmountInput, Field, Input, Select } from "../ui/Field";
import { EXPENSE_CATEGORIES } from "../../lib/categories";
import { todayIso } from "../../lib/format";
import { haptic } from "../../lib/haptics";
import { useAppData } from "../../hooks/useAppData";
import { useToast } from "../../hooks/useToast";
import { ReceiptScanButton } from "../transactions/ReceiptScanButton";
import type { ScannedReceipt } from "../../lib/receiptScan";
import type { ExpenseCategory, ExpenseType, IncomeKind, IncomeStatus } from "../../types";

type TransactionMode = "income" | "expense";

export function QuickAddTransactionModal({
  open,
  onClose,
  initialMode = "income",
}: {
  open: boolean;
  onClose: () => void;
  initialMode?: TransactionMode;
}) {
  const { addIncome, addExpense, data } = useAppData();
  const { showToast } = useToast();

  const [mode, setMode] = useState<TransactionMode>(initialMode);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("Other");
  const [date, setDate] = useState(todayIso());
  const [incomeKind, setIncomeKind] = useState<IncomeKind>("one-time");
  const [incomeStatus, setIncomeStatus] = useState<IncomeStatus>("received");
  const [expenseType, setExpenseType] = useState<ExpenseType>("one-time");

  useEffect(() => {
    if (open) setMode(initialMode);
  }, [open, initialMode]);

  const modeOptions = useMemo(
    () => [
      { value: "income", label: "Income", icon: ArrowDownLeft },
      { value: "expense", label: "Expense", icon: ArrowUpRight },
    ],
    [],
  );

  const reset = () => {
    setMode(initialMode);
    setName("");
    setAmount("");
    setCategory("Other");
    setDate(todayIso());
    setIncomeKind("one-time");
    setIncomeStatus("received");
    setExpenseType("one-time");
  };

  const close = () => {
    reset();
    onClose();
  };

  const handleScanned = (result: ScannedReceipt) => {
    setMode("expense");
    if (result.merchant) setName(result.merchant);
    if (result.amount !== null) setAmount(result.amount.toFixed(2));
    if (result.date) setDate(result.date);
    setCategory(result.category);
  };

  const handleSubmit = () => {
    const parsed = Number.parseFloat(amount);
    if (!name.trim() || Number.isNaN(parsed) || parsed <= 0) {
      showToast("Add a name and a valid amount first.", "warning");
      return;
    }

    if (mode === "income") {
      addIncome({
        label: name.trim(),
        expectedAmount: parsed,
        actualAmount: incomeStatus === "received" ? parsed : undefined,
        date,
        status: incomeStatus,
        kind: incomeKind,
      });
      showToast(`Added income: ${name.trim()}`, "success");
    } else {
      addExpense({
        name: name.trim(),
        amount: parsed,
        category,
        date,
        type: expenseType,
        recurrence: expenseType === "one-time" ? "none" : "monthly",
        status: expenseType === "one-time" ? "paid" : "planned",
      });
      showToast(`Added expense: ${name.trim()}`, "success");
    }

    haptic("success", data.settings.hapticsEnabled);
    close();
  };

  return (
    <Modal open={open} onClose={close} title={mode === "income" ? "Add income" : "Add expense"}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2 rounded-[16px] border border-[var(--border)] bg-[var(--surface-2)] p-1">
          {modeOptions.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setMode(value as TransactionMode)}
              className={`flex items-center justify-center gap-2 rounded-[12px] px-3 py-2.5 text-sm font-medium transition-colors ${
                mode === value ? "bg-[var(--surface)] text-[var(--text)] shadow-sm" : "text-[var(--text-muted)]"
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        <Field label={mode === "income" ? "Where is it from?" : "What was it for?"}>
          <Input

            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={mode === "income" ? "Salary, freelance, bonus" : "Groceries, rent, travel"}
          />
        </Field>

        {mode === "expense" && <ReceiptScanButton onScanned={handleScanned} />}

        <Field label="Amount">
          <AmountInput value={amount} onChange={setAmount} placeholder="0.00" />
        </Field>

        {mode === "income" ? (
          <>
            <Field label="Type">
              <Select value={incomeKind} onChange={(e) => setIncomeKind(e.target.value as IncomeKind)}>
                <option value="one-time">One-time</option>
                <option value="recurring">Recurring</option>
              </Select>
            </Field>
            <Field label="Status">
              <Select value={incomeStatus} onChange={(e) => setIncomeStatus(e.target.value as IncomeStatus)}>
                <option value="received">Received</option>
                <option value="confirmed">Confirmed</option>
                <option value="forecast">Forecast</option>
              </Select>
            </Field>
          </>
        ) : (
          <>
            <Field label="Category">
              <Select value={category} onChange={(e) => setCategory(e.target.value as ExpenseCategory)}>
                {EXPENSE_CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Type">
              <Select value={expenseType} onChange={(e) => setExpenseType(e.target.value as ExpenseType)}>
                <option value="one-time">One-time</option>
                <option value="planned">Planned</option>
              </Select>
            </Field>
          </>
        )}

        <Field label="Date">
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>

        <Button fullWidth onClick={handleSubmit} icon={<Plus size={16} />}>
          Save {mode}
        </Button>
      </div>
    </Modal>
  );
}
