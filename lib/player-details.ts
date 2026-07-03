import {
  ageFromBirthDate,
  type ChessTitle,
  type Gender,
  type PlayerFormValues,
} from "@/lib/player-form";

/**
 * The roster data only carries the columns the tables show (name, age,
 * ratings, …). The "edit player" modal needs the full personal/player record,
 * which we don't have for the sample data — so we invent the missing fields.
 *
 * Everything here is derived from a stable hash of the player's name, so the
 * same player always gets the same invented details across reloads and across
 * both tables (players page + dashboard).
 */
export interface PlayerDetails {
  firstName: string;
  lastName: string;
  gender: Gender;
  birthDate: string; // ISO yyyy-mm-dd
  idNumber: string;
  email: string;
  address: string;
  notes: string;
  israeliPlayerId: string;
  fidePlayerId: string;
  title: ChessTitle | "";
}

/** The roster columns we derive the invented details from. */
interface PlayerSeed {
  name: string;
  age: number;
  israeliRating: number;
  fideRating: number | null;
}

/** A small, stable string hash (djb2-ish) with a seed for independent draws. */
function hash(str: string, seed: number): number {
  let h = seed;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

const STREETS = [
  "הרצל",
  "ויצמן",
  "בן גוריון",
  "ז'בוטינסקי",
  "רוטשילד",
  "ביאליק",
  "הנשיא",
  "סוקולוב",
];

const CITIES = [
  "תל אביב",
  "חיפה",
  "ירושלים",
  "באר שבע",
  "נתניה",
  "רעננה",
  "חולון",
  "פתח תקווה",
];

/** Title by Israeli rating — only the stronger players carry one. */
function titleForRating(rating: number): ChessTitle | "" {
  if (rating >= 2200) return "IM";
  if (rating >= 2000) return "FM";
  if (rating >= 1800) return "CM";
  return "";
}

/** A 9-digit pseudo-ID string from a hash. */
function nineDigits(h: number): string {
  return String(100000000 + (h % 900000000));
}

/** Invent the full personal/player record for a roster entry. */
export function deriveDetails(seed: PlayerSeed): PlayerDetails {
  const h = hash(seed.name, 5381);
  const h2 = hash(seed.name, 7919);

  const [firstName, ...rest] = seed.name.trim().split(" ");
  const lastName = rest.join(" ");

  const birthYear = new Date().getFullYear() - seed.age;
  const month = (h % 12) + 1;
  const day = (h2 % 28) + 1;
  const birthDate = `${birthYear}-${String(month).padStart(2, "0")}-${String(
    day,
  ).padStart(2, "0")}`;

  const street = STREETS[h % STREETS.length];
  const city = CITIES[h2 % CITIES.length];

  return {
    firstName,
    lastName,
    gender: h % 2 === 0 ? "זכר" : "נקבה",
    birthDate,
    idNumber: nineDigits(h),
    email: `player${1000 + (h % 9000)}@gmail.com`,
    address: `${street} ${(h % 120) + 1}, ${city}`,
    notes: "",
    israeliPlayerId: String(20000 + (h % 80000)),
    fidePlayerId: seed.fideRating != null ? String(2800000 + (h2 % 200000)) : "",
    title: titleForRating(seed.israeliRating),
  };
}

/** Anything carrying the roster columns plus the invented detail fields. */
type PlayerLike = PlayerSeed &
  PlayerDetails & {
    id?: string;
    grade: string;
    phone: string;
    ratingUpdatedAt?: string;
  };

/** Build the modal's form values from a fully-detailed player record. */
export function playerFormValuesFor(p: PlayerLike): PlayerFormValues {
  return {
    id: p.id,
    firstName: p.firstName,
    lastName: p.lastName,
    gender: p.gender,
    birthDate: p.birthDate,
    grade: p.grade,
    idNumber: p.idNumber,
    phone: p.phone,
    email: p.email,
    address: p.address,
    notes: p.notes,
    israeliPlayerId: p.israeliPlayerId,
    israeliRating: String(p.israeliRating),
    fidePlayerId: p.fidePlayerId,
    fideRating: p.fideRating != null ? String(p.fideRating) : "",
    title: p.title,
    ratingUpdatedAt: p.ratingUpdatedAt ?? "",
  };
}

/** Split an ISO yyyy-mm-dd into the modal's three dropdown parts. */
export function birthPartsFromIso(birthDate: string): {
  year: string;
  month: string;
  day: string;
} {
  if (!birthDate || ageFromBirthDate(birthDate) === null) {
    return { year: "", month: "", day: "" };
  }
  const [year, month, day] = birthDate.split("-");
  return { year, month: String(Number(month)), day: String(Number(day)) };
}
