import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const sessions = [
  {
    time: "16:00–18:00",
    type: "חוג",
    name: "אימון קבוצתי",
    location: "אולם תחרויות",
    coach: "אמיר ביטון",
    enrolled: 3,
    capacity: 20,
  },
];

const today = "יום חמישי, 21 במאי";

export function TodaySessions() {
  return (
    <Card className="rounded-xl shadow-none overflow-hidden">
      <CardHeader className="px-5 py-4 border-b border-border space-y-0.5">
        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          מפגשים היום - {today}
        </p>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table className="min-w-150">
            <TableHeader className="bg-muted/40">
              <TableRow className="border-b border-border hover:bg-transparent">
                <TableHead className="px-4 py-3 text-start">שעה</TableHead>
                <TableHead className="px-4 py-3 text-start">סוג</TableHead>
                <TableHead className="px-4 py-3 text-start">שם</TableHead>
                <TableHead className="px-4 py-3 text-start">
                  מיקום / מדריך
                </TableHead>
                <TableHead className="px-4 py-3 text-start">משתתפים</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="p-12 text-center text-sm text-muted-foreground"
                  >
                    אין מפגשים מתוכננים להיום
                  </TableCell>
                </TableRow>
              ) : (
                sessions.map((s, i) => (
                  <TableRow
                    key={i}
                    className="border-b border-border hover:bg-muted/30 transition-colors duration-100"
                  >
                    <TableCell className="px-4 py-3 font-mono tabular-nums whitespace-nowrap">
                      {s.time}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <Badge variant="secondary">{s.type}</Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 font-medium">
                      {s.name}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-muted-foreground">
                      {s.location} | {s.coach}
                    </TableCell>
                    <TableCell className="px-4 py-3 font-mono tabular-nums">
                      {s.enrolled} / {s.capacity}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
