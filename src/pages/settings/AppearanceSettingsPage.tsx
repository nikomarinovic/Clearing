import { Sun, Moon, Laptop } from "lucide-react";
import clsx from "clsx";
import { SettingsBackHeader } from "../../components/settings/SettingsBackHeader";
import { Card } from "../../components/ui/Card";
import { useTheme } from "../../hooks/useTheme";
import type { ThemePreference } from "../../types";

const THEME_OPTIONS: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Laptop },
];

export default function AppearanceSettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="mx-auto max-w-xl pb-6">
      <SettingsBackHeader title="Appearance" subtitle="Light, dark, or match your system." />
      <Card>
        <div className="grid grid-cols-3 gap-2">
          {THEME_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTheme(opt.value)}
              className={clsx(
                "flex flex-col items-center gap-2 rounded-[14px] border p-3.5 text-[13px] font-medium transition-colors",
                theme === opt.value ? "border-[var(--text)] bg-[var(--surface-2)]" : "border-[var(--border)] text-[var(--text-muted)]",
              )}
            >
              <opt.icon size={17} />
              {opt.label}
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
