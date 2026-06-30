import { useCallback, useState } from "react";
import type { LeagueCategory } from "@/lib/leagues-data";
import {
  EMPTY_LEAGUE_TEAM_FORM,
  isLeagueTeamFormValid,
  ranksForCategory,
  type LeagueTeamFormValues,
} from "@/lib/league-team-form";

/**
 * Owns all state for the "add league team" modal. The modal stays
 * presentational and receives everything from here.
 */
export function useAddLeagueTeam() {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<LeagueTeamFormValues>(
    EMPTY_LEAGUE_TEAM_FORM,
  );

  const valid = isLeagueTeamFormValid(values);

  const updateField = useCallback(
    <K extends keyof LeagueTeamFormValues>(
      field: K,
      value: LeagueTeamFormValues[K],
    ) => {
      setValues((prev) => {
        const next = { ...prev, [field]: value };
        // Switching category clears a rank that no longer belongs to it.
        if (field === "category" && !ranksForCategory(next.category).includes(next.rank)) {
          next.rank = "";
        }
        return next;
      });
    },
    [],
  );

  // Opens the modal, defaulting the category to the currently viewed tab.
  const openModal = useCallback((category: LeagueCategory) => {
    setValues({ ...EMPTY_LEAGUE_TEAM_FORM, category });
    setOpen(true);
  }, []);

  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next);
  }, []);

  const confirm = useCallback(() => {
    if (!valid) return;
    // UI only for now — submitting is wired up elsewhere later.
  }, [valid]);

  return {
    open,
    openModal,
    handleOpenChange,
    values,
    updateField,
    valid,
    confirm,
  };
}
