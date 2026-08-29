import { Link } from "react-router-dom";
import { UserRound, CreditCard, Wallet, Sun, Moon, Laptop, Bell, Vibrate, Smartphone, Download, Shield, ChevronRight, ScrollText } from "lucide-react";
import { PageHeader } from "../components/common/PageHeader";
import { Card } from "../components/ui/Card";
import { SettingsGroup, SettingsRow, SettingsSectionLabel } from "../components/settings/SettingsRow";
import { CARD_STYLES } from "../lib/cardStyles";
import { useAppData } from "../hooks/useAppData";
import { useTheme } from "../hooks/useTheme";
import { useInstallPrompt } from "../hooks/useInstallPrompt";
import { useReminders } from "../hooks/useReminders";

export default function SettingsPage() {
  const { data } = useAppData();
  const { theme } = useTheme();
  const { installed, canPrompt } = useInstallPrompt();
  const { permission } = useReminders();

  const cardSwatch = CARD_STYLES.find((s) => s.id === data.settings.cardStyle);
  const themeLabel = theme === "light" ? "Light" : theme === "dark" ? "Dark" : "System";
  const ThemeIcon = theme === "light" ? Sun : theme === "dark" ? Moon : Laptop;
  const notificationsSubtitle =
    permission === "granted" ? "On" : permission === "denied" ? "Blocked" : permission === "unsupported" ? "Not supported" : "Off";

  return (
    <div className="pb-6">
      <PageHeader title="Settings" subtitle="Your profile, appearance, and data." />

      <div className="flex flex-col gap-5">
        {/* Quick, one-tap install banner — everything else about installing lives in its own page. */}
        {!installed && canPrompt && (
          <Link to="/settings/install">
            <Card className="flex items-center gap-3 !p-3.5" interactive>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[var(--accent-green)]/12 text-[var(--accent-green)]">
                <Download size={16} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13.5px] font-medium text-[var(--text)]">Install Clearing</span>
                <span className="block text-[12px] text-[var(--text-faint)]">Add to your home screen</span>
              </span>
              <ChevronRight size={16} className="shrink-0 text-[var(--text-faint)]" />
            </Card>
          </Link>
        )}

        <div>
          <SettingsSectionLabel>Account</SettingsSectionLabel>
          <SettingsGroup>
            <SettingsRow
              to="/settings/profile"
              icon={<UserRound size={16} />}
              label="Profile"
              subtitle={data.profile.name ? `${data.profile.name} · ${data.profile.currency}` : data.profile.currency}
            />
            <SettingsRow
              to="/settings/card"
              icon={<CreditCard size={16} />}
              label="Your card"
              subtitle={cardSwatch ? `${cardSwatch.label} style` : undefined}
            />
            <SettingsRow to="/settings/balance" icon={<Wallet size={16} />} label="Balance" subtitle="Reconcile with your bank" />
          </SettingsGroup>
        </div>

        <div>
          <SettingsSectionLabel>Preferences</SettingsSectionLabel>
          <SettingsGroup>
            <SettingsRow to="/settings/appearance" icon={<ThemeIcon size={16} />} label="Appearance" subtitle={themeLabel} />
            <SettingsRow
              to="/settings/notifications"
              icon={<Bell size={16} />}
              label="Notifications & reminders"
              subtitle={notificationsSubtitle}
            />
            <SettingsRow
              to="/settings/haptics"
              icon={<Vibrate size={16} />}
              label="Haptic feedback"
              subtitle={data.settings.hapticsEnabled ? "On" : "Off"}
            />
          </SettingsGroup>
        </div>

        <div>
          <SettingsSectionLabel>App</SettingsSectionLabel>
          <SettingsGroup>
            <SettingsRow
              to="/settings/install"
              icon={<Smartphone size={16} />}
              label="Install app"
              subtitle={installed ? "Installed" : "Add to home screen"}
            />
            <SettingsRow to="/settings/data" icon={<Shield size={16} />} label="Data & privacy" subtitle="Export, import, reset" />
            <SettingsRow to="/settings/legal" icon={<ScrollText size={16} />} label="Legal" />
          </SettingsGroup>
        </div>
      </div>
    </div>
  );
}
