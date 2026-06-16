import { attendanceClasses } from "@/lib/attendance-data";

// ── Rosters ────────────────────────────────────────────────────────
// A roster is the list of players belonging to an activity. We reuse the
// attendance classes as the activities that carry player lists.

export interface RosterPlayer {
  id: string;
  name: string;
  rating: number;
}

export interface RosterActivity {
  id: string;
  name: string;
  players: RosterPlayer[];
}

export const rosterActivities: RosterActivity[] = attendanceClasses.map(
  (cls) => ({
    id: cls.id,
    name: cls.name,
    players: cls.students.map((s) => ({
      id: s.id,
      name: s.name,
      rating: s.rating,
    })),
  }),
);

/** A roster the user explicitly saved, kept in memory for this session. */
export interface SavedRoster {
  id: string;
  name: string;
  sourceName: string;
  players: RosterPlayer[];
}
