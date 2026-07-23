import { useCallback } from "react";
import { addMonths, toISODate } from "@/lib/calendar";
import { useCollection } from "@/lib/firebase/useCollection";
import type { EventCategory } from "@/lib/schedule-data";
import {
  equipmentDemands,
  type EquipmentClaim,
  type EquipmentDemand,
} from "@/lib/equipment-conflicts";
import type { EquipmentLineValues } from "@/lib/course-form";
import type { SessionDoc } from "@/lib/sessions-data";
import type { RelationDoc } from "@/lib/relations-data";
import type { Equipment } from "@/lib/rooms-data";
import type { Course } from "@/lib/courses-data";
import type { Tournament } from "@/lib/tournaments-data";
import type { ClubEvent } from "@/lib/events-data";

/** The relation kinds that allocate equipment, and what each one holds it for. */
const ALLOCATION_CATEGORIES: Partial<Record<RelationDoc["kind"], EventCategory>> = {
  equipment_course: "חוג",
  equipment_tournament: "תחרות",
  equipment_event: "אירוע",
};

/** What the modal needs to know about its equipment, in one pass. */
export interface EquipmentCheck {
  /** Only the items that fall short — the warning banner's input. */
  shortages: EquipmentDemand[];
  /** equipmentId → units this activity can have at its tightest moment. */
  availability: Record<string, number>;
}

/**
 * Reads the live inventory (equipment + allocation relations + sessions) and
 * hands back a pure `check` that a create/edit modal calls with its equipment
 * lines and meetings, to learn how many units of each item it can actually have
 * and which ones fall short. Non-blocking: the result feeds a warning banner and
 * the per-line hint, both off the SAME number so they can't disagree. All
 * Firestore access stays here; the sweep in `lib/equipment-conflicts.ts` stays
 * data-only.
 */
export function useEquipmentConflicts() {
  const { data: sessions } = useCollection<SessionDoc>("sessions");
  const { data: relations } = useCollection<RelationDoc>("relations");
  const { data: equipment } = useCollection<Equipment>("equipment");
  const { data: courses } = useCollection<Course>("courses");
  const { data: tournaments } = useCollection<Tournament>("tournaments");
  const { data: events } = useCollection<ClubEvent>("events");

  const check = useCallback(
    (
      draftLines: EquipmentLineValues[],
      draftSessions: SessionDoc[],
      /** The edited activity, so its own allocation isn't counted against it. */
      draftParentId: string,
    ): EquipmentCheck => {
      // Active parents only — an archived activity holds nothing.
      const activeParents = new Set<string>([
        ...courses.filter((c) => c.status !== "ארכיון").map((c) => c.id),
        ...tournaments.filter((t) => t.status !== "ארכיון").map((t) => t.id),
        ...events.filter((e) => e.status !== "ארכיון").map((e) => e.id),
      ]);

      const inventory = new Map(equipment.map((e) => [e.id, e.quantity]));

      // The activity each session belongs to, so a holder's meetings are cheap.
      const sessionsByParent = new Map<string, SessionDoc[]>();
      for (const session of sessions) {
        const list = sessionsByParent.get(session.parentId);
        if (list) list.push(session);
        else sessionsByParent.set(session.parentId, [session]);
      }

      // Who holds how many of each item, minus the activity being edited.
      const claimsByItem = new Map<string, EquipmentClaim[]>();
      for (const rel of relations) {
        const category = ALLOCATION_CATEGORIES[rel.kind];
        if (!category) continue;
        if (rel.targetId === draftParentId) continue;
        if (!activeParents.has(rel.targetId)) continue;
        const quantity = rel.quantity ?? 0;
        if (quantity <= 0) continue;
        const claim: EquipmentClaim = {
          parentId: rel.targetId,
          title: rel.targetId,
          category,
          quantity,
        };
        const list = claimsByItem.get(rel.subjectId);
        if (list) list.push(claim);
        else claimsByItem.set(rel.subjectId, [claim]);
      }

      // Look a year ahead so future recurrences surface with a concrete date,
      // while open-ended series stay bounded.
      const now = new Date();
      const rangeStart = toISODate(now);
      const rangeEnd = toISODate(addMonths(now, 12));

      const demands = equipmentDemands(
        draftLines,
        draftSessions,
        (equipmentId) => inventory.get(equipmentId),
        (equipmentId) => claimsByItem.get(equipmentId) ?? [],
        (parentId) => sessionsByParent.get(parentId) ?? [],
        rangeStart,
        rangeEnd,
      );

      return {
        shortages: demands.filter((d) => d.missing > 0),
        availability: Object.fromEntries(
          demands.map((d) => [d.equipmentId, d.available]),
        ),
      };
    },
    [sessions, relations, equipment, courses, tournaments, events],
  );

  return { check };
}
