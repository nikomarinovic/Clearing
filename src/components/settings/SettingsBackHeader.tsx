import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export function SettingsBackHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const navigate = useNavigate();
  return (
    <div className="mb-6">
      <button
        onClick={() => navigate("/settings")}
        className="mb-3 flex items-center gap-1.5 text-[13.5px] font-medium text-[var(--text-muted)] hover:text-[var(--text)]"
      >
        <ArrowLeft size={15} /> Settings
      </button>
      <h1 className="text-[22px] font-bold leading-tight tracking-tight text-[var(--text)]">{title}</h1>
      {subtitle && <p className="mt-1.5 text-[14px] leading-6 text-[var(--text-muted)]">{subtitle}</p>}
    </div>
  );
}
