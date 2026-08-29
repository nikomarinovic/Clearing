import { useRef } from "react";
import { SettingsBackHeader } from "../../components/settings/SettingsBackHeader";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Field, Input, Select } from "../../components/ui/Field";
import { useAppData } from "../../hooks/useAppData";
import { useToast } from "../../hooks/useToast";
import type { UserType } from "../../types";

export default function ProfileSettingsPage() {
  const { data, updateProfile } = useAppData();
  const { showToast } = useToast();
  const avatarInputRef = useRef<HTMLInputElement>(null);

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

  return (
    <div className="mx-auto max-w-xl pb-6">
      <SettingsBackHeader title="Profile" subtitle="Your name, type, currency, and photo." />
      <Card>
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
          <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarFile} />
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
    </div>
  );
}
