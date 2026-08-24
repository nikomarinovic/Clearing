import { useMemo, useState } from "react";
import { Plus, Target } from "lucide-react";
import { PageHeader } from "../components/common/PageHeader";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { AnimatedAmount } from "../components/common/AnimatedAmount";
import { ModeToggle, type PlanMode } from "../components/plan/ModeToggle";
import { BalanceTimelineChart } from "../components/charts/BalanceTimelineChart";
import { Timeline } from "../components/plan/PlanTimeline";
import { FutureExpenseCard } from "../components/plan/FutureExpenseCard";
import { FutureExpenseForm, type FutureExpenseDraft } from "../components/plan/FutureExpenseForm";
import { SavingsGoalCard } from "../components/plan/SavingsGoalCard";
import { SavingsGoalForm, type GoalDraft } from "../components/plan/SavingsGoalForm";
import { EmptyState } from "../components/ui/EmptyState";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { Field, Input } from "../components/ui/Field";
import { useAppData } from "../hooks/useAppData";
import { useToast } from "../hooks/useToast";
import { buildProjection, calculateRightNow } from "../lib/calculations";
import { addDaysIso, todayIso } from "../lib/format";
import type { ExpenseEntry, SavingsGoal } from "../types";
import { CalendarClock } from "lucide-react";

