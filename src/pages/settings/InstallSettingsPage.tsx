import { Smartphone, Download, Share, PlusSquare, CheckCircle2 } from "lucide-react";
import { SettingsBackHeader } from "../../components/settings/SettingsBackHeader";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { useToast } from "../../hooks/useToast";
import { useInstallPrompt } from "../../hooks/useInstallPrompt";

export default function InstallSettingsPage() {
  const { showToast } = useToast();
  const { installed, canPrompt, isIos, promptInstall } = useInstallPrompt();

  const handleInstall = async () => {
    const outcome = await promptInstall();
    if (outcome === "accepted") showToast("App installed", "success");
    else if (outcome === "dismissed") showToast("Installation dismissed", "neutral");
  };

  return (
    <div className="mx-auto max-w-xl pb-6">
      <SettingsBackHeader title="Install app" subtitle="A faster, full-screen, app-like experience." />

      {installed ? (
        <Card className="flex items-center gap-2.5 text-[13.5px] text-[var(--text-muted)]">
          <CheckCircle2 size={16} className="text-[var(--accent-green)]" /> Installed as an app on this device.
        </Card>
      ) : (
        <Card>
          <h2 className="mb-1 flex items-center gap-2 text-[15px] font-semibold text-[var(--text)]">
            <Smartphone size={16} /> Add to Home Screen
          </h2>
          <p className="mb-4 text-[13px] text-[var(--text-muted)]">
            Your data stays exactly where it is — stored locally on this device.
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
    </div>
  );
}
