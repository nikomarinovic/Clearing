import { useEffect, useState } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Field, Input, Textarea } from "../ui/Field";
import { todayIso } from "../../lib/format";
import type { Trip } from "../../types";

export interface TripDraft {
  name: string;
  startDate: string;
  endDate: string;
  notes: string;
}

const emptyDraft = (): TripDraft => ({ name: "", startDate: todayIso(), endDate: todayIso(), notes: "" });

export function TripForm({
  open,
  onClose,
  onSave,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (draft: TripDraft) => void;
  initial?: Trip | null;
}) {
  const [draft, setDraft] = useState<TripDraft>(emptyDraft());

  useEffect(() => {
    if (initial) {
      setDraft({ name: initial.name, startDate: initial.startDate, endDate: initial.endDate, notes: initial.notes ?? "" });
    } else {
      setDraft(emptyDraft());
    }
  }, [initial, open]);

  const update = <K extends keyof TripDraft>(key: K, value: TripDraft[K]) => setDraft((d) => ({ ...d, [key]: value }));

  const handleSave = () => {
    if (!draft.name.trim()) return;
    onSave(draft);
  };

  return (
    <Modal open={open} onClose={onClose} title={initial ? "Edit trip" : "New trip"}>
      <div className="flex flex-col gap-4">
        <Field label="Destination">
          <Input value={draft.name} onChange={(e) => update("name", e.target.value)} placeholder="Budapest" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Start date">
            <Input type="date" value={draft.startDate} onChange={(e) => update("startDate", e.target.value)} />
          </Field>
          <Field label="End date">
            <Input type="date" value={draft.endDate} min={draft.startDate} onChange={(e) => update("endDate", e.target.value)} />
          </Field>
        </div>
        <Field label="Notes (optional)">
          <Textarea value={draft.notes} onChange={(e) => update("notes", e.target.value)} placeholder="Flights booked, hostel TBD..." />
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
