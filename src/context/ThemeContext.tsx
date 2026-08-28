import { createContext, useEffect, type ReactNode } from "react";
import { useAppData } from "../hooks/useAppData";
import type { ThemePreference } from "../types";

export interface ThemeContextValue {
  theme: ThemePreference;
  setTheme: (t: ThemePreference) => void;
  resolvedTheme: "light" | "dark";
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

function resolveTheme(pref: ThemePreference): "light" | "dark" {
  if (pref === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return pref;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { data, updateSettings, isLoaded } = useAppData();
  const theme = data.settings.theme;

  useEffect(() => {
    const apply = () => {
      const resolved = resolveTheme(theme);
      document.documentElement.setAttribute("data-theme", resolved);
    };
    apply();
    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      mq.addEventListener("change", apply);
      return () => mq.removeEventListener("change", apply);
    }
  }, [theme]);

  if (!isLoaded) return null;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme: (t) => updateSettings({ theme: t }),
        resolvedTheme: resolveTheme(theme),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
