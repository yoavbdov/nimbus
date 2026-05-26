import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
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
    <Card className="border-border/40 shadow-none rounded-lg overflow-hidden">
      <CardHeader className="px-4 py-3 border-b border-border/30 space-y-0">
        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
          מפגשים היום — {today}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea>
          <Table className="min-w-150">
            <TableHeader>
              <TableRow className="border-b border-border/30 hover:bg-transparent">
                <TableHead className="px-3 py-2 text-xs font-medium text-muted-foreground text-start">שעה</TableHead>
                <TableHead className="px-3 py-2 text-xs font-medium text-muted-foreground text-start">סוג</TableHead>
                <TableHead className="px-3 py-2 text-xs font-medium text-muted-foreground text-start">שם</TableHead>
                <TableHead className="px-3 py-2 text-xs font-medium text-muted-foreground text-start">מיקום / מדריך</TableHead>
                <TableHead className="px-3 py-2 text-xs font-medium text-muted-foreground text-start">משתתפים</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="p-10 text-center text-sm text-muted-foreground/60">
                    אין מפגשים מתוכננים להיום
                  </TableCell>
                </TableRow>
              ) : (
                sessions.map((s, i) => (
                  <TableRow
                    key={i}
                    className="border-b border-border/30 hover:bg-muted/30 transition-colors duration-75"
                  >
                    <TableCell className="px-3 py-2 text-sm font-mono tabular-nums whitespace-nowrap">
                      {s.time}
                    </TableCell>
                    <TableCell className="px-3 py-2">
                      <Badge
                        variant="secondary"
                        className="rounded-full px-1.5 py-0.5 text-xs font-medium bg-muted text-muted-foreground border border-border/40"
                      >
                        {s.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-3 py-2 text-sm text-foreground">
                      {s.name}
                    </TableCell>
                    <TableCell className="px-3 py-2 text-sm text-muted-foreground">
                      {s.location} · {s.coach}
                    </TableCell>
                    <TableCell className="px-3 py-2 text-sm font-mono tabular-nums text-muted-foreground">
                      {s.enrolled} / {s.capacity}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
