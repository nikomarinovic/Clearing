import { Bell, BellOff, Info } from "lucide-react";
import { SettingsBackHeader } from "../../components/settings/SettingsBackHeader";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Toggle } from "../../components/ui/Toggle";
import { useAppData } from "../../hooks/useAppData";
import { useToast } from "../../hooks/useToast";
import { useReminders } from "../../hooks/useReminders";

export default function NotificationsSettingsPage() {
  const { data, updateSettings } = useAppData();
  const { showToast } = useToast();
  const { permission, requestPermission } = useReminders();

  return (
    <div className="mx-auto max-w-xl pb-6">
      <SettingsBackHeader title="Notifications & reminders" subtitle="Local, on-device reminders — nothing sent to a server." />

      <Card>
        <div className="flex items-center justify-between gap-3 rounded-[14px] border border-[var(--border)] p-3.5">
          <div className="min-w-0 flex-1">
            <p className="text-[13.5px] font-medium text-[var(--text)]">In-app reminders</p>
            <p className="text-xs text-[var(--text-faint)]">Show reminder banners on the Dashboard</p>
          </div>
          <Toggle
            label="In-app reminders"
            checked={data.settings.reminders.enabled}
            onChange={(checked) => updateSettings({ reminders: { ...data.settings.reminders, enabled: checked } })}
          />
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 rounded-[14px] border border-[var(--border)] p-3.5">
          <div className="flex min-w-0 flex-1 items-start gap-2.5">
            {permission === "granted" ? (
              <Bell size={16} className="mt-0.5 shrink-0 text-[var(--accent-green)]" />
            ) : (
              <BellOff size={16} className="mt-0.5 shrink-0 text-[var(--text-faint)]" />
            )}
            <div>
              <p className="text-[13.5px] font-medium text-[var(--text)]">Push notifications</p>
              <p className="text-xs text-[var(--text-faint)]">
                {permission === "granted"
                  ? "Enabled — works while the app is open or recently used"
                  : permission === "denied"
                    ? "Blocked in your browser settings"
                    : permission === "unsupported"
                      ? "Not supported in this browser"
                      : "Turn on to receive reminders as real notifications"}
              </p>
            </div>
          </div>
          {permission !== "granted" && permission !== "unsupported" && permission !== "denied" && (
            <Button size="sm" variant="secondary" onClick={() => void requestPermission()}>
              Enable
            </Button>
          )}
        </div>

        {permission === "granted" && (
          <button
            type="button"
            onClick={async () => {
              const reg = await navigator.serviceWorker?.getRegistration();
              const title = "Test notification";
              const body = "If you can see this, notifications are working.";
              if (reg) {
                await reg.showNotification(title, { body, tag: "test-notification" });
              } else if (typeof Notification !== "undefined") {
                new Notification(title, { body });
              }
              showToast("Sent — check your notification tray.", "success");
            }}
            className="mt-3 w-full rounded-[12px] border border-dashed border-[var(--border-strong)] py-2.5 text-[13px] font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-2)]/60"
          >
            Send a test notification
          </button>
        )}

        <div className="mt-3 flex items-center justify-between gap-3 rounded-[14px] border border-[var(--border)] p-3.5">
          <div className="min-w-0 flex-1">
            <p className="text-[13.5px] font-medium text-[var(--text)]">Daily check-in</p>
            <p className="text-xs text-[var(--text-faint)]">
              {permission === "granted"
                ? "A notification if you haven't logged anything yet today"
                : "Needs push notifications enabled above"}
            </p>
          </div>
          <Toggle
            label="Daily check-in"
            checked={data.settings.reminders.dailyCheckInEnabled}
            onChange={(checked) => updateSettings({ reminders: { ...data.settings.reminders, dailyCheckInEnabled: checked } })}
          />
        </div>
      </Card>

      <Card className="mt-4 flex gap-2.5">
        <Info size={16} className="mt-0.5 shrink-0 text-[var(--text-faint)]" />
        <div className="text-[12.5px] leading-relaxed text-[var(--text-muted)]">
          <p className="mb-1.5 font-medium text-[var(--text)]">Why notifications need the app to be open (or recently used)</p>
          <p>
            Clearing has no server — everything lives only on this device, which is what keeps your financial data
            private. A notification that arrives while an iPhone is locked and the app isn't running has to come from
            somewhere: Apple's push service, triggered by a company's server. Without a server sending those pushes,
            there's no way for any notification — from this app or any purely on-device app — to reach a closed
            phone. What's here now fires as soon as you open Clearing (or while it's running in the background), and
            is calculated fresh from your own data each time.
          </p>
        </div>
      </Card>
    </div>
  );
}
