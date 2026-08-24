import type { ReactNode } from "react";
import clsx from "clsx";
import { Card } from "../ui/Card";
import { AnimatedAmount } from "../common/AnimatedAmount";

export function QuickStatCard({
  label,
  value,
  tone = "default",
  icon,
}: {
  label: string;
  value: number;
  tone?: "default" | "green" | "red";
  icon?: ReactNode;
}) {
  const bgColor =
    tone === "green"
      ? "bg-[var(--accent-green-bg)]"
      : tone === "red"
        ? "bg-[var(--accent-red-bg)]"
        : "bg-[var(--surface-2)]";

  const iconColor =
    tone === "green"
      ? "text-[var(--accent-green)]"
      : tone === "red"
        ? "text-[var(--accent-red)]"
        : "text-[var(--accent-blue)]";

  const textColor =
    tone === "green"
      ? "text-[var(--accent-green)]"
      : tone === "red"
        ? "text-[var(--accent-red)]"
        : "text-[var(--text)]";

  const labelColor = tone === "default" ? "text-[var(--text-muted)]" : "text-current opacity-80";

  return (
    <Card padded={false} className={clsx("relative overflow-hidden", bgColor)}>
      <div
        className="absolute inset-0 opacity-5"
        style={{ backgroundImage: "radial-gradient(circle at 75% 25%, currentColor, transparent 60%)" }}
      />

      {/* Mobile: compact single row, stacked one per line */}
      <div className="relative flex items-center justify-between gap-3 px-4 py-3.5 sm:hidden">
        <div className="flex min-w-0 items-center gap-2.5">
          {icon && (
            <div className={clsx("flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10", iconColor)}>
              {icon}
            </div>
          )}
          <span className={clsx("truncate text-[13px] font-medium", labelColor)}>{label}</span>
        </div>
        <AnimatedAmount value={value} className={clsx("num shrink-0 text-[16px] font-semibold tracking-tight", textColor)} />
      </div>

      {/* Tablet/desktop: original stacked card in a grid */}
      <div className="relative hidden flex-col gap-2 py-4 sm:flex">
        <div className="flex items-center justify-between px-4">
          <span className={clsx("text-[12px] font-semibold uppercase tracking-widest", labelColor)}>{label}</span>
          {icon && <div className={clsx("flex h-7 w-7 items-center justify-center rounded-full bg-white/10", iconColor)}>{icon}</div>}
        </div>
        <div className="px-4">
          <AnimatedAmount value={value} className={clsx("num text-[26px] font-semibold tracking-tight", textColor)} />
        </div>
      </div>
    </Card>
  );
}
