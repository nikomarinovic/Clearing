import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Sun, Moon, Laptop, Download, Upload, RotateCcw, ChevronRight, Shield, Smartphone, Share, PlusSquare, CheckCircle2, Bell, BellOff, Vibrate, Zap, Wallet } from "lucide-react";
import { PageHeader } from "../components/common/PageHeader";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Field, Input, Select } from "../components/ui/Field";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { Toggle } from "../components/ui/Toggle";
import { useAppData } from "../hooks/useAppData";
import { useTheme } from "../hooks/useTheme";
import { useToast } from "../hooks/useToast";
import { useInstallPrompt } from "../hooks/useInstallPrompt";
import { useReminders } from "../hooks/useReminders";
import { haptic } from "../lib/haptics";
import type { ThemePreference, UserType } from "../types";
import clsx from "clsx";

const THEME_OPTIONS: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Laptop },
];

const LEGAL_LINKS = [
  { slug: "privacy", label: "Privacy Policy" },
  { slug: "terms", label: "Terms of Service" },
  { slug: "cookies", label: "Cookie Policy" },
  { slug: "notice", label: "Legal Notice" },
];

export default function SettingsPage() {
  const { data, updateProfile, updateSettings, setCurrentBalance, exportJson, importJson, resetAll } = useAppData();
  const { theme, setTheme } = useTheme();
  const { showToast } = useToast();
  const { installed, canPrompt, isIos, promptInstall } = useInstallPrompt();
  const { permission, requestPermission } = useReminders();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [balanceDraft, setBalanceDraft] = useState(data.currentBalance.toFixed(2));

  useEffect(() => {
    setBalanceDraft(data.currentBalance.toFixed(2));
  }, [data.currentBalance]);

  const saveBalance = () => {
    const parsed = Number.parseFloat(balanceDraft);
    if (Number.isNaN(parsed)) {
      showToast("Enter a valid number", "warning");
      setBalanceDraft(data.currentBalance.toFixed(2));
      return;
    }
    setCurrentBalance(Math.round(parsed * 100) / 100);
    showToast("Balance updated", "success");
  };

  const handleExport = () => {
    const json = exportJson();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `finance-data-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Data exported", "success");
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("Choose an image file", "warning");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        // Downscale to a small square so it stays cheap in localStorage.
        const size = 256;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const scale = Math.max(size / img.width, size / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
        updateProfile({ avatarUrl: canvas.toDataURL("image/jpeg", 0.85) });
        showToast("Profile photo updated", "success");
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleInstall = async () => {
    const outcome = await promptInstall();
    if (outcome === "accepted") showToast("App installed", "success");
    else if (outcome === "dismissed") showToast("Installation dismissed", "neutral");
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        importJson(String(reader.result));
        showToast("Data imported", "success");
      } catch (err) {
        showToast(err instanceof Error ? err.message : "Import failed", "warning");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="pb-6">
      <PageHeader title="Settings" subtitle="Your profile, appearance, and data." />

      <div className="flex flex-col gap-5">
        <Card>
          <h2 className="mb-4 text-[15px] font-semibold text-[var(--text)]">Profile</h2>
          <div className="mb-4 flex items-center gap-4">
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              aria-label="Change profile photo"
              className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-[var(--border)] bg-[var(--surface-2)]"
            >
              {data.profile.avatarUrl ? (
                <img src={data.profile.avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-lg font-semibold text-[var(--text-muted)]">
                  {(data.profile.name || "?").trim().charAt(0).toUpperCase()}
                </span>
              )}
            </button>
            <div className="flex flex-col gap-1.5">
              <Button size="sm" variant="secondary" onClick={() => avatarInputRef.current?.click()}>
                {data.profile.avatarUrl ? "Change photo" : "Add photo"}
              </Button>
              {data.profile.avatarUrl && (
                <button
                  type="button"
                  onClick={() => updateProfile({ avatarUrl: undefined })}
                  className="text-xs text-[var(--text-faint)] hover:text-[var(--accent-red)]"
                >
                  Remove photo
                </button>
              )}
            </div>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarFile}
            />
          </div>
          <div className="flex flex-col gap-4">
            <Field label="Name">
              <Input value={data.profile.name} onChange={(e) => updateProfile({ name: e.target.value })} placeholder="Your name" />
            </Field>
            <Field label="I am a...">
              <Select value={data.profile.userType} onChange={(e) => updateProfile({ userType: e.target.value as UserType })}>
                <option value="student">Student</option>
                <option value="regular">Regular income</option>
              </Select>
            </Field>
            <Field label="Currency">
              <Select value={data.profile.currency} onChange={(e) => updateProfile({ currency: e.target.value })}>
                <option value="EUR">EUR &euro;</option>
                <option value="USD">USD $</option>
                <option value="GBP">GBP £</option>
              </Select>
            </Field>
          </div>
        </Card>

        <Card>
          <h2 className="mb-1 flex items-center gap-2 text-[15px] font-semibold text-[var(--text)]">
            <Wallet size={16} /> Balance
          </h2>
          <p className="mb-4 text-[13px] text-[var(--text-muted)]">
            Updates automatically whenever you log something as paid or received. Adjust it here only to reconcile
            with your real bank balance (cash, bank fees, interest, anything not logged in the app).
          </p>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-faint)]">
                &euro;
              </span>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                value={balanceDraft}
                onChange={(e) => setBalanceDraft(e.target.value)}
                className="num w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] py-2.5 pl-8 pr-3.5 text-[15px] text-[var(--text)] focus:border-[var(--accent-blue)] focus:outline-none"
              />
            </div>
            <Button size="sm" onClick={saveBalance} disabled={Number.parseFloat(balanceDraft) === data.currentBalance}>
              Save
            </Button>
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 text-[15px] font-semibold text-[var(--text)]">Appearance</h2>
          <div className="grid grid-cols-3 gap-2">
            {THEME_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={clsx(
                  "flex flex-col items-center gap-2 rounded-[14px] border p-3.5 text-[13px] font-medium transition-colors",
                  theme === opt.value ? "border-[var(--text)] bg-[var(--surface-2)]" : "border-[var(--border)] text-[var(--text-muted)]",
                )}
              >
                <opt.icon size={17} />
                {opt.label}
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="mb-1 flex items-center gap-2 text-[15px] font-semibold text-[var(--text)]">
            <Bell size={16} /> Notifications & reminders
          </h2>
          <p className="mb-4 text-[13px] text-[var(--text-muted)]">
            Local, on-device reminders for bills due soon, low safe-to-spend, and budgets going over. Nothing is
            sent to a server \u2014 these are calculated on this device from your own data.
          </p>

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
            <div className="min-w-0 flex-1">
              <p className="text-[13.5px] font-medium text-[var(--text)]">Daily check-in</p>
              <p className="text-xs text-[var(--text-faint)]">A once-a-day nudge if you haven't logged anything yet</p>
            </div>
            <Toggle
              label="Daily check-in"
              checked={data.settings.reminders.dailyCheckInEnabled}
              onChange={(checked) => updateSettings({ reminders: { ...data.settings.reminders, dailyCheckInEnabled: checked } })}
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
                    ? "Enabled \u2014 works while the app is open or recently used"
                    : permission === "denied"
                      ? "Blocked in your browser settings"
                      : permission === "unsupported"
                        ? "Not supported in this browser"
                        : "Get a native notification for urgent reminders"}
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
                showToast("Sent \u2014 check your notification tray.", "success");
              }}
              className="mt-3 w-full rounded-[12px] border border-dashed border-[var(--border-strong)] py-2.5 text-[13px] font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-2)]/60"
            >
              Send a test notification
            </button>
          )}
        </Card>

        <Card>
          <h2 className="mb-1 flex items-center gap-2 text-[15px] font-semibold text-[var(--text)]">
            <Vibrate size={16} /> Haptic feedback
          </h2>
          <div className="flex items-center justify-between gap-3">
            <p className="min-w-0 flex-1 text-[13px] text-[var(--text-muted)]">Subtle vibration when you add a transaction.</p>
            <Toggle
              label="Haptic feedback"
              checked={data.settings.hapticsEnabled}
              onChange={(checked) => updateSettings({ hapticsEnabled: checked })}
            />
          </div>

          {typeof navigator !== "undefined" && "vibrate" in navigator ? (
            <button
              type="button"
              onClick={() => {
                haptic("success", true);
                showToast("Buzzed \u2014 felt it? Haptics work on this device.", "success");
              }}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-[12px] border border-dashed border-[var(--border-strong)] py-2.5 text-[13px] font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-2)]/60"
            >
              <Zap size={14} /> Test vibration
            </button>
          ) : (
            <p className="mt-3 text-xs text-[var(--text-faint)]">
              This browser doesn't support vibration (iPhones don't, on any browser \u2014 that's an iOS/Safari limit,
              not this app).
            </p>
          )}
        </Card>

        {!installed && (
          <Card>
            <h2 className="mb-1 flex items-center gap-2 text-[15px] font-semibold text-[var(--text)]">
              <Smartphone size={16} /> Install app
            </h2>
            <p className="mb-4 text-[13px] text-[var(--text-muted)]">
              Add Clearing to your home screen for a faster, full-screen, app-like experience. Your data stays exactly
              where it is — stored locally on this device.
            </p>

            {canPrompt ? (
              <Button icon={<Download size={15} />} onClick={handleInstall}>
                Add to Home Screen
              </Button>
            ) : isIos ? (
              <div className="flex flex-col gap-2.5 rounded-[14px] bg-[var(--surface-2)]/60 p-4 text-[13.5px] text-[var(--text)]">
                <p className="font-medium">On iPhone/iPad (Safari):</p>
                <p className="flex items-center gap-2">
                  <Share size={15} className="shrink-0 text-[var(--text-muted)]" /> 1. Tap the Share button
                </p>
                <p className="flex items-center gap-2">
                  <PlusSquare size={15} className="shrink-0 text-[var(--text-muted)]" /> 2. Tap "Add to Home Screen"
                </p>
              </div>
            ) : (
              <p className="text-[13px] text-[var(--text-faint)]">
                Open this page in Chrome, Edge, or another PWA-capable browser, then use the browser menu's "Install
                app" or "Add to Home Screen" option.
              </p>
            )}
          </Card>
        )}
        {installed && (
          <Card className="flex items-center gap-2.5 text-[13.5px] text-[var(--text-muted)]">
            <CheckCircle2 size={16} className="text-[var(--accent-green)]" /> Installed as an app on this device.
          </Card>
        )}

        <Card>
          <h2 className="mb-1 text-[15px] font-semibold text-[var(--text)]">Your data</h2>
          <p className="mb-4 flex items-center gap-1.5 text-[13px] text-[var(--text-muted)]">
            <Shield size={13} /> Stored locally on this device only.
          </p>
          <div className="flex flex-col gap-2.5 sm:flex-row">
            <Button variant="secondary" icon={<Download size={15} />} onClick={handleExport}>
              Export data
            </Button>
            <Button variant="secondary" icon={<Upload size={15} />} onClick={handleImportClick}>
              Import data
            </Button>
            <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleImportFile} />
            <Button variant="danger" icon={<RotateCcw size={15} />} onClick={() => setResetOpen(true)}>
              Reset everything
            </Button>
          </div>
        </Card>

        <Card padded={false}>
          <h2 className="px-5 pt-5 text-[15px] font-semibold text-[var(--text)]">Legal</h2>
          <div className="mt-2 divide-y divide-[var(--border)]">
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.slug}
                to={`/settings/legal/${link.slug}`}
                className="flex items-center justify-between px-5 py-3.5 text-[14px] text-[var(--text)] hover:bg-[var(--surface-2)]/50"
              >
                {link.label}
                <ChevronRight size={16} className="text-[var(--text-faint)]" />
              </Link>
            ))}
          </div>
        </Card>
      </div>

      <ConfirmDialog
        open={resetOpen}
        title="Reset all data?"
        description="This permanently deletes everything stored in this app on this device. This can't be undone \u2014 consider exporting first."
        confirmLabel="Reset everything"
        danger
        onConfirm={() => {
          resetAll();
          setResetOpen(false);
          showToast("All data reset", "neutral");
        }}
        onCancel={() => setResetOpen(false)}
      />
    </div>
  );
}
