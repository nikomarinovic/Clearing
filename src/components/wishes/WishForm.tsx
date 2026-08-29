import { useEffect, useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { AmountInput, Field, Input } from "../ui/Field";
import type { WishItem } from "../../types";

export interface WishDraft {
  name: string;
  price: string;
  imageUrl?: string;
  notes: string;
}

const emptyDraft = (): WishDraft => ({ name: "", price: "", imageUrl: undefined, notes: "" });

export function WishForm({
  open,
  onClose,
  onSave,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (draft: WishDraft) => void;
  initial?: WishItem | null;
}) {
  const [draft, setDraft] = useState<WishDraft>(emptyDraft());
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initial) {
      setDraft({ name: initial.name, price: String(initial.price), imageUrl: initial.imageUrl, notes: initial.notes ?? "" });
    } else {
      setDraft(emptyDraft());
    }
  }, [initial, open]);

  const update = <K extends keyof WishDraft>(key: K, value: WishDraft[K]) => setDraft((d) => ({ ...d, [key]: value }));

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const size = 400;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const scale = Math.max(size / img.width, size / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
        update("imageUrl", canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!draft.name.trim() || !draft.price || parseFloat(draft.price) <= 0) return;
    onSave(draft);
  };

  return (
    <Modal open={open} onClose={onClose} title={initial ? "Edit wish" : "Add a wish"}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[14px] border border-dashed border-[var(--border-strong)] bg-[var(--surface-2)]/50 text-[var(--text-faint)]"
          >
            {draft.imageUrl ? (
              <img src={draft.imageUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <ImagePlus size={20} />
            )}
          </button>
          <div className="flex flex-col gap-1.5">
            <Button size="sm" variant="secondary" onClick={() => fileInputRef.current?.click()}>
              {draft.imageUrl ? "Change photo" : "Add a photo"}
            </Button>
            {draft.imageUrl && (
              <button
                type="button"
                onClick={() => update("imageUrl", undefined)}
                className="flex items-center gap-1 text-xs text-[var(--text-faint)] hover:text-[var(--accent-red)]"
              >
                <X size={12} /> Remove photo
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) handleFile(file);
            }}
          />
        </div>

        <Field label="What is it?">
          <Input value={draft.name} onChange={(e) => update("name", e.target.value)} placeholder="Noise-cancelling headphones" />
        </Field>
        <Field label="Price">
          <AmountInput value={draft.price} onChange={(v) => update("price", v)} placeholder="0.00" />
        </Field>
        <Field label="Notes (optional)">
          <Input value={draft.notes} onChange={(e) => update("notes", e.target.value)} placeholder="Where to get it, color, etc." />
        </Field>
      </div>
      <div className="mt-6 flex gap-2">
        <Button variant="secondary" fullWidth onClick={onClose}>
          Cancel
        </Button>
        <Button fullWidth onClick={handleSave}>
          Save
        </Button>
      </div>
    </Modal>
  );
}
