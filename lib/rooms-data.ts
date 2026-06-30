export interface Room {
  id: string;
  name: string;
  capacity: number;
  equipment: string[];
}

export interface Equipment {
  id: string;
  name: string;
  quantity: number;
  notes: string;
}

export const OUTSIDE_CLUB_ROOM = "מחוץ למועדון";

export const rooms: Room[] = [
  { id: "room-1", name: "אולם ראשי", capacity: 40, equipment: ["שעוני שח", "לוחות הדגמה", "מקרן"] },
  { id: "room-2", name: "חדר אימונים א'", capacity: 16, equipment: ["שעוני שח", "לוחות הדגמה"] },
  { id: "room-3", name: "חדר אימונים ב'", capacity: 12, equipment: ["סטים מגנטיים"] },
  { id: "room-4", name: "חדר ישיבות", capacity: 8, equipment: ["מקרן", "מסך"] },
  { id: "room-5", name: "חדר טורנירים", capacity: 32, equipment: ["שעוני שח", "לוחות תחרות"] },
  { id: "room-6", name: "חדר ילדים", capacity: 20, equipment: ["סטים מגנטיים", "לוחות הדגמה"] },
  { id: "room-7", name: "חדר מתחילים", capacity: 18, equipment: ["סטים פלסטיק", "לוחות הדגמה"] },
  { id: "room-8", name: "חדר מתקדמים", capacity: 14, equipment: ["שעוני שח", "מחשבים"] },
  { id: "room-9", name: "ספרייה", capacity: 10, equipment: ["ספרי שח", "מחשבים"] },
  { id: "room-10", name: "חדר אנליזה", capacity: 6, equipment: ["מחשבים", "מסך"] },
  { id: "room-11", name: "אולם משני", capacity: 30, equipment: ["שעוני שח", "לוחות הדגמה"] },
  { id: "room-12", name: "חדר הרצאות", capacity: 50, equipment: ["מקרן", "מסך", "מערכת שמע"] },
  { id: "room-13", name: "חדר סדנאות", capacity: 22, equipment: ["לוחות הדגמה", "סטים מגנטיים"] },
  { id: "room-14", name: "חדר אונליין", capacity: 12, equipment: ["מחשבים", "מצלמות רשת"] },
  { id: "room-15", name: "חדר שיפוט", capacity: 6, equipment: ["שעוני שח", "מחשבים"] },
  { id: "room-16", name: "חדר נוער", capacity: 24, equipment: ["סטים פלסטיק", "שעוני שח"] },
  { id: "room-17", name: "חדר בוגרים", capacity: 18, equipment: ["שעוני שח", "לוחות הדגמה"] },
  { id: "room-18", name: "פינת קפה", capacity: 15, equipment: ["שולחנות", "כיסאות"] },
  { id: "room-19", name: "חדר אחסון", capacity: 4, equipment: ["מדפים", "ארגזים"] },
  { id: "room-20", name: "חדר צוות", capacity: 8, equipment: ["מחשבים", "מסך"] },
  { id: "room-21", name: "אולם אירועים", capacity: 60, equipment: ["מקרן", "מערכת שמע", "במה"] },
  { id: "room-22", name: "חדר אימון אישי", capacity: 4, equipment: ["שעון שח", "סט מגנטי"] },
  { id: "room-23", name: "חדר סימולטנים", capacity: 28, equipment: ["לוחות תחרות", "שעוני שח"] },
  { id: "room-24", name: "חדר וידאו", capacity: 12, equipment: ["מקרן", "מסך", "מצלמות"] },
  { id: "room-25", name: "מרפסת חיצונית", capacity: 16, equipment: ["שולחנות חוץ", "סטים פלסטיק"] },
];

export const equipment: Equipment[] = [
  { id: "equipment-1", name: "שעוני שח דיגיטליים", quantity: 30, notes: "5 דורשים סוללות" },
  { id: "equipment-2", name: "סטים מגנטיים", quantity: 20, notes: "—" },
  { id: "equipment-3", name: "לוחות הדגמה", quantity: 6, notes: "אחד פגום" },
  { id: "equipment-4", name: "מקרנים", quantity: 2, notes: "באולם ובחדר ישיבות" },
  { id: "equipment-5", name: "שעוני שח אנלוגיים", quantity: 15, notes: "מילואים" },
  { id: "equipment-6", name: "סטים פלסטיק", quantity: 45, notes: "לחוגי ילדים" },
  { id: "equipment-7", name: "לוחות תחרות", quantity: 25, notes: "—" },
  { id: "equipment-8", name: "כלים מוזהבים מהודרים", quantity: 8, notes: "לאירועים" },
  { id: "equipment-9", name: "מחשבים ניידים", quantity: 12, notes: "2 בתיקון" },
  { id: "equipment-10", name: "מסכי הקרנה", quantity: 4, notes: "—" },
  { id: "equipment-11", name: "מערכות שמע", quantity: 3, notes: "אולם והרצאות" },
  { id: "equipment-12", name: "מצלמות רשת", quantity: 10, notes: "לשידורים" },
  { id: "equipment-13", name: "ספרי שח", quantity: 120, notes: "בספרייה" },
  { id: "equipment-14", name: "כרטיסי דירוג", quantity: 200, notes: "—" },
  { id: "equipment-15", name: "טפסי רישום", quantity: 300, notes: "מלאי משרד" },
  { id: "equipment-16", name: "שולחנות מתקפלים", quantity: 40, notes: "3 רעועים" },
  { id: "equipment-17", name: "כיסאות", quantity: 150, notes: "—" },
  { id: "equipment-18", name: "מחיצות חלל", quantity: 6, notes: "להפרדת אזורים" },
  { id: "equipment-19", name: "עמדות טעינה", quantity: 5, notes: "לשעונים דיגיטליים" },
  { id: "equipment-20", name: "סוללות AA", quantity: 80, notes: "מתכלה" },
  { id: "equipment-21", name: "גביעים", quantity: 35, notes: "לטורנירים" },
  { id: "equipment-22", name: "מדליות", quantity: 100, notes: "—" },
  { id: "equipment-23", name: "באנרים ושילוט", quantity: 12, notes: "לאירועים" },
  { id: "equipment-24", name: "ערכות עזרה ראשונה", quantity: 4, notes: "פזורות במבנה" },
  { id: "equipment-25", name: "מטפים", quantity: 6, notes: "בתוקף עד 2027" },
];

export function filterRooms(query: string): Room[] {
  const q = query.trim().toLowerCase();
  if (!q) return rooms;
  return rooms.filter(
    (r) =>
      r.name.toLowerCase().includes(q) ||
      r.equipment.some((e) => e.toLowerCase().includes(q)),
  );
}

export function filterEquipment(query: string): Equipment[] {
  const q = query.trim().toLowerCase();
  if (!q) return equipment;
  return equipment.filter(
    (e) =>
      e.name.toLowerCase().includes(q) || e.notes.toLowerCase().includes(q),
  );
}
