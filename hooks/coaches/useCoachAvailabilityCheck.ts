import { useCallback, useMemo, useState } from "react";
import {
  checkCoachAvailability,
  isSlotValid,
  type AvailabilitySlot,
  type CoachAvailability,
} from "@/lib/coach-availability";
import type { Coach } from "@/lib/coaches-data";

const EMPTY_SLOT: AvailabilitySlot = { date: "", startTime: "", endTime: "" };

/**
 * Owns all state for the "check availability" modal: which coaches are being
 * checked, the requested slot, and the (mock) result. The modal stays
 * presentational and receives everything from here.
 */
export function useCoachAvailabilityCheck(allCoaches: Coach[]) {
  const [open, setOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [slot, setSlot] = useState<AvailabilitySlot>(EMPTY_SLOT);
  const [result, setResult] = useState<CoachAvailability[] | null>(null);

  // Presentational state for the modal's coach picker and dialog portal target.
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerQuery, setPickerQuery] = useState("");
  const [container, setContainer] = useState<HTMLElement | null>(null);

  const selectedCoaches = useMemo(
    () => allCoaches.filter((c) => selectedIds.includes(c.id)),
    [allCoaches, selectedIds],
  );

  const pickerMatches = useMemo(
    () => allCoaches.filter((c) => c.name.includes(pickerQuery.trim())),
    [allCoaches, pickerQuery],
  );

  const slotValid = isSlotValid(slot);

  const openWith = useCallback((coachIds: string[]) => {
    setSelectedIds(coachIds);
    setSlot(EMPTY_SLOT);
    setResult(null);
    setPickerQuery("");
    setOpen(true);
  }, []);

  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next);
    if (!next) setResult(null);
  }, []);

  const toggleCoach = useCallback((id: string) => {
    setResult(null);
    setSelectedIds((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id],
    );
  }, []);

  const updateSlot = useCallback((patch: Partial<AvailabilitySlot>) => {
    setResult(null);
    setSlot((prev) => ({ ...prev, ...patch }));
  }, []);

  const confirm = useCallback(() => {
    if (!slotValid) return;
    // No coaches chosen → tell which of all coaches are free.
    const targets = selectedCoaches.length > 0 ? selectedCoaches : allCoaches;
    setResult(checkCoachAvailability(targets, slot));
  }, [slotValid, selectedCoaches, allCoaches, slot]);

  return {
    open,
    handleOpenChange,
    openWith,
    selectedIds,
    toggleCoach,
    slot,
    updateSlot,
    slotValid,
    result,
    confirm,
    checkingAll: selectedIds.length === 0,
    pickerOpen,
    setPickerOpen,
    pickerQuery,
    setPickerQuery,
    pickerMatches,
    container,
    setContainer,
  };
}
