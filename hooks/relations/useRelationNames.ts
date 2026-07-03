import { useMemo } from "react";
import { useCollection } from "@/lib/firebase/useCollection";
import type { RelationDoc } from "@/lib/relations-data";

/**
 * Reads the `relations` junction collection live and projects it into per-subject
 * name lists, ready to merge onto coach / player view objects.
 *
 * Maps are kept SEPARATE per subject type because docs are keyed by name and a
 * coach and a player can share a name (e.g. "שירה גל") — merging them would
 * cross-contaminate. Since entity docs are keyed by their name, a relation's
 * `targetId` already IS the display name, so no id→name lookup is needed.
 */
export interface RelationNames {
  playerCourses: Map<string, string[]>;
  playerTournaments: Map<string, string[]>;
  playerLeague: Map<string, string>;
  coachCourses: Map<string, string[]>;
  coachTournaments: Map<string, string[]>;
  loading: boolean;
}

function push(map: Map<string, string[]>, key: string, value: string): void {
  const list = map.get(key);
  if (list) list.push(value);
  else map.set(key, [value]);
}

export function useRelationNames(): RelationNames {
  const { data: relations, loading } = useCollection<RelationDoc>("relations");

  return useMemo(() => {
    const playerCourses = new Map<string, string[]>();
    const playerTournaments = new Map<string, string[]>();
    const playerLeague = new Map<string, string>();
    const coachCourses = new Map<string, string[]>();
    const coachTournaments = new Map<string, string[]>();

    for (const rel of relations) {
      switch (rel.kind) {
        case "player_course":
          push(playerCourses, rel.subjectId, rel.targetId);
          break;
        case "player_tournament":
          push(playerTournaments, rel.subjectId, rel.targetId);
          break;
        case "player_league":
          playerLeague.set(rel.subjectId, rel.targetId);
          break;
        case "coach_course":
          push(coachCourses, rel.subjectId, rel.targetId);
          break;
        case "coach_tournament":
          push(coachTournaments, rel.subjectId, rel.targetId);
          break;
      }
    }

    return {
      playerCourses,
      playerTournaments,
      playerLeague,
      coachCourses,
      coachTournaments,
      loading,
    };
  }, [relations, loading]);
}
