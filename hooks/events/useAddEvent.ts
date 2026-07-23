import { useCallback, useMemo, useState } from "react";
import {
  EMPTY_EVENT_FORM,
  isEventFormValid,
  makeEquipmentLine,
  type EquipmentLineValues,
  type EventFormValues,
} from "@/lib/event-form";
import { type Player } from "@/lib/players-data";
import { type Equipment } from "@/lib/rooms-data";
import { useSavedRosters } from "@/hooks/rosters/useSavedRosters";
import { useCollection } from "@/lib/firebase/useCollection";
import { addEvent, updateEvent } from "@/lib/firebase/data/events";
import { replaceParentSessions } from "@/lib/firebase/data/sessions";
import { replaceTargetRelations } from "@/lib/firebase/data/relations";
import {
  eventRecordFromForm,
  eventEditPatch,
  eventSessionsFromForm,
} from "@/lib/event-details";
import { useDraftConflicts } from "@/hooks/schedule/useDraftConflicts";
import { usePlayerConflicts } from "@/hooks/schedule/usePlayerConflicts";

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
  // Snapshot of the form as it was on open (JSON), to detect unsaved edits.
  const [baseline, setBaseline] = useState<string>(() =>
    JSON.stringify(EMPTY_EVENT_FORM),
  );
  // Whether a close attempt is awaiting the "discard unsaved edits" confirm, and
  // a counter bumped on each repeated attempt to replay the warning's shake.
  const [confirmingClose, setConfirmingClose] = useState(false);
  const [closeNudge, setCloseNudge] = useState(0);

  // The club roster, read live — the players picker works off real players
  // (docs keyed by name), not the legacy mock.
  const { data: players } = useCollection<Player>("players");

  // The equipment picker is fed by the live equipment roster (Firestore) only —
  // an empty collection means an empty picker, never mock rows.
  const { data: equipmentItems } = useCollection<Equipment>("equipment");

  const valid = isEventFormValid(values);
  // Read-only (view) never counts as dirty; otherwise compare against the open snapshot.
  const dirty = mode !== "view" && JSON.stringify(values) !== baseline;

  const updateField = useCallback(
    <K extends keyof EventFormValues>(field: K, value: EventFormValues[K]) => {
      setValues((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const setFormat = useCallback((format: EventFormValues["format"]) => {
    setValues((prev) => ({ ...prev, format }));
  }, []);

  // ---- The draft's own schedule -------------------------------------------
  // This event's slot as sessions — the input to both conflict checks below.
  // Declared before the players section because the picker needs the player
  // clashes to know which rows to block.
  const draftSessions = useMemo(
    () => eventSessionsFromForm(values.id || "__draft__", values),
    [values],
  );

  // BLOCKING: players already booked in another activity while this event runs.
  // Recomputed on every time edit, so moving the event frees them.
  const { check: checkPlayerConflicts } = usePlayerConflicts();
  const busyPlayerReasons = useMemo(
    () => checkPlayerConflicts(draftSessions),
    [checkPlayerConflicts, draftSessions],
  );

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

  // The saved player lists, read live from Firestore — the same lists the
  // rosters tool manages, so a list edited there is offered here immediately.
  const { rosters: savedRosters } = useSavedRosters();

  const playerRosters = useMemo(
    () =>
      savedRosters.map((r) => ({
        id: r.id,
        name: r.name,
        count: r.players.length,
      })),
    [savedRosters],
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
  }, [players, values.playerIds]);

  const choosePlayersFromRoster = useCallback(() => {
    setSourceChoiceOpen(false);
    setRosterChoiceOpen(true);
  }, []);

  const backToSourceChoice = useCallback(() => {
    setRosterChoiceOpen(false);
    setSourceChoiceOpen(true);
  }, []);

  // Picking a roster pre-checks its members among the players not yet enrolled, then opens the picker for review and confirmation.
  const selectPlayerRoster = useCallback(
    (rosterId: string) => {
      const roster = savedRosters.find((r) => r.id === rosterId);
      const ids = new Set(roster?.players.map((p) => p.id) ?? []);
      const members = players.filter((p) => ids.has(p.id));
      setPickerPlayers(members);
      // Already-enrolled members stay visible but greyed out; only the new ones
      // are pre-checked.
      setPickerDisabledIds(
        members.filter((p) => values.playerIds.includes(p.id)).map((p) => p.id),
      );
      // Busy members are blocked in the picker, so they are never pre-checked.
      setCheckedPlayerIds(
        members
          .filter(
            (p) => !values.playerIds.includes(p.id) && !busyPlayerReasons[p.id],
          )
          .map((p) => p.id),
      );
      setRosterChoiceOpen(false);
      setPlayerPickerOpen(true);
    },
    [players, savedRosters, values.playerIds, busyPlayerReasons],
  );

  const toggleCheckedPlayer = useCallback((id: string) => {
    setCheckedPlayerIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  }, []);

  // A busy player can never be committed, even if the times moved while the
  // picker was open — the block is enforced here, not just in the UI.
  const confirmPlayers = useCallback(() => {
    const allowed = checkedPlayerIds.filter((id) => !busyPlayerReasons[id]);
    setValues((prev) => ({
      ...prev,
      playerIds: [...new Set([...prev.playerIds, ...allowed])],
    }));
    setPlayerPickerOpen(false);
  }, [checkedPlayerIds, busyPlayerReasons]);

  const enrolledPlayers = useMemo(
    () => players.filter((p) => values.playerIds.includes(p.id)),
    [players, values.playerIds],
  );

  const availablePlayers = useMemo(
    () => players.filter((p) => !values.playerIds.includes(p.id)),
    [players, values.playerIds],
  );

  // ---- Equipment ----------------------------------------------------------
  const addEquipmentLine = useCallback(() => {
    setValues((prev) => ({
      ...prev,
      equipment: [
        ...prev.equipment,
        makeEquipmentLine(prev.equipment, equipmentItems),
      ],
    }));
  }, [equipmentItems]);

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

  // ---- Derived warnings (non-blocking) ------------------------------------
  // Schedule clashes: an event's slot against every other activity. An event has
  // no instructor, so only room clashes apply. Non-blocking.
  const { check: checkConflicts } = useDraftConflicts();
  const conflicts = useMemo(
    () => checkConflicts(draftSessions, ""),
    [checkConflicts, draftSessions],
  );

  const openModal = useCallback(() => {
    setMode("add");
    setValues(EMPTY_EVENT_FORM);
    setBaseline(JSON.stringify(EMPTY_EVENT_FORM));
    setConfirmingClose(false);
    setCloseNudge(0);
    setTab("details");
    setOpen(true);
  }, []);

  // Opens the modal in edit mode prefilled with an existing event.
  const openForEdit = useCallback((next: EventFormValues) => {
    setMode("edit");
    setValues(next);
    setBaseline(JSON.stringify(next));
    setConfirmingClose(false);
    setCloseNudge(0);
    setTab("details");
    setOpen(true);
  }, []);

  // Opens the modal read-only, prefilled with an existing event.
  const openForView = useCallback((next: EventFormValues) => {
    setMode("view");
    setValues(next);
    setBaseline(JSON.stringify(next));
    setConfirmingClose(false);
    setCloseNudge(0);
    setTab("details");
    setOpen(true);
  }, []);

  // Actually closes. The warning state is NOT reset here, so the bar stays put
  // through the close animation (no flash of the normal buttons); the next open
  // clears it.
  const doClose = useCallback(() => {
    setOpen(false);
  }, []);

  // Close requests (X / Escape / backdrop / ביטול) route through here: with
  // unsaved edits, ask before discarding instead of closing.
  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (next) {
        setOpen(true);
        return;
      }
      if (dirty) {
        setConfirmingClose((was) => {
          if (was) setCloseNudge((n) => n + 1);
          return true;
        });
        return;
      }
      doClose();
    },
    [dirty, doClose],
  );

  const cancelClose = useCallback(() => setConfirmingClose(false), []);

  const confirm = useCallback(() => {
    if (!valid) return;
    // Persist the whole event: the scalar doc, then its slot (session) and its
    // associations (players / equipment) in the `relations` junction. Add
    // creates the doc; edit patches it.
    const persist = async () => {
      const eventId = values.id
        ? (await updateEvent(values.id, eventEditPatch(values)), values.id)
        : await addEvent(eventRecordFromForm(values));
      await Promise.all([
        replaceParentSessions(eventId, eventSessionsFromForm(eventId, values)),
        replaceTargetRelations(
          "player_event",
          "player",
          "event",
          eventId,
          values.playerIds.map((subjectId) => ({ subjectId })),
        ),
        replaceTargetRelations(
          "equipment_event",
          "equipment",
          "event",
          eventId,
          values.equipment
            .filter((e) => e.equipmentId)
            .map((e) => ({
              subjectId: e.equipmentId,
              quantity: Number(e.quantity) || 1,
            })),
        ),
      ]);
    };
    void persist();
    doClose();
  }, [valid, values, doClose]);

  return {
    open,
    mode,
    tab,
    setTab,
    openModal,
    openForEdit,
    openForView,
    handleOpenChange,
    dirty,
    confirmingClose,
    closeNudge,
    confirmClose: doClose,
    cancelClose,
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
    busyPlayerReasons,
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
    equipmentItems,
    conflicts,
  };
}
