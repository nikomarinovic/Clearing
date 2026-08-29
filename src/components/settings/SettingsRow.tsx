import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Card } from "../ui/Card";

export function SettingsSectionLabel({ children }: { children: ReactNode }) {
  return <p className="mb-2 mt-1 px-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-faint)]">{children}</p>;
}

export function SettingsGroup({ children }: { children: ReactNode }) {
  return (
    <Card padded={false}>
      <div className="divide-y divide-[var(--border)]">{children}</div>
    </Card>
  );
}

interface SettingsRowProps {
  to: string;
  icon: ReactNode;
  label: string;
  subtitle?: string;
}

/** A single navigable settings row — icon, label, small status subtitle, chevron. */
export function SettingsRow({ to, icon, label, subtitle }: SettingsRowProps) {
  return (
    <Link to={to} className="flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--surface-2)]/50">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-[var(--surface-2)] text-[var(--text-muted)]">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[14.5px] font-medium text-[var(--text)]">{label}</span>
        {subtitle && <span className="block truncate text-[12px] text-[var(--text-faint)]">{subtitle}</span>}
      </span>
      <ChevronRight size={16} className="shrink-0 text-[var(--text-faint)]" />
    </Link>
  );
}
