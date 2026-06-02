import { useMemo, useState } from "react";
import { leagueRanksByCategory, type LeagueTeam } from "@/lib/leagues-data";

export type SortKey = "name" | "rank" | "players" | "notes";
export type SortDir = "asc" | "desc";

function getSortValue(t: LeagueTeam, key: SortKey): string | number {
  switch (key) {
    case "name":
      return t.name;
    case "rank":
      // Higher rank importance sorts higher.
      return leagueRanksByCategory[t.category].indexOf(t.rank);
    case "players":
      return t.players.length;
    case "notes":
      return t.notes;
  }
}

export function useLeaguesSort(teams: LeagueTeam[]) {
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const sorted = useMemo(() => {
    const arr = [...teams];
    arr.sort((a, b) => {
      const av = getSortValue(a, sortKey);
      const bv = getSortValue(b, sortKey);
      const cmp =
        typeof av === "number" && typeof bv === "number"
          ? av - bv
          : String(av).localeCompare(String(bv), "he");
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [teams, sortKey, sortDir]);

  return { sortKey, sortDir, sorted, handleSort };
}
