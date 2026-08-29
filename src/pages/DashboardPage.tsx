import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, type Variants } from "framer-motion";
import { TrendingUp, ShieldCheck, Plus, Target, ArrowDownLeft, ArrowUpRight, Zap, Info } from "lucide-react";
import { PageHeader } from "../components/common/PageHeader";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { AnimatedAmount } from "../components/common/AnimatedAmount";
import { QuickStatCard } from "../components/dashboard/QuickStatCard";
import { BalanceTimelineChart } from "../components/charts/BalanceTimelineChart";
import { UpcomingList } from "../components/dashboard/UpcomingList";
import { InsightList } from "../components/dashboard/InsightList";
import { QuickAddTransactionModal } from "../components/dashboard/QuickAddTransactionModal";
import { ReminderList } from "../components/dashboard/ReminderList";
import { VirtualCard } from "../components/dashboard/VirtualCard";
import { useAppData } from "../hooks/useAppData";
import { useReminders } from "../hooks/useReminders";
import { buildProjection, calculateRightNow, calculateSafeToSpendDetails } from "../lib/calculations";
import { generateInsights } from "../lib/insights";
import { addDaysIso, formatCurrency, formatDate, todayIso } from "../lib/format";

// Staggered entrance for the dashboard's sections — continues the rhythm
// started by the app's entrance sequence (see EntranceScreen.tsx), so
// content progressively appears around the card rather than popping in
// all at once.
const revealContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.04 } },
};
const revealItem: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] } },
};

