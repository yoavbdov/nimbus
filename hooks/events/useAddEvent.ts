import { useCallback, useMemo, useState } from "react";
import {
  EMPTY_EVENT_FORM,
  isEventFormValid,
  makeEquipmentLine,
  type EquipmentLineValues,
  type EventFormValues,
} from "@/lib/event-form";
import { players } from "@/lib/players-data";

/**
 * Owns all state for the "add event" modal: the scalar fields, the chosen
 * frequency mode, the enrolled players and the equipment lines. The modal stays
 * presentational and receives everything from here.
 */
/** The modal's tabs, in order; the first is the default shown on open. */
export type EventTab = "details" | "frequency" | "players" | "equipment";

/** "add" shows the empty add flow; "edit" prefills an existing event. */
export type EventModalMode = "add" | "edit";

export function useAddEvent() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<EventModalMode>("add");
  const [tab, setTab] = useState<EventTab>("details");
  const [values, setValues] = useState<EventFormValues>(EMPTY_EVENT_FORM);

  const valid = isEventFormValid(values);

  const updateField = useCallback(
    <K extends keyof EventFormValues>(field: K, value: EventFormValues[K]) => {
      setValues((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const setFormat = useCallback((format: EventFormValues["format"]) => {
    setValues((prev) => ({ ...prev, format }));
  }, []);

  // ---- Players ------------------------------------------------------------
  const removePlayer = useCallback((id: string) => {
    setValues((prev) => ({
      ...prev,
      playerIds: prev.playerIds.filter((p) => p !== id),
    }));
  }, []);

  // The "add players" picker: a checkbox table whose checked rows are committed
  // to the form in bulk on confirm.
  const [playerPickerOpen, setPlayerPickerOpen] = useState(false);
  const [checkedPlayerIds, setCheckedPlayerIds] = useState<string[]>([]);

  const openPlayerPicker = useCallback(() => {
    setCheckedPlayerIds([]);
    setPlayerPickerOpen(true);
  }, []);

  const toggleCheckedPlayer = useCallback((id: string) => {
    setCheckedPlayerIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  }, []);

  const confirmPlayers = useCallback(() => {
    setValues((prev) => ({
      ...prev,
      playerIds: [...new Set([...prev.playerIds, ...checkedPlayerIds])],
    }));
    setPlayerPickerOpen(false);
  }, [checkedPlayerIds]);

  const enrolledPlayers = useMemo(
    () => players.filter((p) => values.playerIds.includes(p.id)),
    [values.playerIds],
  );

  const availablePlayers = useMemo(
    () => players.filter((p) => !values.playerIds.includes(p.id)),
    [values.playerIds],
  );

  // ---- Equipment ----------------------------------------------------------
  const addEquipmentLine = useCallback(() => {
    setValues((prev) => ({
      ...prev,
      equipment: [...prev.equipment, makeEquipmentLine()],
    }));
  }, []);

  const updateEquipmentLine = useCallback(
    (id: string, patch: Partial<EquipmentLineValues>) => {
      setValues((prev) => ({
        ...prev,
        equipment: prev.equipment.map((e) =>
          e.id === id ? { ...e, ...patch } : e,
        ),
      }));
    },
    [],
  );

  const removeEquipmentLine = useCallback((id: string) => {
    setValues((prev) => ({
      ...prev,
      equipment: prev.equipment.filter((e) => e.id !== id),
    }));
  }, []);

  const openModal = useCallback(() => {
    setMode("add");
    setValues(EMPTY_EVENT_FORM);
    setTab("details");
    setOpen(true);
  }, []);

  // Opens the modal in edit mode prefilled with an existing event.
  const openForEdit = useCallback((next: EventFormValues) => {
    setMode("edit");
    setValues(next);
    setTab("details");
    setOpen(true);
  }, []);

  const handleOpenChange = useCallback((next: boolean) => setOpen(next), []);

  const confirm = useCallback(() => {
    if (!valid) return;
    // UI only for now — submitting is wired up elsewhere later.
    setOpen(false);
  }, [valid]);

  return {
    open,
    mode,
    tab,
    setTab,
    openModal,
    openForEdit,
    handleOpenChange,
    values,
    updateField,
    valid,
    confirm,
    setFormat,
    enrolledPlayers,
    availablePlayers,
    removePlayer,
    playerPickerOpen,
    setPlayerPickerOpen,
    openPlayerPicker,
    checkedPlayerIds,
    toggleCheckedPlayer,
    confirmPlayers,
    addEquipmentLine,
    updateEquipmentLine,
    removeEquipmentLine,
  };
}
