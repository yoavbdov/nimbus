import { useCallback, useMemo, useState } from "react";
import {
  EMPTY_TOURNAMENT_FORM,
  completeRoundsFrom,
  isTournamentFormValid,
  makeEquipmentLine,
  makeRound,
  type EquipmentLineValues,
  type RoundValues,
  type TournamentFormValues,
} from "@/lib/tournament-form";
import { criteriaMismatchReasons, maxBelowMin } from "@/lib/criteria";
import { type Player } from "@/lib/players-data";
import { exampleRosters } from "@/lib/rosters-data";
import { useCollection } from "@/lib/firebase/useCollection";
import { addTournament, updateTournament } from "@/lib/firebase/data/tournaments";
import { replaceParentSessions } from "@/lib/firebase/data/sessions";
import { replaceTargetRelations } from "@/lib/firebase/data/relations";
import {
  tournamentRecordFromForm,
  tournamentEditPatch,
  tournamentSessionsFromForm,
} from "@/lib/tournament-details";

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
  // Snapshot of the form as it was on open (JSON), to detect unsaved edits.
  const [baseline, setBaseline] = useState<string>(() =>
    JSON.stringify(EMPTY_TOURNAMENT_FORM),
  );
  // Whether a close attempt is awaiting the "discard unsaved edits" confirm, and
  // a counter bumped on each repeated attempt to replay the warning's shake.
  const [confirmingClose, setConfirmingClose] = useState(false);
  const [closeNudge, setCloseNudge] = useState(0);

  // The club roster, read live — the players picker and criteria checks all
  // work off real players (docs keyed by name), not the legacy mock.
  const { data: players } = useCollection<Player>("players");

  // A max bound below its min is an impossible range — block it and flag it.
  const ageRangeInvalid =
    !values.noAgeLimit && maxBelowMin(values.ageMin, values.ageMax);
  const ratingRangeInvalid =
    !values.noRatingLimit && maxBelowMin(values.ratingMin, values.ratingMax);
  const valid =
    isTournamentFormValid(values) && !ageRangeInvalid && !ratingRangeInvalid;
  // Read-only (view) never counts as dirty; otherwise compare against the open snapshot.
  const dirty = mode !== "view" && JSON.stringify(values) !== baseline;

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
  }, [players, values.playerIds]);

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
    [players, values.playerIds],
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
      equipment: [...prev.equipment, makeEquipmentLine(prev.equipment)],
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
  const mismatchReasons = useCallback(
    (playerId: string) => {
      const player = players.find((p) => p.id === playerId);
      return player ? criteriaMismatchReasons(player, values) : [];
    },
    [players, values],
  );

  const openModal = useCallback(() => {
    setMode("add");
    setValues(EMPTY_TOURNAMENT_FORM);
    setBaseline(JSON.stringify(EMPTY_TOURNAMENT_FORM));
    setConfirmingClose(false);
    setCloseNudge(0);
    setTab("details");
    setOpen(true);
  }, []);

  // Opens the modal in edit mode prefilled with an existing tournament.
  const openForEdit = useCallback((next: TournamentFormValues) => {
    setMode("edit");
    setValues(next);
    setBaseline(JSON.stringify(next));
    setConfirmingClose(false);
    setCloseNudge(0);
    setTab("details");
    setOpen(true);
  }, []);

  // Opens the modal read-only, prefilled with an existing tournament.
  const openForView = useCallback((next: TournamentFormValues) => {
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
    // Persist the whole tournament: the scalar doc, then its rounds (sessions)
    // and its associations (judge / players / equipment) in the `relations`
    // junction. Add creates the doc; edit patches it. Derived counts
    // (participants) are projected on read, so the patch skips them.
    const persist = async () => {
      const tournamentId = values.id
        ? (await updateTournament(values.id, tournamentEditPatch(values)),
          values.id)
        : await addTournament(tournamentRecordFromForm(values));
      await Promise.all([
        replaceParentSessions(
          tournamentId,
          tournamentSessionsFromForm(tournamentId, values),
        ),
        replaceTargetRelations(
          "coach_tournament",
          "coach",
          "tournament",
          tournamentId,
          values.judge ? [{ subjectId: values.judge, role: "שופט" }] : [],
        ),
        replaceTargetRelations(
          "player_tournament",
          "player",
          "tournament",
          tournamentId,
          values.playerIds.map((subjectId) => ({ subjectId })),
        ),
        replaceTargetRelations(
          "equipment_tournament",
          "equipment",
          "tournament",
          tournamentId,
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
    ageRangeInvalid,
    ratingRangeInvalid,
    mismatchReasons,
  };
}
