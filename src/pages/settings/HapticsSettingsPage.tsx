import { Zap } from "lucide-react";
import { SettingsBackHeader } from "../../components/settings/SettingsBackHeader";
import { Card } from "../../components/ui/Card";
import { Toggle } from "../../components/ui/Toggle";
import { useAppData } from "../../hooks/useAppData";
import { useToast } from "../../hooks/useToast";
import { haptic } from "../../lib/haptics";

export default function HapticsSettingsPage() {
  const { data, updateSettings } = useAppData();
  const { showToast } = useToast();

  return (
    <div className="mx-auto max-w-xl pb-6">
      <SettingsBackHeader title="Haptic feedback" subtitle="Subtle vibration when you add a transaction." />
      <Card>
        <div className="flex items-center justify-between gap-3">
          <p className="min-w-0 flex-1 text-[13px] text-[var(--text-muted)]">Enable haptic feedback</p>
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
              showToast("Buzzed — felt it? Haptics work on this device.", "success");
            }}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-[12px] border border-dashed border-[var(--border-strong)] py-2.5 text-[13px] font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-2)]/60"
          >
            <Zap size={14} /> Test vibration
          </button>
        ) : (
          <p className="mt-3 text-xs text-[var(--text-faint)]">
            This browser doesn't support vibration (iPhones don't, on any browser — that's an iOS/Safari limit, not
            this app).
          </p>
        )}
      </Card>
    </div>
  );
}
