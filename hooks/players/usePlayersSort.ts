import { useMemo, useState } from "react";
import type { Player } from "@/lib/players-data";

export type SortKey =
  | "name"
  | "age"
  | "grade"
  | "israeliRating"
  | "phone"
  | "clubs"
  | "tournaments"
  | "leagueTeam"
  | "ratingUpdatedRecently"
  | "status";
export type SortDir = "asc" | "desc";

const statusOrder: Record<Player["status"], number> = {
  "פעיל": 0,
  "ליגה בלבד": 1,
  "לא פעיל": 2,
};

function getSortValue(p: Player, key: SortKey): string | number {
  switch (key) {
    case "name":
      return p.name;
    case "age":
      return p.age;
    case "grade":
      return p.grade;
    case "israeliRating":
      return p.israeliRating;
    case "phone":
      return p.phone;
    case "clubs":
      return p.courses.length;
    case "tournaments":
      return p.tournaments.length;
    case "leagueTeam":
      return p.leagueTeam ?? "";
    case "ratingUpdatedRecently":
      return p.ratingUpdatedRecently ? 1 : 0;
    case "status":
      return statusOrder[p.status];
  }
}

export function usePlayersSort(players: Player[]) {
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const sorted = useMemo(() => {
    const arr = [...players];
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
  }, [players, sortKey, sortDir]);

  return { sortKey, sortDir, sorted, handleSort };
}
