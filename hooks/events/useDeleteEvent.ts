import { useCallback, useMemo, useState } from "react";
import { deleteEventCascade } from "@/lib/firebase/data/events";

/** An event the modal can delete: its Firestore id plus its display name. */
export interface DeletableEvent {
  id: string;
  name: string;
}

/**
 * Owns the state for the "delete event(s)" confirmation modal. Deleting is
 * permanent and also drops the event's sessions and every relation pointing at
 * it, so the user must type a confirmation phrase first:
 *   - one event  → the event's name.
 *   - many events → "אני מעוניין למחוק N אירועים".
 */
export function useDeleteEvent() {
  const [open, setOpen] = useState(false);
  const [targets, setTargets] = useState<DeletableEvent[]>([]);
  const [confirmText, setConfirmText] = useState("");

  const names = useMemo(() => targets.map((t) => t.name), [targets]);

  const expectedPhrase =
    targets.length > 1
      ? `אני מעוניין למחוק ${targets.length} אירועים`
      : (names[0] ?? "");

  const valid = targets.length > 0 && confirmText.trim() === expectedPhrase;

  const openFor = useCallback((events: DeletableEvent[]) => {
    setTargets(events);
    setConfirmText("");
    setOpen(true);
  }, []);

  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next);
  }, []);

  const confirm = useCallback(() => {
    if (!valid) return;
    for (const target of targets) void deleteEventCascade(target.id);
    setOpen(false);
  }, [valid, targets]);

  return {
    open,
    names,
    confirmText,
    setConfirmText,
    expectedPhrase,
    valid,
    openFor,
    handleOpenChange,
    confirm,
  };
}
