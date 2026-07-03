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
 * Owns the state for the "הרשמה לחוגים" modal. Driven by a player's name plus
 * the list of חוגים they're registered to, so any table (players page or the
 * dashboard rating table) can open it.
 *
 * The modal starts read-only; "עריכה" flips it into edit mode, where each
 * registration can be removed (after an inline "האם אתה בטוח" confirm) and the
 * player can be added to an existing חוג. Adding/removing are UI-only for now —
 * confirm/remove deliberately do nothing.
 */
export function useClubRegistration() {
  const [open, setOpen] = useState(false);
  const [playerId, setPlayerId] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [clubs, setClubs] = useState<string[]>([]);
  const [editing, setEditing] = useState(false);
  // The club name whose removal is awaiting an inline "are you sure" confirm.
  const [pendingRemoval, setPendingRemoval] = useState<string | null>(null);
  // The club selected in the "add to existing חוג" dropdown.
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
    setPlayerId(id);
    setPlayerName(name);
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
    void removeRelation("player_course", playerId, pendingRemoval);
    setPendingRemoval(null);
  }, [pendingRemoval, playerId]);

  const addClub = useCallback(() => {
    if (!selectedClub || clubs.includes(selectedClub)) return;
    setClubs((prev) => [...prev, selectedClub]);
    void addRelation({
      kind: "player_course",
      subjectType: "player",
      subjectId: playerId,
      targetType: "course",
      targetId: selectedClub,
    });
    setSelectedClub("");
  }, [selectedClub, clubs, playerId]);

  return {
    open,
    playerName,
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
