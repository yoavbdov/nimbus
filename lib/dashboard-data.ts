import type { RatingPlayer } from "@/hooks/dashboard/useRatingPlayersTable";
import type { Player } from "@/lib/players-data";
import { deriveDetails } from "@/lib/player-details";

/** Sample roster shown in the rating-distribution panel on the dashboard. */
export const ratingPlayers: RatingPlayer[] = [
  { name: "יוסי כהן", rating: 2100, birthYear: 2001 },
  { name: "יצחק לוי", rating: 2000, birthYear: 2012 },
  { name: "אברהם יוסף", rating: 1531, birthYear: 1961 },
  { name: "דוד מזרחי", rating: 1800, birthYear: 1995 },
  { name: "משה פרץ", rating: 1650, birthYear: 2005 },
  { name: "נועם שפירא", rating: 2250, birthYear: 1998 },
  { name: "אורי גולן", rating: 1920, birthYear: 2003 },
  { name: "תמיר בן-דוד", rating: 1780, birthYear: 2008 },
  { name: "רועי אלון", rating: 1430, birthYear: 1990 },
  { name: "עמית שלום", rating: 2050, birthYear: 2000 },
  { name: "גיל ברקוביץ'", rating: 1350, birthYear: 1975 },
  { name: "שי אברהם", rating: 1600, birthYear: 2010 },
  { name: "ליאור נחמן", rating: 1720, birthYear: 2006 },
  { name: "בן כץ", rating: 1480, birthYear: 1985 },
  { name: "עידן מור", rating: 1950, birthYear: 2002 },
  { name: "אלון ברון", rating: 1280, birthYear: 1970 },
  { name: "יהונתן פלד", rating: 1830, birthYear: 1999 },
  { name: "מתן זיו", rating: 1560, birthYear: 2007 },
  { name: "ניב שגיא", rating: 2180, birthYear: 1997 },
  { name: "עמיחי דקל", rating: 1410, birthYear: 1983 },
  { name: "רן הרפז", rating: 1690, birthYear: 2004 },
  { name: "טל ורד", rating: 1870, birthYear: 1996 },
  { name: "אבי שרון", rating: 1320, birthYear: 1968 },
  { name: "כרמל נוי", rating: 2020, birthYear: 2001 },
  { name: "שחר לפיד", rating: 1750, birthYear: 2009 },
  { name: "אדם פישר", rating: 1580, birthYear: 1993 },
  { name: "יובל גפן", rating: 1900, birthYear: 2000 },
  { name: "ארי בלום", rating: 1450, birthYear: 1980 },
  { name: "נתן אוחיון", rating: 1640, birthYear: 2011 },
  { name: "עמוס רביד", rating: 1990, birthYear: 1994 },
];

const CURRENT_YEAR = new Date().getFullYear();

/**
 * The rating roster as full `Player` objects, keyed by name, so the dashboard
 * can reuse the players availability modal. Only id/name drive that flow; the
 * rest is filled from the rating data for completeness.
 */
export const ratingPlayersAsPlayers: Player[] = ratingPlayers.map((p) => {
  const base = {
    id: p.name,
    name: p.name,
    age: CURRENT_YEAR - p.birthYear,
    grade: "",
    israeliRating: p.rating,
    fideRating: null,
    ratingUpdatedRecently: false,
    phone: "",
    clubs: [],
    tournaments: [],
    leagueTeam: null,
    status: "פעיל" as const,
  };
  return { ...base, ...deriveDetails(base), ratingUpdatedAt: "" };
});
