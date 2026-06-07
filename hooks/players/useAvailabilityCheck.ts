import { useCallback, useMemo, useState } from "react";
import {
  checkAvailability,
  isSlotValid,
  type AvailabilitySlot,
  type PlayerAvailability,
} from "@/lib/availability";
import type { Player } from "@/lib/players-data";

const EMPTY_SLOT: AvailabilitySlot = { date: "", startTime: "", endTime: "" };

/**
 * Owns all state for the "check availability" modal: which players are being
 * checked, the requested slot, and the (mock) result. The modal stays
 * presentational and receives everything from here.
 */
export function useAvailabilityCheck(allPlayers: Player[]) {
  const [open, setOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [slot, setSlot] = useState<AvailabilitySlot>(EMPTY_SLOT);
  const [result, setResult] = useState<PlayerAvailability[] | null>(null);

  const selectedPlayers = useMemo(
    () => allPlayers.filter((p) => selectedIds.includes(p.id)),
    [allPlayers, selectedIds],
  );

  const slotValid = isSlotValid(slot);

  const openWith = useCallback((playerIds: string[]) => {
    setSelectedIds(playerIds);
    setSlot(EMPTY_SLOT);
    setResult(null);
    setOpen(true);
  }, []);

  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next);
    if (!next) setResult(null);
  }, []);

  const togglePlayer = useCallback((id: string) => {
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
    // No players chosen → tell the coach which of all players are free.
    const targets = selectedPlayers.length > 0 ? selectedPlayers : allPlayers;
    setResult(checkAvailability(targets, slot));
  }, [slotValid, selectedPlayers, allPlayers, slot]);

  return {
    open,
    handleOpenChange,
    openWith,
    selectedIds,
    togglePlayer,
    slot,
    updateSlot,
    slotValid,
    result,
    confirm,
    checkingAll: selectedIds.length === 0,
  };
}
