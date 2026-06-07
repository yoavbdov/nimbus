import { useCallback } from "react";
import { useRowSelection } from "@/hooks/useRowSelection";

interface TableSelectionOptions<A> {
  /** Ids of every row currently rendered (in display order). */
  ids: string[];
  /** The row whose action menu is open, or null when none is open. */
  activeId: string | null;
  /** The table's existing single-row action handler. */
  onAction: (action: A) => void;
}

/**
 * Combines row selection with the decision of whether the open action menu
 * should be the bulk menu. Keeps that logic out of the presentational tables.
 *
 * Bulk mode is on when the open menu belongs to a row that is part of a
 * multi-row selection. Running a bulk action clears the selection afterwards.
 */
export function useTableSelection<A>({
  ids,
  activeId,
  onAction,
}: TableSelectionOptions<A>) {
  const selection = useRowSelection(ids);

  const bulkMode =
    activeId !== null &&
    selection.isSelected(activeId) &&
    selection.selectedCount > 1;

  const onBulkSelect = useCallback(
    (action: A) => {
      onAction(action);
      selection.clear();
    },
    [onAction, selection],
  );

  return { selection, bulkMode, onBulkSelect };
}