export default function PlanPage() {
  const { data, addExpense, updateExpense, deleteExpense, addGoal, updateGoal, deleteGoal } = useAppData();
  const { showToast } = useToast();

  const [mode, setMode] = useState<PlanMode>("ahead");
  const [targetDate, setTargetDate] = useState(addDaysIso(todayIso(), 30));

  const [expenseFormOpen, setExpenseFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseEntry | null>(null);
  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(null);

  const [goalFormOpen, setGoalFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [deletingGoalId, setDeletingGoalId] = useState<string | null>(null);

  const rightNow = useMemo(() => calculateRightNow(data), [data]);
  const projection = useMemo(
    () => buildProjection(data, { to: mode === "ahead" ? targetDate : todayIso() }),
    [data, mode, targetDate],
  );

  const futureExpenses = useMemo(
    () =>
      data.expenses
        .filter((e) => !e.tripId && e.date >= todayIso())
        .sort((a, b) => (a.date < b.date ? -1 : 1)),
    [data.expenses],
  );

  const saveExpense = (draft: FutureExpenseDraft) => {
    const payload = {
      name: draft.name.trim(),
      amount: parseFloat(draft.amount),
      category: draft.category,
      date: draft.date,
      type: draft.type,
      recurrence: draft.recurrence,
      status: draft.status,
      notes: draft.notes.trim() || undefined,
    };
    if (editingExpense) {
      updateExpense(editingExpense.id, payload);
      showToast("Expense updated", "success");
    } else {
      addExpense(payload);
      showToast("Added to your plan", "success");
    }
    setExpenseFormOpen(false);
    setEditingExpense(null);
  };

  const saveGoal = (draft: GoalDraft) => {
    const payload = {
      name: draft.name.trim(),
      targetAmount: parseFloat(draft.targetAmount),
      currentAmount: parseFloat(draft.currentAmount) || 0,
      targetDate: draft.targetDate || undefined,
      monthlyContribution: draft.monthlyContribution ? parseFloat(draft.monthlyContribution) : undefined,
    };
    if (editingGoal) {
      updateGoal(editingGoal.id, payload);
      showToast("Goal updated", "success");
    } else {
      addGoal(payload);
      showToast("Goal created", "success");
    }
    setGoalFormOpen(false);
    setEditingGoal(null);
  };

  return (
    <div className="pb-6">
      <PageHeader title="Plan" subtitle="Where your money is headed, on your terms." />

      <Card className="mb-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <ModeToggle mode={mode} onChange={setMode} />
          {mode === "ahead" && (
            <Field htmlFor="target-date">
              <Input id="target-date" type="date" value={targetDate} min={todayIso()} onChange={(e) => setTargetDate(e.target.value)} />
            </Field>
          )}
        </div>

        <div className="mt-5">
          {mode === "now" ? (
            <div>
              <p className="text-[13px] font-medium text-[var(--text-muted)]">Right now</p>
              <AnimatedAmount value={data.currentBalance} className="num text-[30px] font-semibold text-[var(--text)]" />
              <p className="mt-1 text-[13.5px] text-[var(--text-muted)]">
                After {rightNow.committed > 0 ? "this month's planned expenses" : "no planned expenses"}: {""}
                <span className="num font-medium text-[var(--text)]">
                  <AnimatedAmount value={rightNow.balance} />
                </span>
              </p>
            </div>
          ) : (
            <div>
              <p className="text-[13px] font-medium text-[var(--text-muted)]">Projected balance</p>
              <AnimatedAmount value={projection.endBalance} className="num text-[30px] font-semibold text-[var(--text)]" />
              <p className="mt-1 text-[13.5px] text-[var(--text-muted)]">
                Starting from <span className="num">{data.currentBalance.toFixed(2)}&euro;</span>, including income and planned
                expenses through this date.
              </p>
              <div className="mt-5">
                <BalanceTimelineChart points={projection.points} />
              </div>
            </div>
          )}
        </div>
      </Card>

      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-[15px] font-semibold text-[var(--text)]">Future expense planner</h2>
        <Button
          size="sm"
          variant="secondary"
          icon={<Plus size={14} />}
          onClick={() => {
            setEditingExpense(null);
            setExpenseFormOpen(true);
          }}
        >
          Add
        </Button>
      </div>

      <Card className="mb-6">
        {futureExpenses.length === 0 ? (
          <EmptyState
            icon={<CalendarClock size={20} />}
            title="Thinking about buying something?"
            description="Add it here and see how it affects your future balance."
            action={
              <Button size="sm" onClick={() => setExpenseFormOpen(true)}>
                Add future expense
              </Button>
            }
          />
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {futureExpenses.map((expense) => (
              <FutureExpenseCard
                key={expense.id}
                expense={expense}
                onEdit={() => {
                  setEditingExpense(expense);
                  setExpenseFormOpen(true);
                }}
                onDelete={() => setDeletingExpenseId(expense.id)}
              />
            ))}
          </div>
        )}
      </Card>

      <div className="mb-5 flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 text-[15px] font-semibold text-[var(--text)]">
          <Target size={16} /> Savings goals
        </h2>
        <Button
          size="sm"
          variant="secondary"
          icon={<Plus size={14} />}
          onClick={() => {
            setEditingGoal(null);
            setGoalFormOpen(true);
          }}
        >
          New goal
        </Button>
      </div>

      {data.goals.length === 0 ? (
        <Card className="mb-6">
          <EmptyState
            icon={<Target size={20} />}
            title="No savings goals yet"
            description="Set a target and we'll work out what to save each month."
            action={
              <Button size="sm" onClick={() => setGoalFormOpen(true)}>
                Create a goal
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {data.goals.map((goal) => (
            <SavingsGoalCard
              key={goal.id}
              goal={goal}
              onEdit={() => {
                setEditingGoal(goal);
                setGoalFormOpen(true);
              }}
              onDelete={() => setDeletingGoalId(goal.id)}
            />
          ))}
        </div>
      )}

      {mode === "ahead" && (
        <>
          <h2 className="mb-3 text-[15px] font-semibold text-[var(--text)]">Timeline</h2>
          <Card>
            <Timeline points={projection.points} />
          </Card>
        </>
      )}

      <FutureExpenseForm
        open={expenseFormOpen}
        initial={editingExpense}
        onClose={() => {
          setExpenseFormOpen(false);
          setEditingExpense(null);
        }}
        onSave={saveExpense}
      />
      <SavingsGoalForm
        open={goalFormOpen}
        initial={editingGoal}
        onClose={() => {
          setGoalFormOpen(false);
          setEditingGoal(null);
        }}
        onSave={saveGoal}
      />

      <ConfirmDialog
        open={!!deletingExpenseId}
        title="Delete this expense?"
        description="This can't be undone."
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          if (deletingExpenseId) deleteExpense(deletingExpenseId);
          setDeletingExpenseId(null);
          showToast("Deleted", "neutral");
        }}
        onCancel={() => setDeletingExpenseId(null)}
      />
      <ConfirmDialog
        open={!!deletingGoalId}
        title="Delete this goal?"
        description="This can't be undone."
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          if (deletingGoalId) deleteGoal(deletingGoalId);
          setDeletingGoalId(null);
          showToast("Deleted", "neutral");
        }}
        onCancel={() => setDeletingGoalId(null)}
      />
    </div>
  );
}
