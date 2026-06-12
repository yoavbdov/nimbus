import { useCallback, useMemo, useState } from "react";
import {
  checkEquipmentAvailability,
  isEquipmentSlotValid,
  type EquipmentAvailability,
  type EquipmentSlot,
} from "@/lib/equipment-availability";
import { equipmentUsage, type EquipmentUsage } from "@/lib/equipment-usage";
import type { Equipment } from "@/lib/rooms-data";

const EMPTY_SLOT: EquipmentSlot = { date: "", startTime: "", endTime: "" };

/**
 * Owns all state for the equipment "check availability" modal: which items are
 * being checked, the requested slot, and the (mock) result. The modal stays
 * presentational and receives everything from here.
 */
export function useEquipmentAvailabilityCheck(allEquipment: Equipment[]) {
  const [open, setOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [slot, setSlot] = useState<EquipmentSlot>(EMPTY_SLOT);
  const [result, setResult] = useState<EquipmentAvailability[] | null>(null);

  // Presentational state for the modal's equipment picker and dialog portal target.
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerQuery, setPickerQuery] = useState("");
  const [container, setContainer] = useState<HTMLElement | null>(null);

  // The secondary "who uses this equipment in the slot" modal, opened from a row.
  const [usage, setUsage] = useState<{
    name: string;
    slot: EquipmentSlot;
    items: EquipmentUsage[];
  } | null>(null);

  const selectedEquipment = useMemo(
    () => allEquipment.filter((e) => selectedIds.includes(e.id)),
    [allEquipment, selectedIds],
  );

  const pickerMatches = useMemo(
    () => allEquipment.filter((e) => e.name.includes(pickerQuery.trim())),
    [allEquipment, pickerQuery],
  );

  const slotValid = isEquipmentSlotValid(slot);

  const openWith = useCallback((equipmentIds: string[]) => {
    setSelectedIds(equipmentIds);
    setSlot(EMPTY_SLOT);
    setResult(null);
    setPickerQuery("");
    setOpen(true);
  }, []);

  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next);
    if (!next) setResult(null);
  }, []);

  const toggleEquipment = useCallback((id: string) => {
    setResult(null);
    setSelectedIds((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id],
    );
  }, []);

  const updateSlot = useCallback((patch: Partial<EquipmentSlot>) => {
    setResult(null);
    setSlot((prev) => ({ ...prev, ...patch }));
  }, []);

  // Opens the usage modal for one item and closes the availability modal behind
  // it, so a redundant dialog isn't left stacked underneath.
  const showUsage = useCallback(
    (id: string, name: string, usedUnits: number) => {
      setUsage({ name, slot, items: equipmentUsage(id, slot, usedUnits) });
      setOpen(false);
    },
    [slot],
  );

  const handleUsageOpenChange = useCallback((next: boolean) => {
    if (!next) setUsage(null);
  }, []);

  const confirm = useCallback(() => {
    if (!slotValid) return;
    // No items chosen → check the whole inventory.
    const targets =
      selectedEquipment.length > 0 ? selectedEquipment : allEquipment;
    setResult(checkEquipmentAvailability(targets, slot));
  }, [slotValid, selectedEquipment, allEquipment, slot]);

  return {
    open,
    handleOpenChange,
    openWith,
    selectedIds,
    toggleEquipment,
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
    usage,
    showUsage,
    handleUsageOpenChange,
  };
}
