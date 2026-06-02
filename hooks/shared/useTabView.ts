import { useState } from "react";

/** Tracks which tab is active in a simple two-or-more tab switcher. */
export function useTabView<T extends string>(initial: T) {
  const [view, setView] = useState<T>(initial);
  return { view, setView };
}
