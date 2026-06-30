import { useCallback, useMemo, useState } from "react";
import {
  EMPTY_EVENT_FORM,
  isEventFormValid,
  makeEquipmentLine,
  type EquipmentLineValues,
  type EventFormValues,
} from "@/lib/event-form";
import { players, type Player } from "@/lib/players-data";
import { exampleRosters } from "@/lib/rosters-data";

/**
 * Owns all state for the "add event" modal: the scalar fields, the chosen
 * frequency mode, the enrolled players and the equipment lines. The modal stays
 * presentational and receives everything from here.
 */
/** The modal's tabs, in order; the first is the default shown on open. */
export type EventTab = "details" | "frequency" | "players" | "equipment";

/**
 * "add" shows the empty add flow; "edit" prefills an existing event; "view"
 * prefills it read-only (used by the cleanup archive, where events may only be
 * inspected, not changed).
 */
export type EventModalMode = "add" | "edit" | "view";

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

  // The "add players" flow first asks the source (a saved roster, or the whole
  // club) before opening the picker.
  const [sourceChoiceOpen, setSourceChoiceOpen] = useState(false);
  const [rosterChoiceOpen, setRosterChoiceOpen] = useState(false);
  // The exact rows the picker shows: the whole club for the "all" branch, or a
  // roster's full member list for the roster branch. Members already enrolled
  // are listed in `pickerDisabledIds` so the picker greys them out.
  const [pickerPlayers, setPickerPlayers] = useState<Player[]>([]);
  const [pickerDisabledIds, setPickerDisabledIds] = useState<string[]>([]);

  const playerRosters = useMemo(
    () =>
      exampleRosters.map((r) => ({
        id: r.id,
        name: r.name,
        count: r.players.length,
      })),
    [],
  );

  // Opens the source question; the picker opens only after a branch is chosen.
  const openPlayerPicker = useCallback(() => {
    setSourceChoiceOpen(true);
  }, []);

  const choosePlayersFromAll = useCallback(() => {
    setPickerPlayers(players.filter((p) => !values.playerIds.includes(p.id)));
    setPickerDisabledIds([]);
    setSourceChoiceOpen(false);
    setCheckedPlayerIds([]);
    setPlayerPickerOpen(true);
  }, [values.playerIds]);

  const choosePlayersFromRoster = useCallback(() => {
    setSourceChoiceOpen(false);
    setRosterChoiceOpen(true);
  }, []);

  const backToSourceChoice = useCallback(() => {
    setRosterChoiceOpen(false);
    setSourceChoiceOpen(true);
  }, []);

  // Picking a roster pre-checks its members (matched by name) among the players
  // not yet enrolled, then opens the picker for review and confirmation.
  const selectPlayerRoster = useCallback(
    (rosterId: string) => {
      const roster = exampleRosters.find((r) => r.id === rosterId);
      const names = new Set(roster?.players.map((p) => p.name) ?? []);
      const members = players.filter((p) => names.has(p.name));
      setPickerPlayers(members);
      // Already-enrolled members stay visible but greyed out; only the new ones
      // are pre-checked.
      setPickerDisabledIds(
        members.filter((p) => values.playerIds.includes(p.id)).map((p) => p.id),
      );
      setCheckedPlayerIds(
        members.filter((p) => !values.playerIds.includes(p.id)).map((p) => p.id),
      );
      setRosterChoiceOpen(false);
      setPlayerPickerOpen(true);
    },
    [values.playerIds],
  );

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

  // Opens the modal read-only, prefilled with an existing event.
  const openForView = useCallback((next: EventFormValues) => {
    setMode("view");
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
    openForView,
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
    sourceChoiceOpen,
    setSourceChoiceOpen,
    rosterChoiceOpen,
    setRosterChoiceOpen,
    pickerPlayers,
    pickerDisabledIds,
    playerRosters,
    choosePlayersFromAll,
    choosePlayersFromRoster,
    backToSourceChoice,
    selectPlayerRoster,
    checkedPlayerIds,
    toggleCheckedPlayer,
    confirmPlayers,
    addEquipmentLine,
    updateEquipmentLine,
    removeEquipmentLine,
  };
}
