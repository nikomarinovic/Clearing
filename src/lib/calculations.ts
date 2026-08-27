import type {
  AppData,
  ExpenseEntry,
  IncomeEntry,
  ProjectionEvent,
  ProjectionPoint,
  ProjectionSummary,
  PurchaseAnalysis,
} from "../types";
import { addDaysIso, daysBetween, monthEndIso, todayIso } from "./format";

/**
 * Calculation engine
 * -------------------
 * Every function here is pure: same input -> same output, no reads from
 * localStorage, no `Date.now()` unless explicitly passed a reference date.
 * This keeps the whole engine unit-testable and keeps business logic out
 * of components entirely (see product principle #39/#32).
 *
 * Design decisions (documented so the rules are explicit, not implicit):
 * - `currentBalance` is treated as the literal amount in the user's
 *   account right now. Income already reflected there should not be
 *   re-added.
 * - "Right now" = current balance minus outstanding committed expenses
 *   (planned/confirmed, not yet paid) due within the current month.
 * - "Plan ahead" = current balance + income expected between now and the
 *   target date + expenses due in that window (recurring items are
 *   expanded into individual monthly occurrences).
 * - Expenses with status "considering" are excluded from projections by
 *   default (they're hypothetical) unless explicitly included, e.g. by
 *   the purchase analyzer / what-if simulator.
 */

function incomeAmount(entry: IncomeEntry): number {
  return entry.actualAmount ?? entry.expectedAmount;
}

/** How much of an income entry has actually landed in the account. Only "received" income is real money — forecast/confirmed is still just a projection. */
export function realizedIncomeContribution(entry: IncomeEntry): number {
  return entry.status === "received" ? incomeAmount(entry) : 0;
}

/** How much of an expense has actually left the account. Only "paid" is real; planned/confirmed/considering haven't happened yet. */
export function realizedExpenseContribution(entry: ExpenseEntry): number {
  return entry.status === "paid" ? -Math.abs(entry.amount) : 0;
}

function isIncomeCounted(entry: IncomeEntry): boolean {
  return entry.status === "forecast" || entry.status === "confirmed" || entry.status === "received";
}

function isExpenseCounted(entry: ExpenseEntry, includeConsidering: boolean): boolean {
  if (entry.status === "considering") return includeConsidering;
  return true;
}

/** Expand a recurring entry into one event per occurrence inside [from, to]. */
function expandOccurrences(dateIso: string, recurrence: string | undefined, from: string, to: string): string[] {
  if (!recurrence || recurrence === "none") {
    return dateIso >= from && dateIso <= to ? [dateIso] : [];
  }
  const dates: string[] = [];
  let cursor = new Date(dateIso);
  const fromD = new Date(from);
  const toD = new Date(to);

  const step = (d: Date) => {
    const next = new Date(d);
    if (recurrence === "weekly") next.setDate(next.getDate() + 7);
    else if (recurrence === "monthly") next.setMonth(next.getMonth() + 1);
    else if (recurrence === "yearly") next.setFullYear(next.getFullYear() + 1);
    else next.setMonth(next.getMonth() + 1);
    return next;
  };

  // fast-forward to first occurrence >= from
  let guard = 0;
  while (cursor < fromD && guard < 2000) {
    cursor = step(cursor);
    guard++;
  }
  guard = 0;
  while (cursor <= toD && guard < 500) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor = step(cursor);
    guard++;
  }
  return dates;
}

export function incomeEventsInRange(income: IncomeEntry[], from: string, to: string): ProjectionEvent[] {
  const events: ProjectionEvent[] = [];
  for (const entry of income) {
    if (!isIncomeCounted(entry)) continue;
    const occurrences = entry.kind === "recurring" ? expandOccurrences(entry.date, "monthly", from, to) : expandOccurrences(entry.date, "none", from, to);
    for (const date of occurrences) {
      events.push({
        id: `${entry.id}_${date}`,
        date,
        label: entry.label || entry.source || "Income",
        amount: incomeAmount(entry),
        kind: "income",
      });
    }
  }
  return events;
}

