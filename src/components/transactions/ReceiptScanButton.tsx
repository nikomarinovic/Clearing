import { useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { scanReceipt, type ScannedReceipt } from "../../lib/receiptScan";
import { useToast } from "../../hooks/useToast";

export function ReceiptScanButton({ onScanned }: { onScanned: (result: ScannedReceipt) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [scanning, setScanning] = useState(false);
  const { showToast } = useToast();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setScanning(true);
    try {
      const result = await scanReceipt(file);
      if (result.amount === null) {
        showToast("Couldn't read an amount \u2014 fill it in manually.", "warning");
      } else {
        showToast("Receipt scanned \u2014 check the details below.", "success");
      }
      onScanned(result);
    } catch {
      showToast(
        "Couldn't scan that receipt. If this is the first scan, it needs a connection once to fetch the reader.",
        "warning",
      );
    } finally {
      setScanning(false);
    }
  };

  return (
    <>
      <button
        type="button"
        disabled={scanning}
        onClick={() => inputRef.current?.click()}
        className="flex w-full items-center justify-center gap-2 rounded-[14px] border border-dashed border-[var(--border-strong)] bg-[var(--surface-2)]/50 px-4 py-3 text-[13.5px] font-medium text-[var(--text)] transition-colors hover:bg-[var(--surface-2)] disabled:opacity-60"
      >
        {scanning ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Reading receipt{"\u2026"}
          </>
        ) : (
          <>
            <Camera size={16} /> Scan a receipt
          </>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFile}
      />
      <p className="mt-1.5 text-center text-[11px] text-[var(--text-faint)]">
        Reads the photo on this device {"\u2014"} nothing is uploaded anywhere.
      </p>
    </>
  );
}
