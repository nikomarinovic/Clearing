import { NavLink } from "react-router-dom";
import { ArrowUpRight, Wallet } from "lucide-react";
import clsx from "clsx";
import { PRIMARY_NAV } from "../../lib/navigation";
import { useAppData } from "../../hooks/useAppData";

export function Sidebar() {
  const { data } = useAppData();

  return (
    <aside className="hidden w-[248px] shrink-0 flex-col border-r border-[var(--border)] px-4 py-6 lg:flex">
      <div className="mb-8 flex items-center gap-2 px-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[var(--text)] text-[var(--bg)]">
          <Wallet size={16} strokeWidth={2.25} />
        </div>
        <span className="text-[15px] font-semibold tracking-tight">Clearing</span>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5">
        {PRIMARY_NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 rounded-[12px] px-3 py-2.5 text-[14px] font-medium transition-colors",
                isActive
                  ? "bg-[var(--surface-2)] text-[var(--text)]"
                  : "text-[var(--text-muted)] hover:bg-[var(--surface-2)]/60 hover:text-[var(--text)]",
              )
            }
          >
            <item.icon size={18} strokeWidth={2} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-4 rounded-[16px] border border-[var(--border)] bg-[var(--surface-2)]/70 p-3">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-medium text-[var(--text-muted)]">Account</p>
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--accent-green-bg)] text-[var(--accent-green)]">
            <ArrowUpRight size={12} />
          </span>
        </div>
        <p className="text-sm font-semibold text-[var(--text)]">{data.profile.name || "Your finances"}</p>
        <p className="mt-0.5 text-xs text-[var(--text-faint)]">{data.profile.email || "No email saved"}</p>
        <p className="mt-2 text-[11px] uppercase tracking-[0.12em] text-[var(--text-faint)]">{data.profile.userType} mode</p>
      </div>
    </aside>
  );
}