export function expenseEventsInRange(
  expenses: ExpenseEntry[],
  from: string,
  to: string,
  includeConsidering = false,
): ProjectionEvent[] {
  const events: ProjectionEvent[] = [];
  for (const entry of expenses) {
    if (!isExpenseCounted(entry, includeConsidering)) continue;
    const recurrence = entry.type === "recurring" ? entry.recurrence ?? "monthly" : "none";
    const occurrences = expandOccurrences(entry.date, recurrence, from, to);
    for (const date of occurrences) {
      events.push({
        id: `${entry.id}_${date}`,
        date,
        label: entry.name,
        amount: -Math.abs(entry.amount),
        kind: "expense",
        category: entry.category,
      });
    }
  }
  return events;
}

export interface BuildProjectionOptions {
  from?: string;
  to: string;
  includeConsidering?: boolean;
  extraEvents?: ProjectionEvent[];
}

function projectedEndBalance(
  data: AppData,
  from: string,
  to: string,
  includeConsidering = false,
  extraEvents: ProjectionEvent[] = [],
): number {
  const events = [
    ...incomeEventsInRange(data.income, from, to),
    ...expenseEventsInRange(data.expenses, from, to, includeConsidering),
    ...extraEvents,
  ].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

  let running = data.currentBalance;
  for (const event of events) {
    running += event.amount;
  }

  return Math.round(running * 100) / 100;
}

export function buildProjection(data: AppData, opts: BuildProjectionOptions): ProjectionSummary {
  const from = opts.from ?? todayIso();
  const to = opts.to;
  const includeConsidering = opts.includeConsidering ?? false;

  const events = [
    ...incomeEventsInRange(data.income, from, to),
    ...expenseEventsInRange(data.expenses, from, to, includeConsidering),
    ...(opts.extraEvents ?? []),
  ].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

  let running = data.currentBalance;
  const points: ProjectionPoint[] = [
    { date: from, label: "Now", balance: running, delta: 0, events: [] },
  ];

  const byDate = new Map<string, ProjectionEvent[]>();
  for (const ev of events) {
    if (!byDate.has(ev.date)) byDate.set(ev.date, []);
    byDate.get(ev.date)!.push(ev);
  }

  const sortedDates = Array.from(byDate.keys()).sort();
  for (const date of sortedDates) {
    const dayEvents = byDate.get(date)!;
    const delta = dayEvents.reduce((sum, e) => sum + e.amount, 0);
    running += delta;
    points.push({
      date,
      label: date,
      balance: Math.round(running * 100) / 100,
      delta: Math.round(delta * 100) / 100,
      events: dayEvents,
    });
  }

  const totalIncome = events.filter((e) => e.kind === "income").reduce((s, e) => s + e.amount, 0);
  const totalExpenses = events.filter((e) => e.kind === "expense").reduce((s, e) => s + Math.abs(e.amount), 0);

  return {
    startBalance: data.currentBalance,
    endBalance: Math.round(running * 100) / 100,
    totalIncome: Math.round(totalIncome * 100) / 100,
    totalExpenses: Math.round(totalExpenses * 100) / 100,
    safeToSpend: projectedEndBalance(data, from, to, includeConsidering, opts.extraEvents ?? []),
    points,
    events,
  };
}

/** "Right now" — current balance minus committed-but-unpaid expenses due this month. */
export function calculateRightNow(data: AppData): { balance: number; committed: number } {
  const today = todayIso();
  const monthEnd = monthEndIso(today);
  const committed = data.expenses
    .filter((e) => (e.status === "planned" || e.status === "confirmed") && e.date <= monthEnd)
    .reduce((sum, e) => sum + Math.abs(e.amount), 0);
  return {
    balance: Math.round((data.currentBalance - committed) * 100) / 100,
    committed: Math.round(committed * 100) / 100,
  };
}

