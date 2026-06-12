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
import { players } from "@/lib/players-data";

/**
 * Owns all state for the "add tournament" modal: the scalar fields, the round
 * list (driven by a count field), the enrolled players and the equipment lines.
 * The modal stays presentational and receives everything from here.
 */
/** The modal's tabs, in order; the first is the default shown on open. */
export type TournamentTab = "details" | "rounds" | "players" | "equipment";

/** "add" shows the empty add flow; "edit" prefills an existing tournament. */
export type TournamentModalMode = "add" | "edit";

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
    setRoundsCount,
    updateRound,
    completeFromRound,
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
    judgeWarning,
    criteriaMismatch,
  };
}
