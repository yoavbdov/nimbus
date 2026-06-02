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

export const rooms: Room[] = [
  { id: "r1", name: "אולם ראשי", capacity: 40, equipment: ["שעוני שח", "לוחות הדגמה", "מקרן"] },
  { id: "r2", name: "חדר אימונים א'", capacity: 16, equipment: ["שעוני שח", "לוחות הדגמה"] },
  { id: "r3", name: "חדר אימונים ב'", capacity: 12, equipment: ["סטים מגנטיים"] },
  { id: "r4", name: "חדר ישיבות", capacity: 8, equipment: ["מקרן", "מסך"] },
  { id: "r5", name: "חדר טורנירים", capacity: 32, equipment: ["שעוני שח", "לוחות תחרות"] },
  { id: "r6", name: "חדר ילדים", capacity: 20, equipment: ["סטים מגנטיים", "לוחות הדגמה"] },
  { id: "r7", name: "חדר מתחילים", capacity: 18, equipment: ["סטים פלסטיק", "לוחות הדגמה"] },
  { id: "r8", name: "חדר מתקדמים", capacity: 14, equipment: ["שעוני שח", "מחשבים"] },
  { id: "r9", name: "ספרייה", capacity: 10, equipment: ["ספרי שח", "מחשבים"] },
  { id: "r10", name: "חדר אנליזה", capacity: 6, equipment: ["מחשבים", "מסך"] },
  { id: "r11", name: "אולם משני", capacity: 30, equipment: ["שעוני שח", "לוחות הדגמה"] },
  { id: "r12", name: "חדר הרצאות", capacity: 50, equipment: ["מקרן", "מסך", "מערכת שמע"] },
  { id: "r13", name: "חדר סדנאות", capacity: 22, equipment: ["לוחות הדגמה", "סטים מגנטיים"] },
  { id: "r14", name: "חדר אונליין", capacity: 12, equipment: ["מחשבים", "מצלמות רשת"] },
  { id: "r15", name: "חדר שיפוט", capacity: 6, equipment: ["שעוני שח", "מחשבים"] },
  { id: "r16", name: "חדר נוער", capacity: 24, equipment: ["סטים פלסטיק", "שעוני שח"] },
  { id: "r17", name: "חדר בוגרים", capacity: 18, equipment: ["שעוני שח", "לוחות הדגמה"] },
  { id: "r18", name: "פינת קפה", capacity: 15, equipment: ["שולחנות", "כיסאות"] },
  { id: "r19", name: "חדר אחסון", capacity: 4, equipment: ["מדפים", "ארגזים"] },
  { id: "r20", name: "חדר צוות", capacity: 8, equipment: ["מחשבים", "מסך"] },
  { id: "r21", name: "אולם אירועים", capacity: 60, equipment: ["מקרן", "מערכת שמע", "במה"] },
  { id: "r22", name: "חדר אימון אישי", capacity: 4, equipment: ["שעון שח", "סט מגנטי"] },
  { id: "r23", name: "חדר סימולטנים", capacity: 28, equipment: ["לוחות תחרות", "שעוני שח"] },
  { id: "r24", name: "חדר וידאו", capacity: 12, equipment: ["מקרן", "מסך", "מצלמות"] },
  { id: "r25", name: "מרפסת חיצונית", capacity: 16, equipment: ["שולחנות חוץ", "סטים פלסטיק"] },
];

export const equipment: Equipment[] = [
  { id: "e1", name: "שעוני שח דיגיטליים", quantity: 30, notes: "5 דורשים סוללות" },
  { id: "e2", name: "סטים מגנטיים", quantity: 20, notes: "—" },
  { id: "e3", name: "לוחות הדגמה", quantity: 6, notes: "אחד פגום" },
  { id: "e4", name: "מקרנים", quantity: 2, notes: "באולם ובחדר ישיבות" },
  { id: "e5", name: "שעוני שח אנלוגיים", quantity: 15, notes: "מילואים" },
  { id: "e6", name: "סטים פלסטיק", quantity: 45, notes: "לחוגי ילדים" },
  { id: "e7", name: "לוחות תחרות", quantity: 25, notes: "—" },
  { id: "e8", name: "כלים מוזהבים מהודרים", quantity: 8, notes: "לאירועים" },
  { id: "e9", name: "מחשבים ניידים", quantity: 12, notes: "2 בתיקון" },
  { id: "e10", name: "מסכי הקרנה", quantity: 4, notes: "—" },
  { id: "e11", name: "מערכות שמע", quantity: 3, notes: "אולם והרצאות" },
  { id: "e12", name: "מצלמות רשת", quantity: 10, notes: "לשידורים" },
  { id: "e13", name: "ספרי שח", quantity: 120, notes: "בספרייה" },
  { id: "e14", name: "כרטיסי דירוג", quantity: 200, notes: "—" },
  { id: "e15", name: "טפסי רישום", quantity: 300, notes: "מלאי משרד" },
  { id: "e16", name: "שולחנות מתקפלים", quantity: 40, notes: "3 רעועים" },
  { id: "e17", name: "כיסאות", quantity: 150, notes: "—" },
  { id: "e18", name: "מחיצות חלל", quantity: 6, notes: "להפרדת אזורים" },
  { id: "e19", name: "עמדות טעינה", quantity: 5, notes: "לשעונים דיגיטליים" },
  { id: "e20", name: "סוללות AA", quantity: 80, notes: "מתכלה" },
  { id: "e21", name: "גביעים", quantity: 35, notes: "לטורנירים" },
  { id: "e22", name: "מדליות", quantity: 100, notes: "—" },
  { id: "e23", name: "באנרים ושילוט", quantity: 12, notes: "לאירועים" },
  { id: "e24", name: "ערכות עזרה ראשונה", quantity: 4, notes: "פזורות במבנה" },
  { id: "e25", name: "מטפים", quantity: 6, notes: "בתוקף עד 2027" },
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
