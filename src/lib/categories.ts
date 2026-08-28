import type { ExpenseCategory, TripExpenseCategory } from "../types";

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "Housing",
  "Food",
  "Transportation",
  "Car",
  "Travel",
  "Shopping",
  "Technology",
  "Entertainment",
  "Subscriptions",
  "Education",
  "Health",
  "Personal",
  "Other",
];

export const TRIP_EXPENSE_CATEGORIES: TripExpenseCategory[] = [
  "Accommodation",
  "Transportation",
  "Bus",
  "Train",
  "Flight",
  "Fuel",
  "Food",
  "Activities",
  "Tickets",
  "Shopping",
  "Emergency buffer",
  "Other",
];

// Chart colors, drawn from the CSS custom-property palette so they stay
// consistent across chart libraries and light/dark themes.
export const CATEGORY_COLORS: Record<string, string> = {
  Housing: "#6E7CE0",
  Food: "#E0A23B",
  Transportation: "#3BAEE0",
  Car: "#7C8CA6",
  Travel: "#3BC7E0",
  Shopping: "#E06B9E",
  Technology: "#8A6FE0",
  Entertainment: "#E0866B",
  Subscriptions: "#B3A16B",
  Education: "#4FAF7A",
  Health: "#E0555B",
  Personal: "#59B6A0",
  Other: "#9A9A94",
};

export function colorForCategory(category: string): string {
  return CATEGORY_COLORS[category] ?? "#9A9A94";
}
