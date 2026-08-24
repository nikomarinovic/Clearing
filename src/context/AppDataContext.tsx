import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import type {
  AppData,
  AppSettings,
  ExpenseEntry,
  IncomeEntry,
  SavingsGoal,
  Trip,
  UserProfile,
} from "../types";
import { createId } from "../lib/id";
import { createDefaultData, exportDataAsJson, loadData, parseImportedJson, saveData } from "../lib/repository";
import { realizedExpenseContribution, realizedIncomeContribution } from "../lib/calculations";

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export interface AppDataContextValue {
  data: AppData;
  isLoaded: boolean;

  setCurrentBalance: (amount: number) => void;
  updateProfile: (patch: Partial<UserProfile>) => void;
  updateSettings: (patch: Partial<AppSettings>) => void;
  completeOnboarding: () => void;
  loginUser: (name: string, email: string, password?: string) => void;
  logout: () => void;

  addIncome: (entry: Omit<IncomeEntry, "id">) => IncomeEntry;
  updateIncome: (id: string, patch: Partial<IncomeEntry>) => void;
  deleteIncome: (id: string) => void;

  addExpense: (entry: Omit<ExpenseEntry, "id">) => ExpenseEntry;
  updateExpense: (id: string, patch: Partial<ExpenseEntry>) => void;
  deleteExpense: (id: string) => void;

  addTrip: (trip: Omit<Trip, "id">) => Trip;
  updateTrip: (id: string, patch: Partial<Trip>) => void;
  deleteTrip: (id: string) => void;

  addGoal: (goal: Omit<SavingsGoal, "id" | "createdAt">) => SavingsGoal;
  updateGoal: (id: string, patch: Partial<SavingsGoal>) => void;
  deleteGoal: (id: string) => void;

  exportJson: () => string;
  importJson: (json: string) => void;
  resetAll: () => void;
}

