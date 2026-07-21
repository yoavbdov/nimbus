import { useCallback, useState } from "react";
import type { ScheduleEvent } from "@/lib/schedule-data";
import type { ConflictPartner } from "@/lib/conflicts";

/**
 * Owns the "show conflicts" dialog: which occurrence it's showing and the list
 * of activities that occurrence clashes with. The event/partners are captured
 * up front so the dialog keeps them after the actions menu (and its active
 * event) has closed.
 */
export function useConflictsDialog() {
  const [open, setOpen] = useState(false);
  const [event, setEvent] = useState<ScheduleEvent | null>(null);
  const [partners, setPartners] = useState<ConflictPartner[]>([]);

  const openFor = useCallback(
    (nextEvent: ScheduleEvent, nextPartners: ConflictPartner[]) => {
      setEvent(nextEvent);
      setPartners(nextPartners);
      setOpen(true);
    },
    [],
  );

  return { open, event, partners, openFor, onOpenChange: setOpen };
}
