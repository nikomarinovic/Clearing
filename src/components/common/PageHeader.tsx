import type { ReactNode } from "react";

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4 sm:mb-6">
      <div className="flex-1">
        <h1 className="text-[26px] font-bold leading-tight tracking-tight text-[var(--text)] sm:text-[22px]">{title}</h1>
        {subtitle && <p className="mt-1.5 text-[14.5px] leading-6 text-[var(--text-muted)] sm:mt-1 sm:text-[14px]">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
