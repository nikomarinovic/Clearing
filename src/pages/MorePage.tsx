import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { PageHeader } from "../components/common/PageHeader";
import { Card } from "../components/ui/Card";
import { MORE_NAV } from "../lib/navigation";

export default function MorePage() {
  return (
    <div className="pb-6 lg:hidden">
      <PageHeader title="More" />
      <Card padded={false}>
        <div className="divide-y divide-[var(--border)]">
          {MORE_NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-3 px-5 py-4 text-[14.5px] font-medium text-[var(--text)] hover:bg-[var(--surface-2)]/50"
            >
              <item.icon size={18} />
              <span className="flex-1">{item.label}</span>
              <ChevronRight size={16} className="text-[var(--text-faint)]" />
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
