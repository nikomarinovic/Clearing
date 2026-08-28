import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PenLine, Upload, Camera, Trash2, Check } from "lucide-react";
import { PageHeader } from "../components/common/PageHeader";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { VirtualCard } from "../components/dashboard/VirtualCard";
import { CARD_STYLES } from "../lib/cardStyles";
import { useAppData } from "../hooks/useAppData";
import { useToast } from "../hooks/useToast";

type SignatureTab = "draw" | "upload";

export default function CardEditorPage() {
  const navigate = useNavigate();
  const { data, updateSettings, updateProfile } = useAppData();
  const { showToast } = useToast();

  const [tab, setTab] = useState<SignatureTab>("draw");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const hasStroke = useRef(false);

  // --- drawing pad -----------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#14140f";
  }, [tab]);

  const getPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startStroke = (e: React.PointerEvent<HTMLCanvasElement>) => {
    drawing.current = true;
    hasStroke.current = true;
    const ctx = canvasRef.current?.getContext("2d");
    const { x, y } = getPos(e);
    ctx?.beginPath();
    ctx?.moveTo(x, y);
  };

  const continueStroke = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    const { x, y } = getPos(e);
    ctx?.lineTo(x, y);
    ctx?.stroke();
  };

  const endStroke = () => {
    drawing.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasStroke.current = false;
  };

  const saveDrawnSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasStroke.current) {
      showToast("Draw your signature first", "warning");
      return;
    }
    updateProfile({ cardSignatureUrl: canvas.toDataURL("image/png") });
    showToast("Signature saved", "success");
  };

  // --- upload / camera ---------------------------------------------------
  const processImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      showToast("Choose an image file", "warning");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        // Downscale to a wide, short strip that fits the card comfortably.
        const targetW = 600;
        const targetH = 220;
        const canvas = document.createElement("canvas");
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const scale = Math.min(targetW / img.width, targetH / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        ctx.drawImage(img, (targetW - w) / 2, (targetH - h) / 2, w, h);
        updateProfile({ cardSignatureUrl: canvas.toDataURL("image/png") });
        showToast("Signature saved", "success");
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeSignature = () => {
    updateProfile({ cardSignatureUrl: undefined });
    clearCanvas();
    showToast("Signature removed", "neutral");
  };

  return (
    <div className="pb-6">
      <PageHeader title="Edit your card" subtitle="Live preview — changes apply to your dashboard card as you go." />

      <div className="mb-5">
        <VirtualCard
          balance={data.currentBalance}
          name={data.profile.name && data.profile.name !== "there" ? data.profile.name : ""}
          currency={data.profile.currency}
          cardStyle={data.settings.cardStyle}
          signatureUrl={data.profile.cardSignatureUrl}
          memberSince={data.profile.createdAt}
        />
      </div>

      <Card className="mb-4">
        <h2 className="mb-3 text-[15px] font-semibold text-[var(--text)]">Color</h2>
        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-6">
          {CARD_STYLES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => updateSettings({ cardStyle: s.id })}
              aria-label={s.label}
              aria-pressed={data.settings.cardStyle === s.id}
              className={`flex flex-col items-center gap-1.5 rounded-[14px] p-1.5 transition-colors ${
                data.settings.cardStyle === s.id ? "ring-2 ring-[var(--accent-green)]" : "ring-1 ring-[var(--border)]"
              }`}
            >
              <span
                className="h-9 w-full rounded-[8px]"
                style={{ background: `linear-gradient(135deg, ${s.swatch[0]}, ${s.swatch[1]})` }}
              />
              <span className="text-[11px] font-medium text-[var(--text-muted)]">{s.label}</span>
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-[var(--text)]">Signature</h2>
          {data.profile.cardSignatureUrl && (
            <button
              type="button"
              onClick={removeSignature}
              className="flex items-center gap-1 text-[12.5px] font-medium text-[var(--text-faint)] hover:text-[var(--accent-red)]"
            >
              <Trash2 size={13} /> Remove
            </button>
          )}
        </div>

        <div className="mb-3 flex gap-2">
          <button
            type="button"
            onClick={() => setTab("draw")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-[10px] py-2 text-[13px] font-medium transition-colors ${
              tab === "draw" ? "bg-[var(--accent-green)]/12 text-[var(--accent-green)]" : "text-[var(--text-muted)] hover:bg-[var(--surface-2)]"
            }`}
          >
            <PenLine size={14} /> Draw
          </button>
          <button
            type="button"
            onClick={() => setTab("upload")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-[10px] py-2 text-[13px] font-medium transition-colors ${
              tab === "upload" ? "bg-[var(--accent-green)]/12 text-[var(--accent-green)]" : "text-[var(--text-muted)] hover:bg-[var(--surface-2)]"
            }`}
          >
            <Upload size={14} /> Upload or photo
          </button>
        </div>

        {tab === "draw" ? (
          <div>
            <canvas
              ref={canvasRef}
              onPointerDown={startStroke}
              onPointerMove={continueStroke}
              onPointerUp={endStroke}
              onPointerLeave={endStroke}
              className="h-48 w-full touch-none rounded-[14px] border border-dashed border-[var(--border-strong)] bg-[var(--surface-2)]/40 sm:h-56"
            />
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="secondary" onClick={clearCanvas}>
                Clear
              </Button>
              <Button size="sm" icon={<Check size={14} />} onClick={saveDrawnSignature}>
                Save signature
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              size="sm"
              variant="secondary"
              icon={<Upload size={14} />}
              onClick={() => fileInputRef.current?.click()}
              className="flex-1"
            >
              Choose a file
            </Button>
            <Button
              size="sm"
              variant="secondary"
              icon={<Camera size={14} />}
              onClick={() => cameraInputRef.current?.click()}
              className="flex-1"
            >
              Take a photo
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) processImageFile(file);
              }}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) processImageFile(file);
              }}
            />
          </div>
        )}
      </Card>

      <Button variant="secondary" className="mt-5 w-full sm:hidden" onClick={() => navigate("/settings")}>
        Done
      </Button>
    </div>
  );
}
