// ---------------------------------------------------------------------------
// Core domain types
// ---------------------------------------------------------------------------

export type UserType = "student" | "regular";

export type ThemePreference = "system" | "light" | "dark";

export interface UserProfile {
  name: string;
  email: string;
  userType: UserType;
  currency: string; // ISO code, e.g. "EUR"
  onboardingComplete: boolean;
  isLoggedIn: boolean;
  createdAt: string;
  /** Small square photo as a data URL, stored locally. */
  avatarUrl?: string;
  /** Signature drawn/uploaded for the balance card, stored as a data URL. */
  cardSignatureUrl?: string;
}

// ---- Income -----------------------------------------------------------

export type IncomeStatus = "forecast" | "confirmed" | "received";
export type IncomeKind = "recurring" | "one-time";

export interface IncomeEntry {
  id: string;
  label: string;
  /** ISO date the income lands / is expected */
  date: string;
  expectedAmount: number;
  actualAmount?: number;
  status: IncomeStatus;
  kind: IncomeKind;
  hourlyWage?: number;
  expectedHours?: number;
  notes?: string;
  source?: string; // e.g. "Salary", "Freelance", "Bonus"
}

// ---- Expenses -----------------------------------------------------------

export type ExpenseCategory =
  | "Housing"
  | "Food"
  | "Transportation"
  | "Car"
  | "Travel"
  | "Shopping"
  | "Technology"
  | "Entertainment"
  | "Subscriptions"
  | "Education"
  | "Health"
  | "Personal"
  | "Other"
  | string;

export type ExpenseType = "one-time" | "recurring" | "planned" | "actual";
export type ExpenseStatus = "considering" | "planned" | "confirmed" | "paid";

export interface ExpenseEntry {
  id: string;
  name: string;
  amount: number;
  category: ExpenseCategory;
  date: string; // ISO date
  endDate?: string; // for ranges like trips
  type: ExpenseType;
  recurrence?: "monthly" | "weekly" | "yearly" | "none";
  status: ExpenseStatus;
  notes?: string;
  tripId?: string; // link back to a trip if this expense belongs to one
}

// ---- Wishes ---------------------------------------------------------

export interface WishItem {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  notes?: string;
  createdAt: string;
}

// ---- Trips -----------------------------------------------------------

export type TripExpenseCategory =
  | "Accommodation"
  | "Transportation"
  | "Bus"
  | "Train"
  | "Flight"
  | "Fuel"
  | "Food"
  | "Activities"
  | "Tickets"
  | "Shopping"
  | "Emergency buffer"
  | "Other";

export interface Trip {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  notes?: string;
}

// Trip expenses are stored as regular ExpenseEntry with tripId set and
// category drawn from TripExpenseCategory, status from ExpenseStatus.

// ---- Savings Goals -----------------------------------------------------

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
  monthlyContribution?: number;
  createdAt: string;
}

// ---- Category budgets -----------------------------------------------------

export interface CategoryBudget {
  category: ExpenseCategory;
  /** Monthly limit in the user's currency. */
  limit: number;
}

// ---- Reminders --------------------------------------------------------

export interface ReminderSettings {
  enabled: boolean;
  pushEnabled: boolean;
  billsDueDays: number; // warn when a bill is due within this many days
  lowBalanceThreshold: number; // warn when safe-to-spend drops below this
  goalDeadlineDays: number; // warn when a goal deadline is within this many days
  /** Nudge once a day if nothing has been logged yet. */
  dailyCheckInEnabled: boolean;
  /** date -> reminder ids already shown, so we don't repeat within a day */
  lastShown: Record<string, string[]>;
}

// ---- Settings -----------------------------------------------------------

export type CardStyle = "forest" | "midnight" | "sunset" | "mono" | "ocean" | "rose";

export interface AppSettings {
  theme: ThemePreference;
  cookieConsent: "accepted" | "rejected" | "unset";
  reducedMotion: boolean;
  budgets: CategoryBudget[];
  reminders: ReminderSettings;
  hapticsEnabled: boolean;
  cardStyle: CardStyle;
}

// ---- Aggregate app data (what is persisted) ------------------------------

export interface AppData {
  profile: UserProfile;
  currentBalance: number;
  income: IncomeEntry[];
  expenses: ExpenseEntry[];
  trips: Trip[];
  goals: SavingsGoal[];
  wishes: WishItem[];
  settings: AppSettings;
}

// ---- Calculation engine types --------------------------------------------

export interface ProjectionPoint {
  date: string;
  label: string;
  balance: number;
  delta: number;
  events: ProjectionEvent[];
}

export interface ProjectionEvent {
  id: string;
  date: string;
  label: string;
  amount: number; // positive = income, negative = expense
  kind: "income" | "expense";
  category?: string;
}

export interface ProjectionSummary {
  startBalance: number;
  endBalance: number;
  totalIncome: number;
  totalExpenses: number;
  safeToSpend: number;
  points: ProjectionPoint[];
  events: ProjectionEvent[];
}

// ---- Reminders (generated, not stored) ------------------------------------

export type ReminderSeverity = "info" | "warning" | "danger";
export type ReminderKind =
  | "bill-due"
  | "income-expected"
  | "low-balance"
  | "goal-deadline"
  | "over-budget"
  | "daily-checkin"
  | "wish-affordable"
  | "weekly-summary";

export interface Reminder {
  id: string;
  kind: ReminderKind;
  severity: ReminderSeverity;
  title: string;
  body: string;
  date: string; // ISO date this reminder is "for"
  href?: string; // where tapping it should navigate
  /**
   * True for nudge-style reminders (daily check-in, weekly summary, wish
   * affordability) that should only ever surface as a real system
   * notification, never as a static line sitting in the dashboard UI.
   * Reminders without this flag are genuine, data-driven warnings (a bill
   * due, over budget, low balance) and still show inline.
   */
  pushOnly?: boolean;
}

export interface PurchaseAnalysis {
  price: number;
  balanceWithoutPurchase: number;
  balanceWithPurchase: number;
  workHours?: number;
  workDays?: number;
  bufferReductionPercent: number;
  affordable: boolean;
}
