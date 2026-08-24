import { useState } from "react";
import { Plus, Target } from "lucide-react";
import { PageHeader } from "../components/common/PageHeader";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { SavingsGoalCard } from "../components/plan/SavingsGoalCard";
import { SavingsGoalForm, type GoalDraft } from "../components/plan/SavingsGoalForm";
import { useAppData } from "../hooks/useAppData";
import { useToast } from "../hooks/useToast";
import { formatCurrency } from "../lib/format";
import type { SavingsGoal } from "../types";

/**
 * Standalone "how much do you want to save each month" screen, reachable
 * from More > Savings on mobile (savings goals also still show inline on
 * the Plan page's desktop timeline).
 */
export default function SavingsPage() {
  const { data, addGoal, updateGoal, deleteGoal } = useAppData();
  const { showToast } = useToast();

  const [goalFormOpen, setGoalFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [deletingGoalId, setDeletingGoalId] = useState<string | null>(null);

  const totalMonthly = data.goals.reduce((sum, g) => sum + (g.monthlyContribution ?? 0), 0);

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
      <PageHeader title="Savings" subtitle="Set how much you want to put away each month." />

      {totalMonthly > 0 && (
        <Card className="mb-5">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-faint)]">Total planned per month</p>
          <p className="num mt-1 text-2xl font-semibold text-[var(--text)]">{formatCurrency(totalMonthly, data.profile.currency)}</p>
        </Card>
      )}

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
        <Card>
          <EmptyState
            icon={<Target size={20} />}
            title="No savings goals yet"
            description="Set a target and a monthly amount, and we'll track your progress."
            action={
              <Button size="sm" onClick={() => setGoalFormOpen(true)}>
                Create a goal
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
        open={!!deletingGoalId}
        title="Delete this goal?"
        description="This can't be undone."
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          if (deletingGoalId) {
            deleteGoal(deletingGoalId);
            showToast("Goal deleted", "neutral");
          }
          setDeletingGoalId(null);
        }}
        onCancel={() => setDeletingGoalId(null)}
      />
    </div>
  );
}
