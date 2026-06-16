import { attendanceClasses } from "@/lib/attendance-data";
import { players } from "@/lib/players-data";

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

// ── Example saved rosters ──────────────────────────────────────────
// Pre-prepared player lists offered when adding people to an activity,
// event or tournament. Built from real players (matched by name) so the
// ids line up with the rest of the app.

/** Builds a roster from a list of player names, skipping any not found. */
function rosterFromNames(names: string[]): RosterPlayer[] {
  return names
    .map((name) => players.find((p) => p.name === name))
    .filter((p): p is (typeof players)[number] => p != null)
    .map((p) => ({ id: p.id, name: p.name, rating: p.israeliRating }));
}

export const exampleRosters: SavedRoster[] = [
  {
    id: "roster-beginners",
    name: "קבוצת מתחילים",
    sourceName: "רשימה מוכנה",
    players: rosterFromNames([
      "אורי גולן",
      "מיה שפירא",
      "נועם כץ",
      "עידן פרץ",
      "רון סעדון",
    ]),
  },
  {
    id: "roster-advanced",
    name: "קבוצת מתקדמים",
    sourceName: "רשימה מוכנה",
    players: rosterFromNames([
      "יובל דוד",
      "ליאור ברק",
      "איתי לוי",
      "דניאל כהן",
      "אלון גרין",
      "עומר אזולאי",
    ]),
  },
  {
    id: "roster-competitive",
    name: "נבחרת תחרותית",
    sourceName: "רשימה מוכנה",
    players: rosterFromNames([
      "תום שטרן",
      "אביב מור",
      "ירדן פרידמן",
      "שחר לביא",
      "אריאל נחום",
    ]),
  },
  {
    id: "roster-juniors",
    name: "מחזור צעירים",
    sourceName: "רשימה מוכנה",
    players: rosterFromNames([
      "יערה פלד",
      "גיל אבני",
      "הילה רוזן",
      "נדב שמש",
      "מאיה הרשקוביץ",
      "אופיר חדד",
    ]),
  },
  {
    id: "roster-league",
    name: "סגל ליגה",
    sourceName: "רשימה מוכנה",
    players: rosterFromNames([
      "יונתן ברגר",
      "אסף וקנין",
      "רועי שלום",
      "מתן יוסף",
      "אורן טל",
      "כרמל פינטו",
    ]),
  },
];
