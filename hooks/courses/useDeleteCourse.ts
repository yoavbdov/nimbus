import { useCallback, useMemo, useState } from "react";
import { deleteCourseCascade } from "@/lib/firebase/data/courses";

/** A course the modal can delete: its Firestore id plus its display name. */
export interface DeletableCourse {
  id: string;
  name: string;
}

/**
 * Owns the state for the "delete course(s)" confirmation modal. Deleting is
 * permanent and also drops the course's meetings (sessions) and every relation
 * pointing at it, so the user must type a confirmation phrase first:
 *   - one course  → the course's name.
 *   - many courses → "אני מעוניין למחוק N חוגים".
 */
export function useDeleteCourse() {
  const [open, setOpen] = useState(false);
  const [targets, setTargets] = useState<DeletableCourse[]>([]);
  const [confirmText, setConfirmText] = useState("");

  const names = useMemo(() => targets.map((t) => t.name), [targets]);

  const expectedPhrase =
    targets.length > 1
      ? `אני מעוניין למחוק ${targets.length} חוגים`
      : (names[0] ?? "");

  const valid = targets.length > 0 && confirmText.trim() === expectedPhrase;

  const openFor = useCallback((courses: DeletableCourse[]) => {
    setTargets(courses);
    setConfirmText("");
    setOpen(true);
  }, []);

  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next);
  }, []);

  const confirm = useCallback(() => {
    if (!valid) return;
    for (const target of targets) void deleteCourseCascade(target.id);
    setOpen(false);
  }, [valid, targets]);

  return {
    open,
    names,
    confirmText,
    setConfirmText,
    expectedPhrase,
    valid,
    openFor,
    handleOpenChange,
    confirm,
  };
}
