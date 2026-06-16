"use client";

import { useMemo, useState } from "react";
import {
  rosterActivities,
  type SavedRoster,
} from "@/lib/rosters-data";

/**
 * Drives the rosters tool: choosing a source activity, saving its player
 * list, and exporting a saved list into another activity. All saving and
 * exporting is in-memory (mock data).
 */
export function useRosters() {
  const [sourceId, setSourceId] = useState<string>(rosterActivities[0]?.id ?? "");
  const [listName, setListName] = useState("");
  const [saved, setSaved] = useState<SavedRoster[]>([]);
  const [targetIds, setTargetIds] = useState<Record<string, string>>({});
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const source = useMemo(
    () => rosterActivities.find((a) => a.id === sourceId) ?? null,
    [sourceId],
  );

  const selectSource = (id: string) => {
    setSourceId(id);
    setExportNotice(null);
  };

  const saveCurrent = () => {
    if (!source) return;
    const name = listName.trim() || source.name;
    setSaved((prev) => [
      {
        id: `roster-${Date.now()}`,
        name,
        sourceName: source.name,
        players: source.players,
      },
      ...prev,
    ]);
    setListName("");
  };

  const removeSaved = (id: string) => {
    setSaved((prev) => prev.filter((r) => r.id !== id));
  };

  const setTarget = (rosterId: string, targetId: string) => {
    setTargetIds((prev) => ({ ...prev, [rosterId]: targetId }));
  };

  const exportToActivity = (roster: SavedRoster) => {
    const targetId = targetIds[roster.id];
    const target = rosterActivities.find((a) => a.id === targetId);
    if (!target) return;
    const names = roster.players.map((p) => p.name).join("\n");
    navigator.clipboard?.writeText(names).catch(() => {});
    setExportNotice(
      `הרשימה "${roster.name}" (${roster.players.length} שחקנים) יוצאה אל "${target.name}" והועתקה ללוח.`,
    );
  };

  return {
    activities: rosterActivities,
    sourceId,
    source,
    selectSource,
    listName,
    setListName,
    saved,
    saveCurrent,
    removeSaved,
    targetIds,
    setTarget,
    exportToActivity,
    exportNotice,
  };
}
