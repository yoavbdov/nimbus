import { useMemo, useState } from "react";

/** Owns the search box state and case-insensitive filtering for the enum pickers. */
export function useEnumPickerSearch(options: string[]) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.toLowerCase().includes(q));
  }, [options, query]);

  return { query, setQuery, filtered };
}
