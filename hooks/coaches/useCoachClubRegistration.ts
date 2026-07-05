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
 * coach can be assigned to an existing חוג. Edits are staged locally against the
 * `baseline` (the persisted list) and nothing is written until "עדכן": that
 * diffs staged vs. baseline, persists the adds/removes, and closes. Closing with
 * unsaved edits asks first (`confirmingClose`) before discarding them.
 */
export function useCoachClubRegistration() {
  const [open, setOpen] = useState(false);
  const [coachId, setCoachId] = useState("");
  const [coachName, setCoachName] = useState("");
  // The staged list being edited, and the persisted list to diff against.
  const [clubs, setClubs] = useState<string[]>([]);
  const [baseline, setBaseline] = useState<string[]>([]);
  const [editing, setEditing] = useState(false);
  // The club name whose removal is awaiting an inline "are you sure" confirm.
  const [pendingRemoval, setPendingRemoval] = useState<string | null>(null);
  // The club selected in the "assign to existing חוג" dropdown.
  const [selectedClub, setSelectedClub] = useState("");
  // Whether a close request is awaiting the "discard unsaved edits" confirm.
  const [confirmingClose, setConfirmingClose] = useState(false);
  // Bumped on each repeated close attempt while confirming, to replay the shake.
  const [closeNudge, setCloseNudge] = useState(0);

  const { data: allCourses } = useCollection<Course>("courses");

  const registered = useMemo(
    () => registeredCoursesFor(clubs, allCourses),
    [clubs, allCourses],
  );
  const available = useMemo(
    () => availableCoursesFor(clubs, allCourses),
    [clubs, allCourses],
  );

  const dirty = useMemo(() => {
    if (clubs.length !== baseline.length) return true;
    const base = new Set(baseline);
    return clubs.some((c) => !base.has(c));
  }, [clubs, baseline]);

  const openFor = useCallback(({ id, name, clubs: clubNames }: OpenForArgs) => {
    setCoachId(id);
    setCoachName(name);
    setClubs(clubNames);
    setBaseline(clubNames);
    setEditing(false);
    setPendingRemoval(null);
    setSelectedClub("");
    setConfirmingClose(false);
    setCloseNudge(0);
    setOpen(true);
  }, []);

  // Discards any staged edits and closes the modal.
  const doClose = useCallback(() => {
    setOpen(false);
    setEditing(false);
    setPendingRemoval(null);
    setSelectedClub("");
    setConfirmingClose(false);
    setClubs(baseline);
  }, [baseline]);

  // Radix close requests (Escape / backdrop / סגור / ביטול) route through here:
  // with unsaved edits, ask before discarding instead of closing.
  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (next) {
        setOpen(true);
        return;
      }
      if (editing && dirty) {
        if (confirmingClose) {
          setCloseNudge((n) => n + 1);
        } else {
          setConfirmingClose(true);
        }
        return;
      }
      doClose();
    },
    [editing, dirty, confirmingClose, doClose],
  );

  const cancelClose = useCallback(() => setConfirmingClose(false), []);

  const startEditing = useCallback(() => setEditing(true), []);

  const requestRemove = useCallback((name: string) => {
    setPendingRemoval(name);
  }, []);

  const cancelRemove = useCallback(() => setPendingRemoval(null), []);

  const confirmRemove = useCallback(() => {
    if (!pendingRemoval) return;
    setClubs((prev) => prev.filter((c) => c !== pendingRemoval));
    setPendingRemoval(null);
  }, [pendingRemoval]);

  const addClub = useCallback(() => {
    if (!selectedClub || clubs.includes(selectedClub)) return;
    setClubs((prev) => [...prev, selectedClub]);
    setSelectedClub("");
  }, [selectedClub, clubs]);

  // "עדכן": persist the staged diff (adds + removes) against baseline, then close.
  const commit = useCallback(() => {
    const base = new Set(baseline);
    const staged = new Set(clubs);
    clubs
      .filter((name) => !base.has(name))
      .forEach((name) => {
        void addRelation({
          kind: "coach_course",
          subjectType: "coach",
          subjectId: coachId,
          targetType: "course",
          targetId: name,
        });
      });
    baseline
      .filter((name) => !staged.has(name))
      .forEach((name) => {
        void removeRelation("coach_course", coachId, name);
      });
    doClose();
  }, [baseline, clubs, coachId, doClose]);

  return {
    open,
    coachName,
    editing,
    registered,
    available,
    pendingRemoval,
    selectedClub,
    setSelectedClub,
    dirty,
    confirmingClose,
    closeNudge,
    openFor,
    handleOpenChange,
    startEditing,
    requestRemove,
    cancelRemove,
    confirmRemove,
    addClub,
    commit,
    confirmClose: doClose,
    cancelClose,
  };
}
