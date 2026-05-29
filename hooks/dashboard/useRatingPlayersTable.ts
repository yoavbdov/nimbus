import { useMemo, useState, type MouseEvent } from "react";
import { usePlayerActionsMenu } from "@/hooks/usePlayerActionsMenu";

export interface RatingPlayer {
  name: string;
  rating: number;
  birthYear: number;
}

export type SortKey = "name" | "rating" | "birthYear";
export type SortDir = "asc" | "desc";

export function useRatingPlayersTable(players: RatingPlayer[]) {
  const [sortKey, setSortKey] = useState<SortKey>("rating");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const menu = usePlayerActionsMenu();
  const [activeName, setActiveName] = useState<string | null>(null);

  function handleRowClick(name: string, e: MouseEvent) {
    setActiveName(name);
    menu.openAt(e);
  }

  function handleMenuOpenChange(next: boolean) {
    menu.setOpen(next);
    if (!next) setActiveName(null);
  }

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "name" ? "asc" : "desc");
    }
  }

  const sorted = useMemo(() => {
    const arr = [...players];
    arr.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      const cmp =
        typeof av === "string"
          ? av.localeCompare(bv as string, "he")
          : (av as number) - (bv as number);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [players, sortKey, sortDir]);

  return {
    sortKey,
    sortDir,
    sorted,
    handleSort,
    menuOpen: menu.open,
    virtualRef: menu.virtualRef,
    onSelectAction: menu.onSelect,
    activeName,
    handleRowClick,
    handleMenuOpenChange,
  };
}
