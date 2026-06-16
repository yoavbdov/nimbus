"use client";

import { useMemo, useState } from "react";
import { useRowSelection } from "@/hooks/useRowSelection";
import {
  completedActivities,
  type CompletedActivity,
} from "@/lib/cleanup-data";

/**
 * Drives the archive tool: a single list of the activities that already ended
 * (חוגים, אירועים, תחרויות). The only action is deleting activities from the
 * archive. All deletion is in-memory (mock data).
 */
export function useActivityCleanup() {
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [confirming, setConfirming] = useState(false);

  const items = useMemo(
    () => completedActivities.filter((a) => !deletedIds.has(a.id)),
    [deletedIds],
  );

  // Everything is selected by default, per the requested behaviour.
  const itemIds = useMemo(() => items.map((a) => a.id), [items]);
  const selection = useRowSelection(
    itemIds,
    completedActivities.map((a) => a.id),
  );

  const requestDelete = () => setConfirming(true);
  const cancelDelete = () => setConfirming(false);

  const confirmDelete = () => {
    setDeletedIds((prev) => {
      const next = new Set(prev);
      selection.selectedIds.forEach((id) => next.add(id));
      return next;
    });
    selection.clear();
    setConfirming(false);
  };

  return {
    items,
    selection,
    confirming,
    requestDelete,
    cancelDelete,
    confirmDelete,
  };
}

export type { CompletedActivity };
