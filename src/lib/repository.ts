import { storage } from "./storage";
import type { AppData } from "../types";

const DATA_KEY = "finance_app_data_v1";

export function createDefaultData(): AppData {
  return {
    profile: {
      name: "",
      email: "",
      userType: "regular",
      currency: "EUR",
      onboardingComplete: false,
      isLoggedIn: false,
      createdAt: new Date().toISOString(),
    },
    currentBalance: 0,
    income: [],
    expenses: [],
    trips: [],
    goals: [],
    wishes: [],
    settings: {
      theme: "system",
      cookieConsent: "unset",
      reducedMotion: false,
      budgets: [],
      reminders: {
        enabled: true,
        pushEnabled: false,
        billsDueDays: 3,
        lowBalanceThreshold: 0,
        goalDeadlineDays: 7,
        dailyCheckInEnabled: false,
        lastShown: {},
      },
      hapticsEnabled: true,
      cardStyle: "forest",
      ocrLanguages: ["eng", "hrv"],
    },
  };
}

/** Basic structural check so we never load garbage after an import. */
export function isValidAppData(value: unknown): value is AppData {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.currentBalance === "number" &&
    Array.isArray(v.income) &&
    Array.isArray(v.expenses) &&
    Array.isArray(v.trips) &&
    Array.isArray(v.goals) &&
    typeof v.profile === "object" &&
    v.profile !== null
  );
}

export function loadData(): AppData {
  const existing = storage.get<AppData>(DATA_KEY);
  if (existing && isValidAppData(existing)) {
    // merge with defaults to backfill any fields added in later versions
    const defaults = createDefaultData();
    return {
      ...defaults,
      ...existing,
      profile: { ...defaults.profile, ...existing.profile },
      settings: {
        ...defaults.settings,
        ...existing.settings,
        reminders: { ...defaults.settings.reminders, ...existing.settings?.reminders },
      },
    };
  }
  return createDefaultData();
}

export function saveData(data: AppData): void {
  storage.set(DATA_KEY, data);
}

export function clearData(): void {
  storage.remove(DATA_KEY);
}

export function exportDataAsJson(data: AppData): string {
  return JSON.stringify(data, null, 2);
}

export function parseImportedJson(json: string): AppData {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error("That file isn't valid JSON.");
  }
  if (!isValidAppData(parsed)) {
    throw new Error("That file doesn't look like a finance-app export.");
  }
  const defaults = createDefaultData();
  return {
    ...defaults,
    ...parsed,
    profile: { ...defaults.profile, ...parsed.profile },
    settings: {
      ...defaults.settings,
      ...parsed.settings,
      reminders: { ...defaults.settings.reminders, ...parsed.settings?.reminders },
    },
  };
}
