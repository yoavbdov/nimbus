import { useCallback, useMemo, useState } from "react";
import {
  EMPTY_TOURNAMENT_FORM,
  completeRoundsFrom,
  isTournamentFormValid,
  makeEquipmentLine,
  makeRound,
  meetsTournamentCriteria,
  type EquipmentLineValues,
  type RoundValues,
  type TournamentFormValues,
} from "@/lib/tournament-form";
import { players, type Player } from "@/lib/players-data";
import { exampleRosters } from "@/lib/rosters-data";

/**
 * Owns all state for the "add tournament" modal: the scalar fields, the round
 * list (driven by a count field), the enrolled players and the equipment lines.
 * The modal stays presentational and receives everything from here.
 */
/** The modal's tabs, in order; the first is the default shown on open. */
export type TournamentTab = "details" | "rounds" | "players" | "equipment";

/**
 * "add" shows the empty add flow; "edit" prefills an existing tournament;
 * "view" prefills it read-only (used by the cleanup archive, where tournaments
 * may only be inspected, not changed).
 */
export type TournamentModalMode = "add" | "edit" | "view";

/** Hard cap so a typo in the count field can't spawn thousands of cards. */
const MAX_ROUNDS = 30;

export function useAddTournament() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<TournamentModalMode>("add");
  const [tab, setTab] = useState<TournamentTab>("details");
  const [values, setValues] = useState<TournamentFormValues>(
    EMPTY_TOURNAMENT_FORM,
  );

  const valid = isTournamentFormValid(values);

  const updateField = useCallback(
    <K extends keyof TournamentFormValues>(
      field: K,
      value: TournamentFormValues[K],
    ) => {
      setValues((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  // Switching format resets the rounds list so coming back starts fresh
  // (re-asking for the round count) rather than restoring stale cards.
  const setFormat = useCallback((format: TournamentFormValues["format"]) => {
    setValues((prev) => ({ ...prev, format, roundsCount: "", rounds: [] }));
  }, []);

  // ---- Rounds -------------------------------------------------------------
  // The count field is the source of truth for how many round cards exist; the
  // list is reconciled to it, preserving already-filled rounds.
  const setRoundsCount = useCallback((raw: string) => {
    const digits = raw.replace(/\D/g, "");
    setValues((prev) => {
      if (digits === "") {
        return { ...prev, roundsCount: "", rounds: [] };
      }
      const count = Math.min(Number(digits), MAX_ROUNDS);
      const rounds = [...prev.rounds];
      while (rounds.length < count) rounds.push(makeRound());
      rounds.length = count;
      return { ...prev, roundsCount: String(count), rounds };
    });
  }, []);

  const updateRound = useCallback(
    (id: string, patch: Partial<RoundValues>) => {
      setValues((prev) => ({
        ...prev,
        rounds: prev.rounds.map((r) => (r.id === id ? { ...r, ...patch } : r)),
      }));
    },
    [],
  );

  // The "magic" button: fill every round after the chosen one a week apart.
  const completeFromRound = useCallback((baseIndex: number) => {
    setValues((prev) => ({
      ...prev,
      rounds: completeRoundsFrom(prev.rounds, baseIndex),
    }));
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

  // ---- Derived warnings (non-blocking) ------------------------------------
  const judgeWarning = values.judge === "";
  const criteriaMismatch = useCallback(
    (playerId: string) => {
      const player = players.find((p) => p.id === playerId);
      return player ? !meetsTournamentCriteria(player, values) : false;
    },
    [values],
  );

  const openModal = useCallback(() => {
    setMode("add");
    setValues(EMPTY_TOURNAMENT_FORM);
    setTab("details");
    setOpen(true);
  }, []);

  // Opens the modal in edit mode prefilled with an existing tournament.
  const openForEdit = useCallback((next: TournamentFormValues) => {
    setMode("edit");
    setValues(next);
    setTab("details");
    setOpen(true);
  }, []);

  // Opens the modal read-only, prefilled with an existing tournament.
  const openForView = useCallback((next: TournamentFormValues) => {
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
    setRoundsCount,
    updateRound,
    completeFromRound,
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
    judgeWarning,
    criteriaMismatch,
  };
}
