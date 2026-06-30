import { useCallback, useMemo, useState } from "react";
import type { LeagueTeam } from "@/lib/leagues-data";
import {
  isLeagueTeamFormValid,
  ranksForCategory,
  type LeagueTeamFormValues,
} from "@/lib/league-team-form";
import {
  leagueRoster,
  leagueTeamNameById,
  rosterPlayer,
  type RosterPlayer,
} from "@/lib/league-roster";

export type TeamDetailsTab = "details" | "players";

/** A roster row inside the add-players picker, with its selection/blocked state. */
export interface PlayerPickerRow {
  player: RosterPlayer;
  /** Already on this team or locked to another — not toggleable. */
  disabled: boolean;
  checked: boolean;
  /** Tag shown beside the name: the blocking team's name, or "כבר בקבוצה". */
  note: string | null;
}

/**
 * Owns all state for the "team details" modal: the editable team fields, the
 * active tab, the team's player roster (add / remove), and the add-players
 * picker dialog. The modal and its sub-dialogs stay presentational.
 */
export function useLeagueTeamDetails() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<TeamDetailsTab>("details");
  const [teamId, setTeamId] = useState<string | null>(null);
  const [values, setValues] = useState<LeagueTeamFormValues>({
    category: "",
    rank: "",
    notes: "",
  });
  const [memberIds, setMemberIds] = useState<string[]>([]);

  // Add-players picker.
  const [pickerOpen, setPickerOpen] = useState(false);
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const [query, setQuery] = useState("");

  const valid = isLeagueTeamFormValid(values);

  const updateField = useCallback(
    <K extends keyof LeagueTeamFormValues>(
      field: K,
      value: LeagueTeamFormValues[K],
    ) => {
      setValues((prev) => {
        const next = { ...prev, [field]: value };
        if (field === "category" && !ranksForCategory(next.category).includes(next.rank)) {
          next.rank = "";
        }
        return next;
      });
    },
    [],
  );

  // Opens the modal for a team, prefilled, on the requested tab.
  const openFor = useCallback((team: LeagueTeam, initialTab: TeamDetailsTab) => {
    setTeamId(team.id);
    setValues({ category: team.category, rank: team.rank, notes: team.notes });
    setMemberIds(
      leagueRoster.filter((p) => p.teamId === team.id).map((p) => p.id),
    );
    setTab(initialTab);
    setOpen(true);
  }, []);

  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next);
  }, []);

  const removePlayer = useCallback((id: string) => {
    setMemberIds((prev) => prev.filter((m) => m !== id));
  }, []);

  // The team's current players, in the order they were added.
  const members = useMemo(
    () => memberIds.map(rosterPlayer).filter((p): p is RosterPlayer => !!p),
    [memberIds],
  );

  const openPicker = useCallback(() => {
    setCheckedIds([]);
    setQuery("");
    setPickerOpen(true);
  }, []);

  const handlePickerOpenChange = useCallback((next: boolean) => {
    setPickerOpen(next);
    if (!next) {
      setCheckedIds([]);
      setQuery("");
    }
  }, []);

  const toggleChecked = useCallback((id: string) => {
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  // Commits the picker's checked players to the team's roster.
  const confirmAddPlayers = useCallback(() => {
    setMemberIds((prev) => [
      ...prev,
      ...checkedIds.filter((id) => !prev.includes(id)),
    ]);
    setCheckedIds([]);
    setQuery("");
    setPickerOpen(false);
  }, [checkedIds]);

  // Every roster player, filtered by the search query. A player already on this
  // team shows checked + "כבר בקבוצה"; one locked to another team is grayed out
  // and tagged with that team's name; the rest are free to pick.
  const pickerRows = useMemo<PlayerPickerRow[]>(() => {
    const memberSet = new Set(memberIds);
    const checkedSet = new Set(checkedIds);
    const q = query.trim().toLowerCase();
    return leagueRoster
      .filter((p) => p.name.toLowerCase().includes(q))
      .map((p) => {
        const inThisTeam = memberSet.has(p.id);
        const inOtherTeam =
          p.teamId !== null && p.teamId !== teamId && !inThisTeam;
        return {
          player: p,
          disabled: inThisTeam || inOtherTeam,
          checked: inThisTeam || checkedSet.has(p.id),
          note: inThisTeam
            ? "כבר בקבוצה"
            : inOtherTeam
              ? leagueTeamNameById[p.teamId as string]
              : null,
        };
      });
  }, [memberIds, checkedIds, query, teamId]);

  const confirm = useCallback(() => {
    if (!valid) return;
    // UI only for now — submitting is wired up elsewhere later.
  }, [valid]);

  return {
    open,
    tab,
    setTab,
    openFor,
    handleOpenChange,
    values,
    updateField,
    valid,
    members,
    removePlayer,
    confirm,
    // Add-players picker.
    pickerOpen,
    openPicker,
    handlePickerOpenChange,
    query,
    setQuery,
    pickerRows,
    checkedCount: checkedIds.length,
    toggleChecked,
    confirmAddPlayers,
  };
}
