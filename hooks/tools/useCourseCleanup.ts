"use client";

import { useMemo, useState } from "react";
import { useRowSelection } from "@/hooks/useRowSelection";
import { useCollection } from "@/lib/firebase/useCollection";
import { deleteCourseCascade } from "@/lib/firebase/data/courses";
import type { Course } from "@/lib/courses-data";
import {
  courseToCompleted,
  nonCourseCompleted,
  type CompletedCourse,
} from "@/lib/cleanup-data";

/**
 * Drives the archive tool: a single list of the activities that already ended.
 * Archived חוגים are read live from Firestore (status "ארכיון"); events and
 * tournaments are still mock. Deleting a live course removes it from Firestore
 * (cascade); mock rows are dropped in-memory.
 */
export function useCourseCleanup() {
  const { data: records } = useCollection<Course>("courses");
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [confirming, setConfirming] = useState(false);

  // Live archived courses are the source of truth for the חוג rows.
  const archivedIds = useMemo(
    () => new Set(records.filter((c) => c.status === "ארכיון").map((c) => c.id)),
    [records],
  );

  const items = useMemo<CompletedCourse[]>(() => {
    const archivedCourses = records
      .filter((c) => c.status === "ארכיון")
      .map(courseToCompleted);
    return [...archivedCourses, ...nonCourseCompleted].filter(
      (a) => !deletedIds.has(a.id),
    );
  }, [records, deletedIds]);

  // Nothing is selected by default — the user picks what to delete.
  const itemIds = useMemo(() => items.map((a) => a.id), [items]);
  const selection = useRowSelection(itemIds);

  const requestDelete = () => setConfirming(true);
  const cancelDelete = () => setConfirming(false);

  const confirmDelete = () => {
    const ids = selection.selectedIds;
    // Live courses are deleted from Firestore; mock rows are hidden in-memory.
    ids.forEach((id) => {
      if (archivedIds.has(id)) void deleteCourseCascade(id);
    });
    setDeletedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => {
        if (!archivedIds.has(id)) next.add(id);
      });
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

export type { CompletedCourse };
