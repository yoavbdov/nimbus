import { useCallback, useMemo, useState } from "react";
import {
  checkRoomAvailability,
  isRoomSlotValid,
  type RoomAvailability,
  type RoomSlot,
} from "@/lib/room-availability";
import type { Room } from "@/lib/rooms-data";

const EMPTY_SLOT: RoomSlot = { date: "", startTime: "", endTime: "" };

/**
 * Owns all state for the "check availability" modal: which rooms are being
 * checked, the requested slot, and the (mock) result. The modal stays
 * presentational and receives everything from here.
 */
export function useRoomAvailabilityCheck(allRooms: Room[]) {
  const [open, setOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [slot, setSlot] = useState<RoomSlot>(EMPTY_SLOT);
  const [result, setResult] = useState<RoomAvailability[] | null>(null);

  // Presentational state for the modal's room picker and dialog portal target.
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerQuery, setPickerQuery] = useState("");
  const [container, setContainer] = useState<HTMLElement | null>(null);

  const selectedRooms = useMemo(
    () => allRooms.filter((r) => selectedIds.includes(r.id)),
    [allRooms, selectedIds],
  );

  const pickerMatches = useMemo(
    () => allRooms.filter((r) => r.name.includes(pickerQuery.trim())),
    [allRooms, pickerQuery],
  );

  const slotValid = isRoomSlotValid(slot);

  const openWith = useCallback((roomIds: string[]) => {
    setSelectedIds(roomIds);
    setSlot(EMPTY_SLOT);
    setResult(null);
    setPickerQuery("");
    setOpen(true);
  }, []);

  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next);
    if (!next) setResult(null);
  }, []);

  const toggleRoom = useCallback((id: string) => {
    setResult(null);
    setSelectedIds((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id],
    );
  }, []);

  const updateSlot = useCallback((patch: Partial<RoomSlot>) => {
    setResult(null);
    setSlot((prev) => ({ ...prev, ...patch }));
  }, []);

  const confirm = useCallback(() => {
    if (!slotValid) return;
    // No rooms chosen → tell the user which of all rooms are free.
    const targets = selectedRooms.length > 0 ? selectedRooms : allRooms;
    setResult(checkRoomAvailability(targets, slot));
  }, [slotValid, selectedRooms, allRooms, slot]);

  return {
    open,
    handleOpenChange,
    openWith,
    selectedIds,
    toggleRoom,
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
