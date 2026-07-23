"use client";

import { useMemo } from "react";
import { useCollection } from "@/lib/firebase/useCollection";
import {
  toRosterPlayer,
  type RosterDoc,
  type SavedRoster,
} from "@/lib/rosters-data";
import type { Player } from "@/lib/players-data";
import type { RelationDoc } from "@/lib/relations-data";

export interface SavedRostersState {
  rosters: SavedRoster[];
  loading: boolean;
}

/**
 * Reads the saved player lists live: the `rosters` documents plus their
 * `player_roster` relations, projected against the live players collection.
 * Members are sorted by rating (highest first), and a player who no longer
 * exists simply drops out of the list.
 */
export function useSavedRosters(): SavedRostersState {
  const { data: rosterDocs, loading: rostersLoading } =
    useCollection<RosterDoc>("rosters");
  const { data: relations, loading: relationsLoading } =
    useCollection<RelationDoc>("relations");
  const { data: players, loading: playersLoading } =
    useCollection<Player>("players");

  const rosters = useMemo(() => {
    const playerById = new Map(players.map((p) => [p.id, p]));

    const memberIds = new Map<string, string[]>();
    for (const rel of relations) {
      if (rel.kind !== "player_roster") continue;
      const list = memberIds.get(rel.targetId);
      if (list) list.push(rel.subjectId);
      else memberIds.set(rel.targetId, [rel.subjectId]);
    }

    return rosterDocs
      .map((roster) => ({
        id: roster.id,
        name: roster.name,
        players: (memberIds.get(roster.id) ?? [])
          .map((id) => playerById.get(id))
          .filter((p): p is Player => p != null)
          .sort((a, b) => b.israeliRating - a.israeliRating)
          .map(toRosterPlayer),
      }))
      .sort((a, b) => a.name.localeCompare(b.name, "he"));
  }, [rosterDocs, relations, players]);

  return {
    rosters,
    loading: rostersLoading || relationsLoading || playersLoading,
  };
}
