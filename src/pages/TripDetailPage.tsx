import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Pencil, Trash2 } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { StatusPill } from "../components/ui/StatusPill";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { TripExpenseForm, type TripExpenseDraft } from "../components/trips/TripExpenseForm";
import { TripForm, type TripDraft } from "../components/trips/TripForm";
import { ShareButton } from "../components/common/ShareButton";
import { useAppData } from "../hooks/useAppData";
import { useToast } from "../hooks/useToast";
import { formatCurrency, formatDateRange, todayIso } from "../lib/format";
import type { ExpenseEntry } from "../types";
import { Luggage } from "lucide-react";

export default function TripDetailPage() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const { data, addExpense, updateExpense, deleteExpense, updateTrip, deleteTrip } = useAppData();
  const { showToast } = useToast();

  const trip = data.trips.find((t) => t.id === tripId);
  const tripExpenses = useMemo(() => data.expenses.filter((e) => e.tripId === tripId), [data.expenses, tripId]);

  const [expenseFormOpen, setExpenseFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseEntry | null>(null);
  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(null);
  const [editTripOpen, setEditTripOpen] = useState(false);
  const [deleteTripOpen, setDeleteTripOpen] = useState(false);

  if (!trip) {
    return (
      <div className="py-16 text-center">
        <p className="text-[15px] text-[var(--text-muted)]">This trip couldn't be found.</p>
        <Button className="mt-4" onClick={() => navigate("/trips")}>
          Back to trips
        </Button>
      </div>
    );
  }

  const total = tripExpenses.reduce((s, e) => s + e.amount, 0);

  const shareText = useMemo(() => {
    const byCategory = new Map<string, number>();
    for (const e of tripExpenses) byCategory.set(e.category, (byCategory.get(e.category) ?? 0) + e.amount);
    const lines = [...byCategory.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([cat, amt]) => `\u2022 ${cat}: ${formatCurrency(amt)}`);
    return [
      `${trip.name} (${formatDateRange(trip.startDate, trip.endDate)})`,
      `Total: ${formatCurrency(total)}`,
      ...lines,
    ].join("\n");
  }, [trip, tripExpenses, total]);

  const saveExpense = (draft: TripExpenseDraft) => {
    const payload = {
      name: draft.name.trim(),
      amount: parseFloat(draft.amount),
      category: draft.category,
      date: draft.date,
      type: "planned" as const,
      status: draft.status,
      tripId: trip.id,
    };
    if (editingExpense) {
      updateExpense(editingExpense.id, payload);
      showToast("Trip expense updated", "success");
    } else {
      addExpense(payload);
      showToast("Added to trip", "success");
    }
    setExpenseFormOpen(false);
    setEditingExpense(null);
  };

  const saveTrip = (draft: TripDraft) => {
    updateTrip(trip.id, { name: draft.name.trim(), startDate: draft.startDate, endDate: draft.endDate, notes: draft.notes.trim() || undefined });
    showToast("Trip updated", "success");
    setEditTripOpen(false);
  };

  return (
    <div className="pb-6">
      <button
        onClick={() => navigate("/trips")}
        className="mb-4 flex items-center gap-1.5 text-[13.5px] font-medium text-[var(--text-muted)] hover:text-[var(--text)]"
      >
        <ArrowLeft size={15} /> Trips
      </button>

      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight text-[var(--text)]">{trip.name}</h1>
          <p className="mt-1 text-[14px] text-[var(--text-muted)]">{formatDateRange(trip.startDate, trip.endDate)}</p>
        </div>
        <div className="flex gap-1.5">
          <ShareButton compact title={trip.name} text={shareText} />
          <button onClick={() => setEditTripOpen(true)} className="rounded-full border border-[var(--border)] p-2 text-[var(--text-muted)] hover:text-[var(--text)]">
            <Pencil size={15} />
          </button>
          <button onClick={() => setDeleteTripOpen(true)} className="rounded-full border border-[var(--border)] p-2 text-[var(--text-muted)] hover:text-[var(--accent-red)]">
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <Card className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-[13px] font-medium text-[var(--text-muted)]">Total trip cost</p>
          <p className="num mt-1 text-[26px] font-semibold text-[var(--text)]">{formatCurrency(total)}</p>
        </div>
        <Button
          size="sm"
          icon={<Plus size={14} />}
          onClick={() => {
            setEditingExpense(null);
            setExpenseFormOpen(true);
          }}
        >
          Add expense
        </Button>
      </Card>

      <Card>
        {tripExpenses.length === 0 ? (
          <EmptyState
            icon={<Luggage size={20} />}
            title="No expenses yet"
            description="Add accommodation, transport, food and activities to see the real cost of this trip."
            action={<Button size="sm" onClick={() => setExpenseFormOpen(true)}>Add expense</Button>}
          />
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {tripExpenses.map((e) => (
              <div key={e.id} className="group flex items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-medium text-[var(--text)]">{e.name}</p>
                  <p className="text-xs text-[var(--text-faint)]">{e.category}</p>
                </div>
                <StatusPill status={e.status} label={e.status === "confirmed" ? "confirmed" : e.status === "paid" ? "paid" : "estimated"} />
                <span className="num shrink-0 text-[14px] font-medium text-[var(--text)]">{formatCurrency(e.amount)}</span>
                <div className="flex shrink-0 gap-1">
                  <button
                    onClick={() => {
                      setEditingExpense(e);
                      setExpenseFormOpen(true);
                    }}
                    className="rounded-full p-1.5 text-[var(--text-faint)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => setDeletingExpenseId(e.id)}
                    className="rounded-full p-1.5 text-[var(--text-faint)] hover:bg-[var(--surface-2)] hover:text-[var(--accent-red)]"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <TripExpenseForm
        open={expenseFormOpen}
        initial={editingExpense}
        defaultDate={trip.startDate < todayIso() ? todayIso() : trip.startDate}
        onClose={() => {
          setExpenseFormOpen(false);
          setEditingExpense(null);
        }}
        onSave={saveExpense}
      />
      <TripForm open={editTripOpen} initial={trip} onClose={() => setEditTripOpen(false)} onSave={saveTrip} />

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
        open={deleteTripOpen}
        title="Delete this trip?"
        description="This will also delete all of its expenses. This can't be undone."
        confirmLabel="Delete trip"
        danger
        onConfirm={() => {
          deleteTrip(trip.id);
          showToast("Trip deleted", "neutral");
          navigate("/trips");
        }}
        onCancel={() => setDeleteTripOpen(false)}
      />
    </div>
  );
}
