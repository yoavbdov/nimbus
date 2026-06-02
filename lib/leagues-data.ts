export type LeagueCategory = "בוגרים" | "נוער" | "נשים";

// League ranks per category, ordered from lowest to highest importance.
export const leagueRanksByCategory: Record<LeagueCategory, string[]> = {
  בוגרים: ["ליגה ג׳", "ליגה ב׳", "ליגה א׳", "ארצית", "לאומית"],
  נוער: ["מחוזית", "ארצית", "לאומית"],
  נשים: ["ארצית", "עילית"],
};

export interface LeaguePlayer {
  id: string;
  name: string;
  rating: number;
}

export interface LeagueTeam {
  id: string;
  category: LeagueCategory;
  rank: string;
  name: string;
  notes: string;
  players: LeaguePlayer[];
}

function players(...entries: [string, number][]): LeaguePlayer[] {
  return entries.map(([name, rating], i) => ({
    id: `${name}-${i}`,
    name,
    rating,
  }));
}

export const leagueCategories: LeagueCategory[] = ["בוגרים", "נוער", "נשים"];

export const leagueTeams: LeagueTeam[] = [
  // ── בוגרים ─────────────────────────────────────────────
  {
    id: "lt-1",
    category: "בוגרים",
    rank: "לאומית",
    name: "נבחרת המאסטרים",
    notes: "אלופי העונה הקודמת",
    players: players(
      ["נדב אורן", 2410],
      ["עידן הראל", 2360],
      ["גיא רביב", 2295],
      ["רון פרידמן", 2180],
    ),
  },
  {
    id: "lt-2",
    category: "בוגרים",
    rank: "ארצית",
    name: "סוסי הברזל",
    notes: "מתאמנים בימי שלישי וחמישי",
    players: players(
      ["אבי לוי", 2120],
      ["יואב דביר", 1980],
      ["תומר שגב", 1905],
    ),
  },
  {
    id: "lt-3",
    category: "בוגרים",
    rank: "ליגה א׳",
    name: "פתיחת המלך",
    notes: "",
    players: players(
      ["דני כספי", 1740],
      ["אורי נחום", 1690],
      ["שחר בן דוד", 1610],
    ),
  },
  {
    id: "lt-4",
    category: "בוגרים",
    rank: "ליגה ב׳",
    name: "רגלי החייל",
    notes: "קבוצה חדשה העונה",
    players: players(
      ["מתן זיו", 1480],
      ["יונתן קרן", 1420],
    ),
  },
  {
    id: "lt-5",
    category: "בוגרים",
    rank: "ליגה ג׳",
    name: "מתחילים שאפתנים",
    notes: "",
    players: players(
      ["איתי גל", 1210],
      ["נמרוד פז", 1150],
      ["עומר טל", 1080],
    ),
  },

  // ── נוער ───────────────────────────────────────────────
  {
    id: "lt-6",
    category: "נוער",
    rank: "לאומית",
    name: "כוכבי העתיד",
    notes: "מועמדים לנבחרת הלאומית",
    players: players(
      ["נועם ברק", 2080],
      ["יהל שמש", 1960],
      ["ליאור אדם", 1885],
    ),
  },
  {
    id: "lt-7",
    category: "נוער",
    rank: "ארצית",
    name: "אריות צעירים",
    notes: "",
    players: players(
      ["רותם חן", 1690],
      ["אלון מור", 1620],
      ["גלעד שני", 1555],
    ),
  },
  {
    id: "lt-8",
    category: "נוער",
    rank: "מחוזית",
    name: "פרשי המחוז",
    notes: "אימון נוסף בימי שישי",
    players: players(
      ["דור אביב", 1340],
      ["שי לביא", 1280],
    ),
  },

  // ── נשים ───────────────────────────────────────────────
  {
    id: "lt-9",
    category: "נשים",
    rank: "עילית",
    name: "מלכות הלוח",
    notes: "אלופות המדינה",
    players: players(
      ["דנה אביב", 2240],
      ["שירה גל", 2150],
      ["מירב כהן", 2055],
    ),
  },
  {
    id: "lt-10",
    category: "נשים",
    rank: "ארצית",
    name: "נסיכות הצריח",
    notes: "",
    players: players(
      ["נועה ברק", 1810],
      ["טל הרפז", 1720],
      ["יעל רום", 1665],
    ),
  },
];
