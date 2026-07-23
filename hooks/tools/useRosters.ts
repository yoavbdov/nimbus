"use client";

import { useCallback, useMemo, useState } from "react";
import {
  buildPreparedRosters,
  toRosterPlayer,
  type RosterPlayer,
  type SavedRoster,
} from "@/lib/rosters-data";
import { useCollection } from "@/lib/firebase/useCollection";
import type { Player } from "@/lib/players-data";

export type RosterNameDialogMode = "create" | "rename";

/**
 * Drives the rosters tool: browsing player lists, opening one to view and edit
 * its members, creating new lists, and adding members from the club. The club
 * roster and the three prepared lists are read live from Firestore; the user's
 * own edits are in-memory for the session.
 */
export function useRosters() {
  const { data: players, loading } = useCollection<Player>("players");

  /** Every club member, shaped as roster rows for the picker. */
  const clubPlayers = useMemo<RosterPlayer[]>(
    () => players.map(toRosterPlayer),
    [players],
  );

  // The prepared lists are derived from the live roster; `edited` holds the
  // user's version once they change anything, and wins from then on.
  const preparedLists = useMemo(() => buildPreparedRosters(players), [players]);
  const [edited, setEdited] = useState<SavedRoster[] | null>(null);
  const lists = edited ?? preparedLists;

  /** Applies a change to the lists, materialising the edited copy on first use. */
  const setLists = useCallback(
    (update: (prev: SavedRoster[]) => SavedRoster[]) => {
      setEdited((prev) => update(prev ?? preparedLists));
    },
    [preparedLists],
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Name dialog — shared by "new list" and "rename list".
  const [nameDialogMode, setNameDialogMode] =
    useState<RosterNameDialogMode | null>(null);
  const [draftName, setDraftName] = useState("");

  // Add-members picker.
  const [pickerOpen, setPickerOpen] = useState(false);
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const [memberQuery, setMemberQuery] = useState("");

  // Pending confirmations.
  const [pendingMemberId, setPendingMemberId] = useState<string | null>(null);
  const [pendingListDeletion, setPendingListDeletion] = useState<string | null>(
    null,
  );

  const selectedList = useMemo(
    () => lists.find((l) => l.id === selectedId) ?? null,
    [lists, selectedId],
  );

  /** Club members not already in the open list — the picker's candidates. */
  const availableMembers = useMemo(() => {
    if (!selectedList) return clubPlayers;
    const present = new Set(selectedList.players.map((p) => p.id));
    return clubPlayers.filter((p) => !present.has(p.id));
  }, [clubPlayers, selectedList]);

  /** Candidates narrowed by the picker's search box. */
  const filteredMembers = useMemo(() => {
    const q = memberQuery.trim().toLowerCase();
    if (!q) return availableMembers;
    return availableMembers.filter((p) => p.name.toLowerCase().includes(q));
  }, [availableMembers, memberQuery]);

  const pendingMember = selectedList?.players.find(
    (p) => p.id === pendingMemberId,
  );
  const pendingDeletionList = lists.find((l) => l.id === pendingListDeletion);

  // ── Navigation ────────────────────────────────────────────────────
  const openList = (id: string) => setSelectedId(id);
  const backToLists = () => setSelectedId(null);

  // ── Create / rename via the shared name dialog ────────────────────
  const startCreateList = () => {
    setDraftName("");
    setNameDialogMode("create");
  };
  const startRenameList = () => {
    if (!selectedList) return;
    setDraftName(selectedList.name);
    setNameDialogMode("rename");
  };
  const closeNameDialog = () => setNameDialogMode(null);

  const confirmNameDialog = () => {
    const name = draftName.trim();
    if (!name) return;

    if (nameDialogMode === "create") {
      const id = `roster-${Date.now()}`;
      setLists((prev) => [{ id, name, players: [] }, ...prev]);
      setSelectedId(id);
      setNameDialogMode(null);
      // Jump straight into adding members for the fresh list.
      setCheckedIds([]);
      setMemberQuery("");
      setPickerOpen(true);
      return;
    }

    if (nameDialogMode === "rename" && selectedId) {
      setLists((prev) =>
        prev.map((l) => (l.id === selectedId ? { ...l, name } : l)),
      );
    }
    setNameDialogMode(null);
  };

  // ── Add members ───────────────────────────────────────────────────
  const openPicker = () => {
    setCheckedIds([]);
    setMemberQuery("");
    setPickerOpen(true);
  };
  const togglePicked = (id: string) =>
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  const confirmAddMembers = () => {
    if (!selectedId || checkedIds.length === 0) return;
    const additions: RosterPlayer[] = clubPlayers.filter((p) =>
      checkedIds.includes(p.id),
    );
    setLists((prev) =>
      prev.map((l) =>
        l.id === selectedId
          ? { ...l, players: [...l.players, ...additions] }
          : l,
      ),
    );
    setPickerOpen(false);
    setCheckedIds([]);
  };

  // ── Remove a member (with confirmation) ───────────────────────────
  const requestRemoveMember = (id: string) => setPendingMemberId(id);
  const cancelRemoveMember = () => setPendingMemberId(null);
  const confirmRemoveMember = () => {
    if (!selectedId || !pendingMemberId) return;
    setLists((prev) =>
      prev.map((l) =>
        l.id === selectedId
          ? { ...l, players: l.players.filter((p) => p.id !== pendingMemberId) }
          : l,
      ),
    );
    setPendingMemberId(null);
  };

  // ── Delete a whole list (with confirmation) ───────────────────────
  const requestDeleteList = (id: string) => setPendingListDeletion(id);
  const cancelDeleteList = () => setPendingListDeletion(null);
  const confirmDeleteList = () => {
    if (!pendingListDeletion) return;
    setLists((prev) => prev.filter((l) => l.id !== pendingListDeletion));
    if (selectedId === pendingListDeletion) setSelectedId(null);
    setPendingListDeletion(null);
  };

  return {
    lists,
    loading,
    selectedList,
    openList,
    backToLists,

    nameDialogMode,
    draftName,
    setDraftName,
    startCreateList,
    startRenameList,
    closeNameDialog,
    confirmNameDialog,

    availableMembers,
    filteredMembers,
    memberQuery,
    setMemberQuery,
    pickerOpen,
    setPickerOpen,
    checkedIds,
    openPicker,
    togglePicked,
    confirmAddMembers,

    pendingMember,
    requestRemoveMember,
    cancelRemoveMember,
    confirmRemoveMember,

    pendingDeletionList,
    requestDeleteList,
    cancelDeleteList,
    confirmDeleteList,
  };
}
