import { useMemo, useState } from "react";

/** Owns the search box state and filtering for a single facet dropdown. */
export function useFacetDropdown(options: string[]) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return options;
    return options.filter((o) => o.includes(q));
  }, [options, query]);

  return { query, setQuery, filtered };
}
