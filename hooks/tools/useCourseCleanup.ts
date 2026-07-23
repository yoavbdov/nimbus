"use client";

import { useMemo, useState } from "react";
import { useRowSelection } from "@/hooks/useRowSelection";
import { useCollection } from "@/lib/firebase/useCollection";
import { deleteCourseCascade } from "@/lib/firebase/data/courses";
import { deleteTournamentCascade } from "@/lib/firebase/data/tournaments";
import { deleteEventCascade } from "@/lib/firebase/data/events";
import type { Course } from "@/lib/courses-data";
import type { Tournament } from "@/lib/tournaments-data";
import type { ClubEvent } from "@/lib/events-data";
import {
  courseToCompleted,
  tournamentToCompleted,
  eventToCompleted,
  type CompletedCourse,
} from "@/lib/cleanup-data";

/**
 * Drives the archive tool: a single list of the activities that already ended,
 * all three kinds read live from Firestore. Deleting a row removes it (and its
 * sessions + relations) through that kind's cascade.
 */
export function useCourseCleanup() {
  const { data: records } = useCollection<Course>("courses");
  const { data: tournamentRecords } = useCollection<Tournament>("tournaments");
  const { data: eventRecords } = useCollection<ClubEvent>("events");
  const [confirming, setConfirming] = useState(false);

  // Which cascade to run for a given row id — also the set of deletable rows.
  const cascadeById = useMemo(() => {
    const map = new Map<string, (id: string) => Promise<void>>();
    for (const c of records)
      if (c.status === "ארכיון") map.set(c.id, deleteCourseCascade);
    for (const t of tournamentRecords)
      if (t.status === "הסתיימה") map.set(t.id, deleteTournamentCascade);
    for (const e of eventRecords)
      if (e.status === "הסתיים") map.set(e.id, deleteEventCascade);
    return map;
  }, [records, tournamentRecords, eventRecords]);

  // A deleted row disappears on its own: Firestore pushes the new collection.
  const items = useMemo<CompletedCourse[]>(
    () => [
      ...records.filter((c) => c.status === "ארכיון").map(courseToCompleted),
      ...tournamentRecords
        .filter((t) => t.status === "הסתיימה")
        .map(tournamentToCompleted),
      ...eventRecords.filter((e) => e.status === "הסתיים").map(eventToCompleted),
    ],
    [records, tournamentRecords, eventRecords],
  );

  // Nothing is selected by default — the user picks what to delete.
  const itemIds = useMemo(() => items.map((a) => a.id), [items]);
  const selection = useRowSelection(itemIds);

  const requestDelete = () => setConfirming(true);
  const cancelDelete = () => setConfirming(false);

  const confirmDelete = () => {
    // Every row is a real document now, so each one is deleted by its own
    // cascade (the doc plus its sessions and relations).
    selection.selectedIds.forEach((id) => {
      const cascade = cascadeById.get(id);
      if (cascade) void cascade(id);
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
