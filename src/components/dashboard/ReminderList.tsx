import { Link } from "react-router-dom";
import { AlertTriangle, Bell, Info, X } from "lucide-react";
import type { Reminder } from "../../types";

const severityStyles: Record<Reminder["severity"], string> = {
  info: "border-l-[var(--accent-blue)]",
  warning: "border-l-[var(--accent-amber,var(--accent-red))]",
  danger: "border-l-[var(--accent-red)]",
};

const severityIcon: Record<Reminder["severity"], typeof Bell> = {
  info: Info,
  warning: AlertTriangle,
  danger: AlertTriangle,
};

export function ReminderList({ reminders, onDismiss }: { reminders: Reminder[]; onDismiss: (id: string) => void }) {
  if (reminders.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {reminders.map((reminder) => {
        const Icon = severityIcon[reminder.severity];
        const content = (
          <div
            className={`flex items-start gap-2.5 rounded-[12px] border-l-[3px] bg-[var(--surface-2)]/60 px-3.5 py-3 text-[13.5px] leading-snug text-[var(--text)] ${severityStyles[reminder.severity]}`}
          >
            <Icon size={15} className="mt-0.5 shrink-0 text-[var(--text-muted)]" />
            <div className="flex-1">
              <p className="font-medium">{reminder.title}</p>
              <p className="text-[var(--text-muted)]">{reminder.body}</p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDismiss(reminder.id);
              }}
              className="shrink-0 rounded-full p-1 text-[var(--text-faint)] hover:bg-[var(--border)]/40 hover:text-[var(--text)]"
              aria-label="Dismiss reminder"
            >
              <X size={14} />
            </button>
          </div>
        );
        return reminder.href ? (
          <Link key={reminder.id} to={reminder.href} className="block">
            {content}
          </Link>
        ) : (
          <div key={reminder.id}>{content}</div>
        );
      })}
    </div>
  );
}
