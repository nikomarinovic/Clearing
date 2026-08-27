import { useState } from "react";
import { Plane, Plus } from "lucide-react";
import { PageHeader } from "../components/common/PageHeader";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { TripCard } from "../components/trips/TripCard";
import { TripForm, type TripDraft } from "../components/trips/TripForm";
import { useAppData } from "../hooks/useAppData";
import { useToast } from "../hooks/useToast";
import { tripTotal } from "../lib/calculations";

export default function TripsPage() {
  const { data, addTrip } = useAppData();
  const { showToast } = useToast();
  const [formOpen, setFormOpen] = useState(false);

  const save = (draft: TripDraft) => {
    addTrip({ name: draft.name.trim(), startDate: draft.startDate, endDate: draft.endDate, notes: draft.notes.trim() || undefined });
    showToast("Trip created", "success");
    setFormOpen(false);
  };

  const sortedTrips = [...data.trips].sort((a, b) => (a.startDate < b.startDate ? -1 : 1));

  return (
    <div className="pb-6">
      <PageHeader
        title="Trips"
        subtitle="Plan travel and see the real cost, automatically included in your projections."
        action={
          <Button size="sm" icon={<Plus size={14} />} onClick={() => setFormOpen(true)}>
            New trip
          </Button>
        }
      />

      {sortedTrips.length === 0 ? (
        <EmptyState
          icon={<Plane size={20} />}
          title="Planning a trip?"
          description="Create a trip and we'll calculate the real cost for you."
          action={<Button onClick={() => setFormOpen(true)}>Create a trip</Button>}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {sortedTrips.map((trip) => (
            <TripCard key={trip.id} trip={trip} total={tripTotal(data.expenses, trip.id)} />
          ))}
        </div>
      )}

      <TripForm open={formOpen} onClose={() => setFormOpen(false)} onSave={save} />
    </div>
  );
}
