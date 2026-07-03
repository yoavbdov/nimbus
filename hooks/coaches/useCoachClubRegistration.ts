import { useCallback, useMemo, useState } from "react";
import {
  availableCoursesFor,
  registeredCoursesFor,
} from "@/lib/course-registration";
import { addRelation, removeRelation } from "@/lib/firebase/data/relations";
import { useCollection } from "@/lib/firebase/useCollection";
import type { Course } from "@/lib/courses-data";

interface OpenForArgs {
  id: string;
  name: string;
  clubs: string[];
}

/**
 * Owns the state for the coach "שיוך לחוגים" modal. Mirrors the player club
 * registration flow, driven by a coach's id + name plus the list of חוגים they
 * instruct.
 *
 * The modal starts read-only; "עריכה" flips it into edit mode, where each
 * assignment can be removed (after an inline "האם אתה בטוח" confirm) and the
 * coach can be assigned to an existing חוג. Both add and remove persist the new
 * `clubs` array to Firestore.
 */
export function useCoachClubRegistration() {
  const [open, setOpen] = useState(false);
  const [coachId, setCoachId] = useState("");
  const [coachName, setCoachName] = useState("");
  const [clubs, setClubs] = useState<string[]>([]);
  const [editing, setEditing] = useState(false);
  // The club name whose removal is awaiting an inline "are you sure" confirm.
  const [pendingRemoval, setPendingRemoval] = useState<string | null>(null);
  // The club selected in the "assign to existing חוג" dropdown.
  const [selectedClub, setSelectedClub] = useState("");

  const { data: allCourses } = useCollection<Course>("courses");

  const registered = useMemo(
    () => registeredCoursesFor(clubs, allCourses),
    [clubs, allCourses],
  );
  const available = useMemo(
    () => availableCoursesFor(clubs, allCourses),
    [clubs, allCourses],
  );

  const openFor = useCallback(({ id, name, clubs: clubNames }: OpenForArgs) => {
    setCoachId(id);
    setCoachName(name);
    setClubs(clubNames);
    setEditing(false);
    setPendingRemoval(null);
    setSelectedClub("");
    setOpen(true);
  }, []);

  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next);
    if (!next) {
      setEditing(false);
      setPendingRemoval(null);
      setSelectedClub("");
    }
  }, []);

  const startEditing = useCallback(() => setEditing(true), []);

  const stopEditing = useCallback(() => {
    setEditing(false);
    setPendingRemoval(null);
    setSelectedClub("");
  }, []);

  const requestRemove = useCallback((name: string) => {
    setPendingRemoval(name);
  }, []);

  const cancelRemove = useCallback(() => setPendingRemoval(null), []);

  const confirmRemove = useCallback(() => {
    if (!pendingRemoval) return;
    setClubs((prev) => prev.filter((c) => c !== pendingRemoval));
    void removeRelation("coach_course", coachId, pendingRemoval);
    setPendingRemoval(null);
  }, [pendingRemoval, coachId]);

  const addClub = useCallback(() => {
    if (!selectedClub || clubs.includes(selectedClub)) return;
    setClubs((prev) => [...prev, selectedClub]);
    void addRelation({
      kind: "coach_course",
      subjectType: "coach",
      subjectId: coachId,
      targetType: "course",
      targetId: selectedClub,
    });
    setSelectedClub("");
  }, [selectedClub, clubs, coachId]);

  return {
    open,
    coachName,
    editing,
    registered,
    available,
    pendingRemoval,
    selectedClub,
    setSelectedClub,
    openFor,
    handleOpenChange,
    startEditing,
    stopEditing,
    requestRemove,
    cancelRemove,
    confirmRemove,
    addClub,
  };
}
