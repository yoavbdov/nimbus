"use client";

import { motion } from "framer-motion";
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
    <Card className="tint-indigo glass shadow-depth-xl border-0 ring-0 rounded-3xl gap-0 py-0 overflow-hidden">
      <div className="h-1 tint-bar" />
      <CardHeader className="px-6 pt-5 pb-4 flex flex-col items-center space-y-0">
        <CardTitle className="text-base font-semibold tracking-wide tint-text text-center">
          מפגשים היום · {today}
        </CardTitle>
      </CardHeader>

      <CardContent className="px-4 pb-4">
        <div className="neu-inset rounded-2xl p-2">
          <ScrollArea>
            <Table className="min-w-150">
              <TableHeader>
                <TableRow className="border-b-0 hover:bg-transparent">
                  <TableHead className="px-4 py-3 text-[0.7rem] font-medium text-muted-foreground uppercase tracking-wider text-start">שעה</TableHead>
                  <TableHead className="px-4 py-3 text-[0.7rem] font-medium text-muted-foreground uppercase tracking-wider text-start">סוג</TableHead>
                  <TableHead className="px-4 py-3 text-[0.7rem] font-medium text-muted-foreground uppercase tracking-wider text-start">שם</TableHead>
                  <TableHead className="px-4 py-3 text-[0.7rem] font-medium text-muted-foreground uppercase tracking-wider text-start">מיקום / מדריך</TableHead>
                  <TableHead className="px-4 py-3 text-[0.7rem] font-medium text-muted-foreground uppercase tracking-wider text-start">משתתפים</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.length === 0 ? (
                  <TableRow className="border-0 hover:bg-transparent">
                    <TableCell colSpan={5} className="p-10 text-center text-sm text-muted-foreground/60">
                      אין מפגשים מתוכננים להיום
                    </TableCell>
                  </TableRow>
                ) : (
                  sessions.map((s, i) => (
                    <motion.tr
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className="border-0"
                    >
                      <TableCell className="px-4 py-3 text-sm font-mono tabular-nums whitespace-nowrap">
                        {s.time}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <Badge
                          variant="secondary"
                          className="status-ok tint-text rounded-full px-2.5 py-0.5 text-[0.65rem] font-medium border-0"
                          style={{ backgroundColor: "var(--tint-soft)" }}
                        >
                          {s.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm text-foreground">
                        {s.name}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm text-muted-foreground">
                        {s.location} · {s.coach}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm font-mono tabular-nums text-muted-foreground">
                        {s.enrolled} / {s.capacity}
                      </TableCell>
                    </motion.tr>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
