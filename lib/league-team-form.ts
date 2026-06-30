import {
  leagueRanksByCategory,
  type LeagueCategory,
} from "@/lib/leagues-data";

/** Shape of the "add league team" form. Empty string = not chosen yet. */
export interface LeagueTeamFormValues {
  category: LeagueCategory | "";
  rank: string;
  notes: string;
}

export const EMPTY_LEAGUE_TEAM_FORM: LeagueTeamFormValues = {
  category: "",
  rank: "",
  notes: "",
};

/** The league ranks available for the chosen category (empty until one is picked). */
export function ranksForCategory(category: LeagueCategory | ""): string[] {
  return category ? leagueRanksByCategory[category] : [];
}

/** Category and a rank that belongs to it are the starred fields required to submit. */
export function isLeagueTeamFormValid(values: LeagueTeamFormValues): boolean {
  return (
    values.category !== "" &&
    ranksForCategory(values.category).includes(values.rank)
  );
}
