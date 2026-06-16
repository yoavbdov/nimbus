import { useCallback, useState } from "react";

/**
 * Manages a set of selected row ids for a table.
 * Keeps selection state out of the presentational table components.
 */
export function useRowSelection(ids: string[], initialSelected?: string[]) {
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(initialSelected),
  );

  const isSelected = useCallback((id: string) => selected.has(id), [selected]);

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const allSelected = ids.length > 0 && ids.every((id) => selected.has(id));
  const someSelected = !allSelected && ids.some((id) => selected.has(id));

  const toggleAll = useCallback(() => {
    setSelected((prev) => {
      const everySelected = ids.length > 0 && ids.every((id) => prev.has(id));
      return everySelected ? new Set() : new Set(ids);
    });
  }, [ids]);

  const clear = useCallback(() => setSelected(new Set()), []);

  return {
    selectedIds: selected,
    selectedCount: selected.size,
    isSelected,
    toggle,
    toggleAll,
    clear,
    allSelected,
    someSelected,
  };
}

export type RowSelection = ReturnType<typeof useRowSelection>;
