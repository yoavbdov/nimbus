"use client";

import { useMemo, useState } from "react";
import { buildRatingPlayers } from "@/lib/rating-data";
import { useCollection } from "@/lib/firebase/useCollection";
import type { Player } from "@/lib/players-data";

/**
 * Drives the bulk rating-update tool: holding the new rating typed for each
 * player, tracking the Excel file dropped back in, and the confirm dialog.
 * Everything is in-memory for the session — confirming just clears the drafts.
 * Any row with a new rating filled in is what gets "updated" on confirm.
 */
export function useRatingUpdate() {
  // The roster is read live from Firestore, not from a static sample.
  const { data: records } = useCollection<Player>("players");
  const players = useMemo(() => buildRatingPlayers(records), [records]);

  // New rating typed per player id (empty string = nothing entered).
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [query, setQuery] = useState("");

  // Excel modal: both steps (export → fill & drop back) shown side by side.
  const [excelOpen, setExcelOpen] = useState(false);
  const [droppedFileName, setDroppedFileName] = useState<string | null>(null);

  /** Players shown in the table, narrowed by the name search box. */
  const visiblePlayers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return players;
    return players.filter((p) => p.name.toLowerCase().includes(q));
  }, [players, query]);

  const setDraft = (id: string, value: string) => {
    // A rating rating is digits only, up to 4 of them.
    const clean = value.replace(/\D/g, "").slice(0, 4);
    setDrafts((prev) => ({ ...prev, [id]: clean }));
  };

  /** How many rows have a new rating filled in — these are the ones updated. */
  const filledCount = useMemo(
    () => Object.values(drafts).filter((v) => v.trim() !== "").length,
    [drafts],
  );
  const hasChanges = filledCount > 0;

  // ── Confirm + apply (mock) ────────────────────────────────────────
  const requestConfirm = () => {
    if (hasChanges) setConfirmOpen(true);
  };
  const cancelConfirm = () => setConfirmOpen(false);
  const confirmUpdate = () => {
    // No real persistence yet — clear the drafts and close.
    setDrafts({});
    setConfirmOpen(false);
  };

  // ── Excel modal flow (UI only for now) ────────────────────────────
  const openExcelModal = () => {
    setDroppedFileName(null);
    setExcelOpen(true);
  };
  const closeExcelModal = () => setExcelOpen(false);

  const exportToExcel = () => {
    // Placeholder — wire up real Excel export here later.
  };
  const handleFileDrop = (file: File) => setDroppedFileName(file.name);
  const clearDroppedFile = () => setDroppedFileName(null);

  /** Step 2 confirm: would apply the uploaded sheet. Mock — just close. */
  const confirmExcelImport = () => {
    setExcelOpen(false);
  };

  return {
    players,
    visiblePlayers,
    query,
    setQuery,
    drafts,
    setDraft,
    filledCount,
    hasChanges,

    confirmOpen,
    requestConfirm,
    cancelConfirm,
    confirmUpdate,

    excelOpen,
    openExcelModal,
    closeExcelModal,
    exportToExcel,
    droppedFileName,
    handleFileDrop,
    clearDroppedFile,
    confirmExcelImport,
  };
}