export const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(createDefaultData);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setData(loadData());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) saveData(data);
  }, [data, isLoaded]);

  const setCurrentBalance = useCallback((amount: number) => {
    setData((d) => ({ ...d, currentBalance: amount }));
  }, []);

  const updateProfile = useCallback((patch: Partial<UserProfile>) => {
    setData((d) => ({ ...d, profile: { ...d.profile, ...patch } }));
  }, []);

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setData((d) => ({ ...d, settings: { ...d.settings, ...patch } }));
  }, []);

  const completeOnboarding = useCallback(() => {
    setData((d) => ({ ...d, profile: { ...d.profile, onboardingComplete: true } }));
  }, []);

  const loginUser = useCallback((name: string, email: string, _password?: string) => {
    setData((d) => ({
      ...d,
      profile: {
        ...d.profile,
        name: name.trim() || d.profile.name || "there",
        email: email.trim(),
        isLoggedIn: true,
        onboardingComplete: true,
      },
    }));
  }, []);

  const logout = useCallback(() => {
    setData((d) => ({
      ...d,
      profile: { ...d.profile, name: d.profile.name || "there", email: "", isLoggedIn: false },
    }));
  }, []);

  const addIncome = useCallback((entry: Omit<IncomeEntry, "id">) => {
    const full: IncomeEntry = { ...entry, id: createId("income") };
    setData((d) => ({
      ...d,
      income: [...d.income, full],
      // Only "received" income is real money in the account right now —
      // this keeps Current Balance a live ledger instead of a number you
      // have to keep retyping by hand.
      currentBalance: round2(d.currentBalance + realizedIncomeContribution(full)),
    }));
    return full;
  }, []);

  const updateIncome = useCallback((id: string, patch: Partial<IncomeEntry>) => {
    setData((d) => {
      const existing = d.income.find((i) => i.id === id);
      if (!existing) return d;
      const patched = { ...existing, ...patch };
      const delta = realizedIncomeContribution(patched) - realizedIncomeContribution(existing);
      return {
        ...d,
        income: d.income.map((i) => (i.id === id ? patched : i)),
        currentBalance: round2(d.currentBalance + delta),
      };
    });
  }, []);

  const deleteIncome = useCallback((id: string) => {
    setData((d) => {
      const existing = d.income.find((i) => i.id === id);
      const delta = existing ? -realizedIncomeContribution(existing) : 0;
      return {
        ...d,
        income: d.income.filter((i) => i.id !== id),
        currentBalance: round2(d.currentBalance + delta),
      };
    });
  }, []);

  const addExpense = useCallback((entry: Omit<ExpenseEntry, "id">) => {
    const full: ExpenseEntry = { ...entry, id: createId("expense") };
    setData((d) => ({
      ...d,
      expenses: [...d.expenses, full],
      // Only "paid" expenses have actually left the account.
      currentBalance: round2(d.currentBalance + realizedExpenseContribution(full)),
    }));
    return full;
  }, []);

  const updateExpense = useCallback((id: string, patch: Partial<ExpenseEntry>) => {
    setData((d) => {
      const existing = d.expenses.find((e) => e.id === id);
      if (!existing) return d;
      const patched = { ...existing, ...patch };
      const delta = realizedExpenseContribution(patched) - realizedExpenseContribution(existing);
      return {
        ...d,
        expenses: d.expenses.map((e) => (e.id === id ? patched : e)),
        currentBalance: round2(d.currentBalance + delta),
      };
    });
  }, []);

  const deleteExpense = useCallback((id: string) => {
    setData((d) => {
      const existing = d.expenses.find((e) => e.id === id);
      const delta = existing ? -realizedExpenseContribution(existing) : 0;
      return {
        ...d,
        expenses: d.expenses.filter((e) => e.id !== id),
        currentBalance: round2(d.currentBalance + delta),
      };
    });
  }, []);

  const addTrip = useCallback((trip: Omit<Trip, "id">) => {
    const full: Trip = { ...trip, id: createId("trip") };
    setData((d) => ({ ...d, trips: [...d.trips, full] }));
    return full;
  }, []);

  const updateTrip = useCallback((id: string, patch: Partial<Trip>) => {
    setData((d) => ({ ...d, trips: d.trips.map((t) => (t.id === id ? { ...t, ...patch } : t)) }));
  }, []);

  const deleteTrip = useCallback((id: string) => {
    setData((d) => ({
      ...d,
      trips: d.trips.filter((t) => t.id !== id),
      expenses: d.expenses.filter((e) => e.tripId !== id),
    }));
  }, []);

  const addGoal = useCallback((goal: Omit<SavingsGoal, "id" | "createdAt">) => {
    const full: SavingsGoal = { ...goal, id: createId("goal"), createdAt: new Date().toISOString() };
    setData((d) => ({ ...d, goals: [...d.goals, full] }));
    return full;
  }, []);

  const updateGoal = useCallback((id: string, patch: Partial<SavingsGoal>) => {
    setData((d) => ({ ...d, goals: d.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)) }));
  }, []);

  const deleteGoal = useCallback((id: string) => {
    setData((d) => ({ ...d, goals: d.goals.filter((g) => g.id !== id) }));
  }, []);

  const exportJson = useCallback(() => exportDataAsJson(data), [data]);

  const importJson = useCallback((json: string) => {
    const imported = parseImportedJson(json);
    setData(imported);
  }, []);

  const resetAll = useCallback(() => {
    setData(createDefaultData());
  }, []);

  const value = useMemo<AppDataContextValue>(
    () => ({
      data,
      isLoaded,
      setCurrentBalance,
      updateProfile,
      updateSettings,
      completeOnboarding,
      loginUser,
      logout,
      addIncome,
      updateIncome,
      deleteIncome,
      addExpense,
      updateExpense,
      deleteExpense,
      addTrip,
      updateTrip,
      deleteTrip,
      addGoal,
      updateGoal,
      deleteGoal,
      exportJson,
      importJson,
      resetAll,
    }),
    [
      data,
      isLoaded,
      setCurrentBalance,
      updateProfile,
      updateSettings,
      completeOnboarding,
      loginUser,
      logout,
      addIncome,
      updateIncome,
      deleteIncome,
      addExpense,
      updateExpense,
      deleteExpense,
      addTrip,
      updateTrip,
      deleteTrip,
      addGoal,
      updateGoal,
      deleteGoal,
      exportJson,
      importJson,
      resetAll,
    ],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}
