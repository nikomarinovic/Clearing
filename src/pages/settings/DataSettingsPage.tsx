import { useRef, useState } from "react";
import { Shield, Download, Upload, RotateCcw } from "lucide-react";
import { SettingsBackHeader } from "../../components/settings/SettingsBackHeader";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { useAppData } from "../../hooks/useAppData";
import { useToast } from "../../hooks/useToast";

export default function DataSettingsPage() {
  const { exportJson, importJson, resetAll } = useAppData();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [resetTypedText, setResetTypedText] = useState("");

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
    <div className="mx-auto max-w-xl pb-6">
      <SettingsBackHeader title="Data & privacy" subtitle="Export, import, or reset what's stored on this device." />
      <Card>
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

      <ConfirmDialog
        open={resetOpen}
        title="Reset all data?"
        description="This permanently deletes everything stored in this app on this device. This can't be undone — consider exporting first."
        confirmLabel="Continue"
        danger
        onConfirm={() => {
          setResetOpen(false);
          setResetTypedText("");
          setResetConfirmOpen(true);
        }}
        onCancel={() => setResetOpen(false)}
      />

      {/* Second, stronger confirmation — requires typing the phrase, not just a tap, before anything is deleted. */}
      <ConfirmDialog
        open={resetConfirmOpen}
        title="Type to confirm — this is permanent"
        description={
          <span>
            There's no undo. Type <span className="num font-semibold text-[var(--text)]">RESET ALL DATA</span> below
            to permanently erase everything on this device.
          </span>
        }
        confirmLabel="Reset everything"
        danger
        confirmDisabled={resetTypedText.trim().toUpperCase() !== "RESET ALL DATA"}
        onConfirm={() => {
          resetAll();
          setResetConfirmOpen(false);
          setResetTypedText("");
          showToast("All data reset", "neutral");
        }}
        onCancel={() => {
          setResetConfirmOpen(false);
          setResetTypedText("");
        }}
      >
        <input
          value={resetTypedText}
          onChange={(e) => setResetTypedText(e.target.value)}
          placeholder="RESET ALL DATA"
          autoFocus
          className="num mt-1 w-full rounded-[12px] border border-[var(--border-strong)] bg-[var(--surface-2)]/40 px-3.5 py-2.5 text-[14px] tracking-wide text-[var(--text)] outline-none focus:border-[var(--accent-red)]"
        />
      </ConfirmDialog>
    </div>
  );
}
