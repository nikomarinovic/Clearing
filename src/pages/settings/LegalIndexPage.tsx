import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { SettingsBackHeader } from "../../components/settings/SettingsBackHeader";
import { Card } from "../../components/ui/Card";

const LEGAL_LINKS = [
  { slug: "privacy", label: "Privacy Policy" },
  { slug: "terms", label: "Terms of Service" },
  { slug: "cookies", label: "Cookie Policy" },
  { slug: "notice", label: "Legal Notice" },
];

export default function LegalIndexPage() {
  return (
    <div className="mx-auto max-w-xl pb-6">
      <SettingsBackHeader title="Legal" />
      <Card padded={false}>
        <div className="divide-y divide-[var(--border)]">
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
  );
}
