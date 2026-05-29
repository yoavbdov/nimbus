import { useMemo, useState } from "react";
import type { Coach } from "@/lib/coaches-data";

export type SortKey = "name" | "phone" | "clubs" | "status";
export type SortDir = "asc" | "desc";

const statusOrder: Record<Coach["status"], number> = {
  "פעיל": 0,
  "מחליף": 1,
  "לא פעיל": 2,
};

function getSortValue(c: Coach, key: SortKey): string | number {
  switch (key) {
    case "name":
      return c.name;
    case "phone":
      return c.phone;
    case "clubs":
      return c.clubs.length;
    case "status":
      return statusOrder[c.status];
  }
}

export function useCoachesSort(coaches: Coach[]) {
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
    const arr = [...coaches];
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
  }, [coaches, sortKey, sortDir]);

  return { sortKey, sortDir, sorted, handleSort };
}
