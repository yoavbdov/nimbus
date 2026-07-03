export type Gender = "זכר" | "נקבה";

export type ChessTitle =
  | "WCM"
  | "CM"
  | "NM"
  | "FM"
  | "WFM"
  | "IM"
  | "WIM"
  | "GM"
  | "WGM";


export const CHESS_TITLES: ChessTitle[] = [
  "WCM",
  "CM",
  "NM",
  "FM",
  "WFM",
  "IM",
  "WIM",
  "GM",
  "WGM"
];

/** Shape of the "add player" form. Empty strings = not filled yet. */
export interface PlayerFormValues {
  /** Set when editing an existing player; drives the Firestore save. */
  id?: string;
  // Tab 1 — מידע אישי
  firstName: string;
  lastName: string;
  gender: Gender | "";
  birthDate: string; // ISO yyyy-mm-dd
  grade: string;
  idNumber: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  // Tab 2 — פרטי שחקן
  israeliPlayerId: string;
  israeliRating: string;
  fidePlayerId: string;
  fideRating: string;
  title: ChessTitle | "";
  /** Read-only — when the rating was last updated (dd.MM.yyyy). "" for new players. */
  ratingUpdatedAt: string;
}

export const EMPTY_PLAYER_FORM: PlayerFormValues = {
  firstName: "",
  lastName: "",
  gender: "",
  birthDate: "",
  grade: "",
  idNumber: "",
  phone: "",
  email: "",
  address: "",
  notes: "",
  israeliPlayerId: "",
  israeliRating: "",
  fidePlayerId: "",
  fideRating: "",
  title: "",
  ratingUpdatedAt: "",
};

const GRADE_LETTERS = [
  "א",
  "ב",
  "ג",
  "ד",
  "ה",
  "ו",
  "ז",
  "ח",
  "ט",
  "י",
  "יא",
  "יב",
];

/** All grade options, in order, for the manual override dropdown. */
export const GRADE_OPTIONS: string[] = [
  "גן",
  ...GRADE_LETTERS.map((letter) => `כיתה ${letter}`),
  "מבוגר",
];

export const HEBREW_MONTHS = [
  "ינואר",
  "פברואר",
  "מרץ",
  "אפריל",
  "מאי",
  "יוני",
  "יולי",
  "אוגוסט",
  "ספטמבר",
  "אוקטובר",
  "נובמבר",
  "דצמבר",
];

export interface BirthDateParts {
  year: string;
  month: string; // "1"–"12"
  day: string; // "1"–"31"
}

export const EMPTY_BIRTH_PARTS: BirthDateParts = { year: "", month: "", day: "" };

/** Years offered in the dropdown, newest first, down to 1900. */
export function birthYearOptions(today = new Date()): number[] {
  const current = today.getFullYear();
  const years: number[] = [];
  for (let year = current; year >= 1900; year--) years.push(year);
  return years;
}

/** Number of days in the given month, accounting for the year when known. */
export function daysInMonth(year: string, month: string): number {
  const m = Number(month);
  if (!m) return 31;
  const y = Number(year) || 2000; // leap-safe default for Feb when year unset
  return new Date(y, m, 0).getDate();
}

/** ISO yyyy-mm-dd from the three parts, or "" while any part is missing. */
export function isoFromBirthParts({ year, month, day }: BirthDateParts): string {
  if (!year || !month || !day) return "";
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

/** Whole-years age on `today` for someone born on `birthDate`. */
export function ageFromBirthDate(birthDate: string, today = new Date()): number | null {
  if (!birthDate) return null;
  const born = new Date(birthDate);
  if (Number.isNaN(born.getTime())) return null;
  let age = today.getFullYear() - born.getFullYear();
  const monthDiff = today.getMonth() - born.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < born.getDate())) {
    age -= 1;
  }
  return age;
}

/** Grade label derived from age: <6 → גן, 6→כיתה א … 17→כיתה יב, 18+ → מבוגר. */
export function gradeForAge(age: number): string {
  if (age < 6) return "גן";
  if (age >= 18) return "מבוגר";
  return `כיתה ${GRADE_LETTERS[age - 6]}`;
}

/** Auto grade for a birth date, or "" when the date isn't usable yet. */
export function gradeForBirthDate(birthDate: string, today = new Date()): string {
  const age = ageFromBirthDate(birthDate, today);
  if (age === null || age < 0) return "";
  return gradeForAge(age);
}

/** The four starred fields must be filled for the form to be submittable. */
export function isPlayerFormValid(values: PlayerFormValues): boolean {
  return (
    values.firstName.trim() !== "" &&
    values.lastName.trim() !== "" &&
    values.gender !== "" &&
    values.birthDate !== ""
  );
}
