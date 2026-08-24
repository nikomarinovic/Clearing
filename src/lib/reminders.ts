import type { AppData, Reminder } from "../types";
import { calculateSafeToSpend, spendingByCategory } from "./calculations";
import { addDaysIso, formatCurrency, formatDate, todayIso } from "./format";

/**
 * Reminders engine
 * ----------------
 * Deliberately rule-based, not AI-driven: every reminder here is a plain
 * `if` over data the user already entered. No network calls, nothing sent
 * anywhere, works fully offline. Kept as pure functions so it's easy to
 * unit-test and reuse both for the in-app banner and for native
 * notifications (see useReminders.ts).
 */

function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

export function generateReminders(data: AppData): Reminder[] {
  const reminders: Reminder[] = [];
  const today = todayIso();
  const { reminders: settings } = data.settings;
  const currency = data.profile.currency;

  if (!settings.enabled) return reminders;

  // 1. Bills due soon (planned/confirmed expenses within N days).
  const billHorizon = addDaysIso(today, settings.billsDueDays);
  for (const expense of data.expenses) {
    if (expense.status !== "planned" && expense.status !== "confirmed") continue;
    if (expense.date < today || expense.date > billHorizon) continue;
    const daysAway = Math.round((new Date(expense.date).getTime() - new Date(today).getTime()) / 86_400_000);
    reminders.push({
      id: `bill_${expense.id}_${expense.date}`,
      kind: "bill-due",
      severity: daysAway <= 1 ? "danger" : "warning",
      title: daysAway <= 0 ? `${expense.name} is due today` : `${expense.name} due in ${daysAway}d`,
      body: `${formatCurrency(Math.abs(expense.amount), currency)} \u2014 ${formatDate(expense.date)}`,
      date: expense.date,
      href: "/plan",
    });
  }

  // 2. Income expected soon (forecast/confirmed, not yet received).
  for (const income of data.income) {
    if (income.status === "received") continue;
    if (income.date < today || income.date > billHorizon) continue;
    reminders.push({
      id: `income_${income.id}_${income.date}`,
      kind: "income-expected",
      severity: "info",
      title: `${income.label || income.source || "Income"} expected`,
      body: `${formatCurrency(income.expectedAmount, currency)} \u2014 ${formatDate(income.date)}`,
      date: income.date,
      href: "/plan",
    });
  }

  // 3. Safe-to-spend below threshold.
  const safeToSpend = calculateSafeToSpend(data);
  if (safeToSpend < settings.lowBalanceThreshold) {
    reminders.push({
      id: `low_balance_${monthKey(today)}`,
      kind: "low-balance",
      severity: safeToSpend < 0 ? "danger" : "warning",
      title: safeToSpend < 0 ? "You're projected to go negative" : "Safe-to-spend is low",
      body: `Safe to spend this month: ${formatCurrency(safeToSpend, currency)}`,
      date: today,
      href: "/",
    });
  }

  // 4. Savings goal deadlines approaching.
  const goalHorizon = addDaysIso(today, settings.goalDeadlineDays);
  for (const goal of data.goals) {
    if (!goal.targetDate) continue;
    if (goal.targetDate < today || goal.targetDate > goalHorizon) continue;
    if (goal.currentAmount >= goal.targetAmount) continue;
    const remaining = goal.targetAmount - goal.currentAmount;
    reminders.push({
      id: `goal_${goal.id}_${goal.targetDate}`,
      kind: "goal-deadline",
      severity: "warning",
      title: `"${goal.name}" deadline approaching`,
      body: `${formatCurrency(remaining, currency)} short \u2014 due ${formatDate(goal.targetDate)}`,
      date: goal.targetDate,
      href: "/plan",
    });
  }

  // 5. Over budget in a category this month.
  const monthStart = `${monthKey(today)}-01`;
  const spend = spendingByCategory(data.expenses, monthStart, today);
  for (const budget of data.settings.budgets) {
    const spent = spend[budget.category] ?? 0;
    if (budget.limit > 0 && spent > budget.limit) {
      reminders.push({
        id: `budget_${budget.category}_${monthKey(today)}`,
        kind: "over-budget",
        severity: "warning",
        title: `Over budget: ${budget.category}`,
        body: `${formatCurrency(spent, currency)} of ${formatCurrency(budget.limit, currency)} spent this month`,
        date: today,
        href: "/analytics",
      });
    }
  }

  // 6. Daily check-in — a gentle "don't forget" nudge if nothing has been
  // logged (added or edited) yet today. Opt-in, off by default.
  if (settings.dailyCheckInEnabled) {
    const loggedToday = [...data.income, ...data.expenses].some((entry) => entry.date === today);
    if (!loggedToday) {
      reminders.push({
        id: `daily_checkin_${today}`,
        kind: "daily-checkin",
        severity: "info",
        title: "Don't forget to log today",
        body: "Nothing logged yet today — add any income or expenses to keep your balance accurate.",
        date: today,
        href: "/transactions",
      });
    }
  }

  return reminders.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}

/** Reminders not already shown today, per settings.reminders.lastShown. */
export function newReminders(data: AppData): Reminder[] {
  const all = generateReminders(data);
  const today = todayIso();
  const shown = new Set(data.settings.reminders.lastShown[today] ?? []);
  return all.filter((r) => !shown.has(r.id));
}
