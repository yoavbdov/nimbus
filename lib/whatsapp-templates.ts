import { tournaments } from "@/lib/tournaments-data";
import { courses } from "@/lib/courses-data";

// ── WhatsApp invitations ───────────────────────────────────────────
// Turns a tournament / class into a ready-to-send WhatsApp invitation,
// driven by an editable notes template with placeholders.

export type InvitableKind = "תחרות" | "חוג";

export interface InvitableCourse {
  id: string;
  kind: InvitableKind;
  name: string;
  date: string;
  daysLabel: string;
  /** The course's known weekly time window, e.g. "17:00–18:30". */
  timeRange: string;
  /** Rating range (תחרות) or rating range (חוג). */
  rangeLabel: string;
  room: string;
  /** Extra line — judge + rounds for a tournament, coach for a class. */
  detailLabel: string;
}

/** Stable little hash so each course gets a consistent time window. */
function hash(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function timeRange(id: string): string {
  const start = 14 + (hash(id) % 5); // 14:00–18:00
  const half = hash(id) % 2 ? "30" : "00";
  return `${String(start).padStart(2, "0")}:${half}–${String(start + 1).padStart(2, "0")}:${half}`;
}

const invitableTournaments: InvitableCourse[] = tournaments
  .filter((t) => t.status !== "הסתיימה")
  .map((t) => ({
    id: t.id,
    kind: "תחרות",
    name: t.name,
    date: t.nextDate,
    daysLabel: t.days.join(", "),
    timeRange: timeRange(t.id),
    rangeLabel: `${t.ratingMin}–${t.ratingMax}`,
    room: t.room,
    detailLabel: `שופט: ${t.judge} · ${t.rounds} סיבובים`,
  }));

const invitableClasses: InvitableCourse[] = courses
  .filter((a) => a.status !== "לא פעיל")
  .map((a) => ({
    id: a.id,
    kind: "חוג",
    name: a.name,
    date: a.nextDate,
    daysLabel: a.days.join(", "),
    timeRange: timeRange(a.id),
    rangeLabel: `${a.ratingMin}–${a.ratingMax}`,
    room: a.room,
    detailLabel: `מדריך: ${a.coach}`,
  }));

export const invitableCourses: InvitableCourse[] = [
  ...invitableTournaments,
  ...invitableClasses,
];

// ── Notes templates ────────────────────────────────────────────────
// Placeholders are replaced when the message is built.

export interface NotesTemplate {
  id: string;
  name: string;
  body: string;
}

export const PLACEHOLDERS = [
  "{שם}",
  "{תאריך}",
  "{ימים}",
  "{שעות}",
  "{טווח}",
  "{חדר}",
] as const;

export const defaultNotesTemplates: NotesTemplate[] = [
  {
    id: "tpl-tournament",
    name: "הזמנה לתחרות",
    body: 'שלום הורים יקרים! 🏆\nאנו שמחים להזמין את הילדים לתחרות "{שם}" שתתקיים בתאריך {תאריך} בשעות {שעות}.\nטווח מד״כ: {טווח} | מיקום: {חדר}.\nנשמח לראותכם!',
  },
  {
    id: "tpl-class",
    name: "תזכורת לחוג",
    body: 'היי! ♟️\nתזכורת לחוג "{שם}" המתקיים בימים {ימים} בשעות {שעות}, בחדר {חדר}.\nנתראה!',
  },
];

/** A small palette of WhatsApp-friendly emojis for the message editor. */
export const WHATSAPP_EMOJIS = [
  "♟️", "🏆", "🥇", "🎉", "🎊", "👋", "📣", "📅",
  "⏰", "📍", "✅", "❗", "🔥", "💪", "⭐", "🌟",
  "👏", "🙌", "❤️", "🤝", "🎯", "📝", "😊", "🙏",
] as const;

/** Fills a template body with the course's details. */
export function buildInvitationMessage(
  course: InvitableCourse,
  templateBody: string,
): string {
  return templateBody
    .replaceAll("{שם}", course.name)
    .replaceAll("{תאריך}", course.date)
    .replaceAll("{ימים}", course.daysLabel)
    .replaceAll("{שעות}", course.timeRange)
    .replaceAll("{טווח}", course.rangeLabel)
    .replaceAll("{חדר}", course.room);
}

/** Opens WhatsApp with the message text pre-filled (manual send). */
export function openWhatsApp(message: string) {
  const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}