/** Safe-to-spend: what's left this month after committed obligations, excluding "considering" items. */
export function calculateSafeToSpend(data: AppData): number {
  return calculateSafeToSpendDetails(data).amount;
}

/**
 * Safe-to-spend algorithm
 * -----------------------
 * A naive "balance projected to month-end" answer tends to equal the raw
 * balance whenever nothing else is scheduled that month, which looks static
 * and gives false confidence — it ignores spending that hasn't been
 * entered as a future expense yet (the everyday stuff: coffee, groceries,
 * top-ups). This version is a real, explainable algorithm with three parts:
 *
 * 1. Horizon: the window we're protecting money for — either the next
 *    expected payday (if one is on the books within 45 days) or a 14-day
 *    rolling window, whichever is more relevant. Money doesn't need to be
 *    "safe" past that point; it'll be reassessed once more is known.
 * 2. Committed: unpaid planned/confirmed expenses already on the books
 *    that fall inside that horizon — bills you know are coming.
 * 3. Behavioral buffer: your own recent average daily spend (paid expenses
 *    over the last 60 days, or however much history exists) projected
 *    across the horizon. This is what makes the number analyze actual
 *    habits instead of only counting what's been explicitly scheduled —
 *    it's why the figure comes out lower than your raw balance even in a
 *    quiet month with nothing "planned".
 *
 * safeToSpend = currentBalance − committed − behavioralBuffer, floored at 0.
 */
export interface SafeToSpendBreakdown {
  amount: number;
  horizon: string;
  horizonDays: number;
  committed: number;
  dailyAverageSpend: number;
  behavioralBuffer: number;
  basedOnDays: number;
}

function nextExpectedIncomeDate(income: IncomeEntry[], today: string): string | null {
  const upcoming = income
    .filter((i) => (i.status === "confirmed" || i.status === "forecast") && i.date > today)
    .sort((a, b) => (a.date < b.date ? -1 : 1));
  return upcoming[0]?.date ?? null;
}

/** Average real (paid) daily spend over the trailing window, used as the behavioral buffer's base rate. */
function averageDailySpend(expenses: ExpenseEntry[], today: string, lookbackDays = 60): { rate: number; basedOnDays: number } {
  const from = addDaysIso(today, -lookbackDays);
  const relevant = expenses.filter((e) => e.status === "paid" && e.date >= from && e.date <= today);
  if (relevant.length === 0) return { rate: 0, basedOnDays: 0 };
  const total = relevant.reduce((sum, e) => sum + Math.abs(e.amount), 0);
  const earliest = relevant.reduce((min, e) => (e.date < min ? e.date : min), today);
  const basedOnDays = Math.max(1, daysBetween(earliest, today));
  return { rate: Math.round((total / basedOnDays) * 100) / 100, basedOnDays };
}

export function calculateSafeToSpendDetails(data: AppData): SafeToSpendBreakdown {
  const today = todayIso();
  const monthEnd = monthEndIso(today);
  const nextIncome = nextExpectedIncomeDate(data.income, today);
  const rollingHorizon = addDaysIso(today, 14);

  // Prefer the next payday if it's reasonably soon; otherwise use whichever
  // of "end of this month" / a 2-week rolling window is further out, so the
  // number never collapses to zero window on the last day of the month.
  let horizon = nextIncome && nextIncome <= addDaysIso(today, 45) ? nextIncome : monthEnd > today ? monthEnd : rollingHorizon;
  if (horizon <= today) horizon = rollingHorizon;

  const horizonDays = Math.max(1, daysBetween(today, horizon));

  const committed = Math.round(
    data.expenses
      .filter((e) => (e.status === "planned" || e.status === "confirmed") && e.date > today && e.date <= horizon)
      .reduce((sum, e) => sum + Math.abs(e.amount), 0) * 100,
  ) / 100;

  const { rate: dailyAverageSpend, basedOnDays } = averageDailySpend(data.expenses, today);
  const behavioralBuffer = Math.round(dailyAverageSpend * horizonDays * 100) / 100;

  const raw = data.currentBalance - committed - behavioralBuffer;
  const amount = Math.max(0, Math.round(raw * 100) / 100);

  return { amount, horizon, horizonDays, committed, dailyAverageSpend, behavioralBuffer, basedOnDays };
}