export default function DashboardPage() {
  const { data, addGoal, deleteGoal } = useAppData();
  const { reminders, dismiss } = useReminders();
  const [goalName, setGoalName] = useState("");
  const [goalTarget, setGoalTarget] = useState("");
  const [transactionModalOpen, setTransactionModalOpen] = useState(false);
  const [quickAddMode, setQuickAddMode] = useState<"income" | "expense">("income");

  const rightNow = useMemo(() => calculateRightNow(data), [data]);
  const safeToSpend = useMemo(() => calculateSafeToSpendDetails(data), [data]);
  const [showSafeToSpendInfo, setShowSafeToSpendInfo] = useState(false);
  const horizon = useMemo(() => addDaysIso(todayIso(), 45), []);
  const projection = useMemo(() => buildProjection(data, { to: horizon }), [data, horizon]);
  const insights = useMemo(() => generateInsights(data), [data]);

  const greetingName = data.profile.name && data.profile.name !== "there" ? data.profile.name : "";

  const addQuickGoal = () => {
    if (!goalName.trim() || !goalTarget || Number.parseFloat(goalTarget) <= 0) return;
    addGoal({
      name: goalName.trim(),
      targetAmount: Number.parseFloat(goalTarget),
      currentAmount: 0,
    });
    setGoalName("");
    setGoalTarget("");
  };

  return (
    <div className="pb-6">
      <PageHeader
        title={greetingName ? `Hi, ${greetingName}` : "Dashboard"}
        subtitle="Where your money stands, and where it's headed."
      />

      {reminders.length > 0 && (
        <div className="mb-4 sm:mb-5">
          <ReminderList reminders={reminders} onDismiss={dismiss} />
        </div>
      )}

      <motion.div variants={revealContainer} initial="hidden" animate="show">
      <motion.div
        variants={revealItem}
        className="lg:flex lg:items-stretch lg:gap-5"
      >
      <VirtualCard
        balance={data.currentBalance}
        name={data.profile.name && data.profile.name !== "there" ? data.profile.name : ""}
        currency={data.profile.currency}
        cardStyle={data.settings.cardStyle}
        signatureUrl={data.profile.cardSignatureUrl}
        memberSince={data.profile.createdAt}
        layout="hero"
      />
      <Card className="mb-4 overflow-hidden sm:mb-5 lg:mb-0 lg:flex-1 bg-gradient-to-b from-[var(--surface)] to-[var(--surface)]">
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:mt-0">
          <div>
            <button
              type="button"
              onClick={() => setShowSafeToSpendInfo((v) => !v)}
              className="flex items-center gap-1 text-[12px] font-medium text-[var(--text-muted)]"
            >
              <ShieldCheck size={12} /> Safe to spend
              <Info size={11} className="text-[var(--text-faint)]" />
            </button>
            <AnimatedAmount value={safeToSpend.amount} className="num mt-0.5 text-[17px] font-semibold text-[var(--accent-green)]" />
          </div>
          <div>
            <p className="text-[12px] font-medium text-[var(--text-muted)]">After planned expenses</p>
            <AnimatedAmount value={rightNow.balance} className="num mt-0.5 text-[17px] font-semibold text-[var(--text)]" />
          </div>
          <div>
            <p className="flex items-center gap-1 text-[12px] font-medium text-[var(--text-muted)]">
              <TrendingUp size={12} /> Projected (45d)
            </p>
            <AnimatedAmount value={projection.endBalance} className="num mt-0.5 text-[17px] font-semibold text-[var(--text)]" />
          </div>
        </div>

        {showSafeToSpendInfo && (
          <div className="mt-4 rounded-[12px] bg-[var(--surface-2)]/60 p-3.5 text-[12.5px] leading-relaxed text-[var(--text-muted)]">
            <p className="mb-2 font-medium text-[var(--text)]">
              Protected through {formatDate(safeToSpend.horizon)} ({safeToSpend.horizonDays}d)
            </p>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Current balance</span>
                <span className="num">{formatCurrency(data.currentBalance)}</span>
              </div>
              <div className="flex justify-between">
                <span>&minus; Bills already on the books</span>
                <span className="num">{formatCurrency(safeToSpend.committed)}</span>
              </div>
              <div className="flex justify-between">
                <span>
                  &minus; Everyday spending buffer
                  {safeToSpend.basedOnDays > 0
                    ? ` (${formatCurrency(safeToSpend.dailyAverageSpend)}/day, from your last ${safeToSpend.basedOnDays}d)`
                    : " (no spending history yet)"}
                </span>
                <span className="num">{formatCurrency(safeToSpend.behavioralBuffer)}</span>
              </div>
            </div>
            <p className="mt-2 text-[var(--text-faint)]">
              This is lower than your raw balance on purpose {"\u2014"} it reserves room for bills you know about and
              for spending you haven't logged yet, based on your recent habits.
            </p>
          </div>
        )}

        <div className="mt-6">
          <BalanceTimelineChart points={projection.points} />
        </div>
      </Card>
      </motion.div>

      <motion.div variants={revealItem} className="mb-4 flex flex-col gap-2 sm:mb-5 sm:grid sm:grid-cols-3 sm:gap-3">
        <QuickStatCard label="Upcoming income" value={projection.totalIncome} tone="green" icon={<ArrowDownLeft size={16} />} />
        <QuickStatCard label="Planned expenses" value={projection.totalExpenses} tone="red" icon={<ArrowUpRight size={16} />} />
        <QuickStatCard label="Net change" value={projection.totalIncome - projection.totalExpenses} icon={<Zap size={16} />} />
      </motion.div>

      <motion.div variants={revealItem} className="mb-4 grid gap-3 sm:mb-5 lg:grid-cols-2">
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[15px] font-semibold text-[var(--text)]">
              <ArrowDownLeft size={16} className="text-[var(--accent-green)]" />
              Quick add
            </div>
            <Button size="sm" variant="secondary" icon={<Plus size={14} />} onClick={() => setTransactionModalOpen(true)}>
              New transaction
            </Button>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setQuickAddMode("income");
                  setTransactionModalOpen(true);
                }}
                className="rounded-[14px] border border-[var(--border)] bg-[var(--surface-2)] p-3 text-left transition-colors hover:border-[var(--border-strong)]"
              >
                <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent-green-bg)] text-[var(--accent-green)]">
                  <ArrowDownLeft size={14} />
                </div>
                <p className="text-sm font-medium text-[var(--text)]">Income</p>
              </button>
              <button
                type="button"
                onClick={() => {
                  setQuickAddMode("expense");
                  setTransactionModalOpen(true);
                }}
                className="rounded-[14px] border border-[var(--border)] bg-[var(--surface-2)] p-3 text-left transition-colors hover:border-[var(--border-strong)]"
              >
                <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent-red-bg)] text-[var(--accent-red)]">
                  <ArrowUpRight size={14} />
                </div>
                <p className="text-sm font-medium text-[var(--text)]">Expense</p>
              </button>
            </div>
          </div>
        </Card>

        <Card>
          <div className="mb-3 flex items-center gap-2 text-[15px] font-semibold text-[var(--text)]">
            <Target size={16} className="text-[var(--accent-blue)]" />
            Add goal
          </div>
          <div className="space-y-3">
            <div className="flex flex-col gap-3">
              <input
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
                placeholder="Emergency fund"
                className="w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-[15px] text-[var(--text)] placeholder:text-[var(--text-faint)]"
              />
              <input
                type="number"
                value={goalTarget}
                onChange={(e) => setGoalTarget(e.target.value)}
                placeholder="Target amount"
                className="w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-[15px] text-[var(--text)] placeholder:text-[var(--text-faint)]"
              />
            </div>
            <Button size="sm" variant="secondary" icon={<Plus size={14} />} onClick={addQuickGoal}>
              Save goal
            </Button>
          </div>
        </Card>
      </motion.div>

      {insights.length > 0 && (
        <motion.div variants={revealItem} className="mb-5">
          <h2 className="mb-2.5 text-[13px] font-semibold text-[var(--text-muted)]">Insights</h2>
          <InsightList insights={insights} />
        </motion.div>
      )}

      <motion.div variants={revealItem} className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2">
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-[var(--text)]">Upcoming</h2>
            <Link to="/plan" className="text-xs font-medium text-[var(--accent-blue)]">
              See plan
            </Link>
          </div>
          <UpcomingList events={projection.events} />
        </Card>

        <Card className="flex flex-col">
          <h2 className="mb-3 text-[15px] font-semibold text-[var(--text)]">Thinking about buying something?</h2>
          <p className="mb-4 text-[13.5px] text-[var(--text-muted)]">
            See exactly how a purchase would change your projected balance before you commit.
          </p>
          <Link
            to="/purchases"
            className="mt-auto inline-flex items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2.5 text-sm font-medium text-[var(--text)] transition-colors hover:bg-[var(--border)]/40"
          >
            Open Purchases
          </Link>
        </Card>
      </motion.div>

      {data.goals.length > 0 && (
        <motion.div variants={revealItem}>
        <Card className="mt-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-[var(--text)]">Quick goals</h2>
            <Link to="/plan" className="text-xs font-medium text-[var(--accent-blue)]">
              Manage
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.goals.slice(0, 4).map((goal) => (
              <button
                key={goal.id}
                type="button"
                onClick={() => deleteGoal(goal.id)}
                className="rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1.5 text-xs font-medium text-[var(--text)] transition-colors hover:border-[var(--accent-red)] hover:text-[var(--accent-red)]"
              >
                {goal.name}
              </button>
            ))}
          </div>
        </Card>
        </motion.div>
      )}
      </motion.div>

      <QuickAddTransactionModal
        open={transactionModalOpen}
        onClose={() => setTransactionModalOpen(false)}
        initialMode={quickAddMode}
      />
    </div>
  );
}
