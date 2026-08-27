import { NavLink } from "react-router-dom";
import clsx from "clsx";
import { MOBILE_NAV } from "../../lib/navigation";

export function BottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-gradient-to-t from-[var(--surface)] via-[var(--surface)]/95 to-[var(--surface)]/90 backdrop-blur-xl lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Primary"
    >
      <div className="mx-auto flex max-w-md items-stretch justify-between px-1">
        {MOBILE_NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              clsx(
                "group relative flex flex-1 flex-col items-center gap-1 py-3 text-[11px] font-semibold transition-all",
                isActive ? "text-[var(--text)]" : "text-[var(--text-faint)] hover:text-[var(--text-muted)]",
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-green)]" />
                )}
                <div
                  className={clsx(
                    "transition-all duration-300",
                    isActive && "scale-110",
                  )}
                >
                  <item.icon size={20} strokeWidth={isActive ? 2.4 : 2} />
                </div>
                <span className={clsx("tracking-tight", isActive && "font-bold")}>
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
