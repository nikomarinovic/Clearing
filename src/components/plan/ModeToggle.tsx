import clsx from "clsx";

export type PlanMode = "now" | "ahead";

export function ModeToggle({ mode, onChange }: { mode: PlanMode; onChange: (m: PlanMode) => void }) {
  return (
    <div className="inline-flex rounded-full bg-[var(--surface-2)] p-1">
      {(["now", "ahead"] as PlanMode[]).map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={clsx(
            "rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors",
            mode === m ? "bg-[var(--surface)] text-[var(--text)] shadow-[var(--shadow-sm)]" : "text-[var(--text-muted)]",
          )}
        >
          {m === "now" ? "Right Now" : "Plan Ahead"}
        </button>
      ))}
    </div>
  );
}
