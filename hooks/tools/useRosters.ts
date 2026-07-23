"use client";

import { useMemo, useState } from "react";
import { useSavedRosters } from "@/hooks/rosters/useSavedRosters";
import { useCollection } from "@/lib/firebase/useCollection";
import {
  addRoster,
  deleteRoster,
  renameRoster,
  setRosterMembers,
} from "@/lib/firebase/data/rosters";
import type { Player } from "@/lib/players-data";

export type RosterModalMode = "create" | "edit";
export type RosterNameDialogMode = "create" | "rename";

/** The roster being filled in / edited. Nothing here is in Firestore yet. */
interface RosterDraft {
  mode: RosterModalMode;
  /** The document being edited; null while creating (no doc exists yet). */
  rosterId: string | null;
  name: string;
  memberIds: string[];
}

/**
 * Drives the rosters tool: browsing the saved player lists, opening one in a
 * modal to view and edit its members, creating new lists, and adding members
 * from the club.
 *
 * Creating and editing run through the SAME draft: the modal edits `draft` in
 * memory and only writes to Firestore when the user confirms, so a new list
 * doesn't appear until it is finished and cancelling an edit changes nothing.
 * Members are exposed as full `Player` records, because the modal shows and
 * picks them with the very same components the "add students to a course" flow
 * uses (EnrolledPersonRow + PeoplePickerDialog).
 */
export function useRosters() {
  const { rosters: lists, loading } = useSavedRosters();
  const { data: players } = useCollection<Player>("players");

  const [draft, setDraft] = useState<RosterDraft | null>(null);
  const [saving, setSaving] = useState(false);

  // Name dialog — "create" names a new list before its modal opens, "rename"
  // retitles the open draft.
  const [nameDialogMode, setNameDialogMode] =
    useState<RosterNameDialogMode | null>(null);
  const [draftName, setDraftName] = useState("");

  // Add-members picker (its search / filters / sorting live in the dialog).
  const [pickerOpen, setPickerOpen] = useState(false);
  const [checkedIds, setCheckedIds] = useState<string[]>([]);

  // Pending confirmation for deleting a whole list from the index.
  const [pendingListDeletion, setPendingListDeletion] = useState<string | null>(
    null,
  );

  /** The draft's members as live player records, strongest first. */
  const members = useMemo<Player[]>(() => {
    if (!draft) return [];
    const ids = new Set(draft.memberIds);
    return players
      .filter((p) => ids.has(p.id))
      .sort((a, b) => b.israeliRating - a.israeliRating);
  }, [players, draft]);

  /** Club members not already in the draft — the picker's candidates. */
  const availablePlayers = useMemo<Player[]>(() => {
    if (!draft) return players;
    const present = new Set(draft.memberIds);
    return players.filter((p) => !present.has(p.id));
  }, [players, draft]);

  const pendingDeletionList = lists.find((l) => l.id === pendingListDeletion);

  // ── Opening / closing the roster modal ────────────────────────────
  const openList = (id: string) => {
    const list = lists.find((l) => l.id === id);
    if (!list) return;
    setDraft({
      mode: "edit",
      rosterId: list.id,
      name: list.name,
      memberIds: list.players.map((p) => p.id),
    });
  };

  /** Closes the modal and throws the draft away — nothing was written. */
  const cancelDraft = () => setDraft(null);

  // ── Create / rename via the shared name dialog ────────────────────
  const startCreateList = () => {
    setDraftName("");
    setNameDialogMode("create");
  };
  const startRenameList = () => {
    if (!draft) return;
    setDraftName(draft.name);
    setNameDialogMode("rename");
  };
  const closeNameDialog = () => setNameDialogMode(null);

  const confirmNameDialog = () => {
    const name = draftName.trim();
    if (!name) return;
    setNameDialogMode(null);

    if (nameDialogMode === "create") {
      // Naming is step one; the list itself is created only once the user
      // confirms the modal that opens next.
      setDraft({ mode: "create", rosterId: null, name, memberIds: [] });
      return;
    }
    setDraft((prev) => (prev ? { ...prev, name } : prev));
  };

  // ── Members (draft-only until the modal is confirmed) ─────────────
  const openPicker = () => {
    setCheckedIds([]);
    setPickerOpen(true);
  };
  const togglePicked = (id: string) =>
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  const confirmAddMembers = () => {
    setDraft((prev) =>
      prev ? { ...prev, memberIds: [...prev.memberIds, ...checkedIds] } : prev,
    );
    setPickerOpen(false);
    setCheckedIds([]);
  };
  const removeMember = (id: string) =>
    setDraft((prev) =>
      prev
        ? { ...prev, memberIds: prev.memberIds.filter((m) => m !== id) }
        : prev,
    );

  // ── Commit the draft ──────────────────────────────────────────────
  /** Writes the draft: creates the list, or renames / re-members an existing one. */
  const saveDraft = async () => {
    if (!draft || saving) return;
    setSaving(true);
    try {
      const rosterId =
        draft.rosterId == null
          ? await addRoster(draft.name)
          : await renameRoster(draft.rosterId, draft.name);
      await setRosterMembers(rosterId, draft.memberIds);
      setDraft(null);
    } finally {
      setSaving(false);
    }
  };

  // ── Delete a whole list (with confirmation) ───────────────────────
  const requestDeleteList = (id: string) => setPendingListDeletion(id);
  const cancelDeleteList = () => setPendingListDeletion(null);
  const confirmDeleteList = async () => {
    if (!pendingListDeletion) return;
    const id = pendingListDeletion;
    setPendingListDeletion(null);
    await deleteRoster(id);
  };

  return {
    lists,
    loading,
    draft,
    members,
    openList,
    cancelDraft,
    saveDraft,
    saving,

    nameDialogMode,
    draftName,
    setDraftName,
    startCreateList,
    startRenameList,
    closeNameDialog,
    confirmNameDialog,

    availablePlayers,
    pickerOpen,
    setPickerOpen,
    checkedIds,
    openPicker,
    togglePicked,
    confirmAddMembers,
    removeMember,

    pendingDeletionList,
    requestDeleteList,
    cancelDeleteList,
    confirmDeleteList,
  };
}
