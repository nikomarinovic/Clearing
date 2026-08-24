import { Link } from "react-router-dom";
import { Plane, ChevronRight } from "lucide-react";
import type { Trip } from "../../types";
import { formatCurrency, formatDateRange } from "../../lib/format";
import { Card } from "../ui/Card";

export function TripCard({ trip, total }: { trip: Trip; total: number }) {
  return (
    <Link to={`/trips/${trip.id}`}>
      <Card interactive className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--accent-blue-bg)] text-[var(--accent-blue)]">
          <Plane size={17} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14.5px] font-medium text-[var(--text)]">{trip.name}</p>
          <p className="text-xs text-[var(--text-faint)]">{formatDateRange(trip.startDate, trip.endDate)}</p>
        </div>
        <span className="num shrink-0 text-[14px] font-medium text-[var(--text)]">{formatCurrency(total)}</span>
        <ChevronRight size={16} className="shrink-0 text-[var(--text-faint)]" />
      </Card>
    </Link>
  );
}
