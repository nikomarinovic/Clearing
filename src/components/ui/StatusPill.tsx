import clsx from "clsx";

type Tone = "green" | "red" | "blue" | "amber" | "neutral";

const toneStyles: Record<Tone, string> = {
  green: "bg-[var(--accent-green-bg)] text-[var(--accent-green)]",
  red: "bg-[var(--accent-red-bg)] text-[var(--accent-red)]",
  blue: "bg-[var(--accent-blue-bg)] text-[var(--accent-blue)]",
  amber: "bg-[var(--accent-amber-bg)] text-[var(--accent-amber)]",
  neutral: "bg-[var(--surface-2)] text-[var(--text-muted)]",
};

const STATUS_TONE: Record<string, Tone> = {
  forecast: "amber",
  confirmed: "blue",
  received: "green",
  paid: "green",
  planned: "blue",
  considering: "amber",
  estimated: "amber",
};

export function StatusPill({ status, label }: { status: string; label?: string }) {
  const tone = STATUS_TONE[status] ?? "neutral";
  return (
    <span className={clsx("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize", toneStyles[tone])}>
      {label ?? status}
    </span>
  );
}

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <span className={clsx("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", toneStyles[tone])}>
      {children}
    </span>
  );
}
