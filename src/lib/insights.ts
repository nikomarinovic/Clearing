import type { AppData } from "../types";
import { formatCurrency } from "./format";
import { calculateSafeToSpend, monthlyTotals, requiredMonthlySaving } from "./calculations";

export interface Insight {
  id: string;
  text: string;
  tone: "neutral" | "positive" | "warning";
}

/**
 * All insights are generated from rules applied to the user's own data.
 * There is no AI system behind this — keep it that way, per product
 * principle #36.
 */
export function generateInsights(data: AppData): Insight[] {
  const insights: Insight[] = [];
  const currency = data.profile.currency;

  const months = monthlyTotals(data.income, data.expenses, 2, 0);
  const thisMonth = months[months.length - 1];
  const lastMonth = months[months.length - 2];
  if (thisMonth && lastMonth && lastMonth.expenses > 0) {
    const change = ((thisMonth.expenses - lastMonth.expenses) / lastMonth.expenses) * 100;
    if (Math.abs(change) >= 10) {
      insights.push({
        id: "spending-change",
        tone: change > 0 ? "warning" : "positive",
        text: `Your spending is ${Math.abs(Math.round(change))}% ${change > 0 ? "higher" : "lower"} than last month.`,
      });
    }
  }

  const safeToSpend = calculateSafeToSpend(data);
  insights.push({
    id: "safe-to-spend",
    tone: safeToSpend < 0 ? "warning" : "neutral",
    text:
      safeToSpend < 0
        ? `Your planned expenses this month currently exceed your balance by ${formatCurrency(Math.abs(safeToSpend), currency)}.`
        : `You have ${formatCurrency(safeToSpend, currency)} available after this month's planned expenses.`,
  });

  for (const goal of data.goals) {
    const monthly = goal.monthlyContribution ?? requiredMonthlySaving(goal.targetAmount, goal.currentAmount, goal.targetDate);
    if (monthly && monthly > 0) {
      const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
      const months = Math.ceil(remaining / monthly);
      if (months > 0) {
        insights.push({
          id: `goal-${goal.id}`,
          tone: "positive",
          text: `If you save ${formatCurrency(monthly, currency)}/month, you'll reach your "${goal.name}" goal in about ${months} month${months === 1 ? "" : "s"}.`,
        });
      }
    }
  }

  const consideringItems = data.expenses.filter((e) => e.status === "considering");
  if (consideringItems.length > 0) {
    const item = consideringItems[0];
    insights.push({
      id: `considering-${item.id}`,
      tone: "neutral",
      text: `"${item.name}" (${formatCurrency(item.amount, currency)}) is still marked as "considering" — visit Purchases to see how it would affect your balance.`,
    });
  }

  return insights;
}