export function calculatePurchaseImpact(
  data: AppData,
  price: number,
  targetDate: string,
  hourlyWage?: number,
): PurchaseAnalysis {
  const without = buildProjection(data, { to: targetDate, includeConsidering: false });
  const withPurchase = buildProjection(data, {
    to: targetDate,
    includeConsidering: false,
    extraEvents: [
      { id: "hypothetical_purchase", date: todayIso(), label: "This purchase", amount: -Math.abs(price), kind: "expense" },
    ],
  });

  const bufferReductionPercent = without.endBalance > 0 ? Math.min(100, (price / without.endBalance) * 100) : 100;

  return {
    price,
    balanceWithoutPurchase: without.endBalance,
    balanceWithPurchase: withPurchase.endBalance,
    workHours: hourlyWage ? Math.round((price / hourlyWage) * 10) / 10 : undefined,
    workDays: hourlyWage ? Math.round((price / hourlyWage / 7.5) * 10) / 10 : undefined,
    bufferReductionPercent: Math.round(bufferReductionPercent),
    affordable: withPurchase.endBalance >= 0,
  };
}

export function requiredMonthlySaving(target: number, current: number, targetDateIso?: string): number | null {
  if (!targetDateIso) return null;
  const days = Math.max(1, daysBetween(todayIso(), targetDateIso));
  const months = Math.max(1 / 30, days / 30);
  const remaining = Math.max(0, target - current);
  return Math.round((remaining / months) * 100) / 100;
}

export function daysToReachGoal(target: number, current: number, monthlyContribution: number): number | null {
  if (monthlyContribution <= 0) return null;
  const remaining = Math.max(0, target - current);
  const months = remaining / monthlyContribution;
  return Math.round(months * 30);
}

export function spendingByCategory(expenses: ExpenseEntry[], from?: string, to?: string): Record<string, number> {
  const result: Record<string, number> = {};
  for (const e of expenses) {
    if (from && e.date < from) continue;
    if (to && e.date > to) continue;
    if (e.status === "considering") continue;
    result[e.category] = (result[e.category] ?? 0) + Math.abs(e.amount);
  }
  return result;
}

export function monthlyTotals(
  income: IncomeEntry[],
  expenses: ExpenseEntry[],
  monthsBack = 5,
  monthsForward = 1,
): { month: string; income: number; expenses: number }[] {
  const now = new Date();
  const results: { month: string; income: number; expenses: number }[] = [];
  for (let i = -monthsBack; i <= monthsForward; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const monthStart = d.toISOString().slice(0, 10);
    const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().slice(0, 10);
    const monthLabel = d.toLocaleDateString("en-GB", { month: "short" });

    const incomeTotal = income
      .filter((it) => isIncomeCounted(it) && it.date >= monthStart && it.date <= monthEnd)
      .reduce((s, it) => s + incomeAmount(it), 0);
    const expenseTotal = expenses
      .filter((e) => e.status !== "considering" && e.date >= monthStart && e.date <= monthEnd)
      .reduce((s, e) => s + Math.abs(e.amount), 0);

    results.push({
      month: monthLabel,
      income: Math.round(incomeTotal * 100) / 100,
      expenses: Math.round(expenseTotal * 100) / 100,
    });
  }
  return results;
}

export function tripTotal(expenses: ExpenseEntry[], tripId: string): number {
  return expenses.filter((e) => e.tripId === tripId).reduce((s, e) => s + Math.abs(e.amount), 0);
}

export { addDaysIso };
