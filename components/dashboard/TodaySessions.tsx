"use client";

import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScheduleEventMenu } from "@/components/schedule/ScheduleEventMenu";
import { ScheduleActionModals } from "@/components/schedule/ScheduleActionModals";
import { useTodaySessions, todayLabel } from "@/hooks/dashboard/useTodaySessions";
import { cn } from "@/lib/utils";

export function TodaySessions() {
  const { sessions, menu, actions, handleRowClick, handleSelect } =
    useTodaySessions();

  return (
    <>
      <Card className="tint-indigo glass shadow-depth-xl border-0 ring-0 rounded-3xl gap-0 py-0 overflow-hidden">
        <div className="h-1 tint-bar" />
        <CardHeader className="px-6 pt-5 pb-4 flex flex-col items-center space-y-0">
          <CardTitle className="text-base font-semibold tracking-wide tint-text text-center">
            חוגים היום · {todayLabel}
          </CardTitle>
        </CardHeader>

        <CardContent className="px-4 pb-4">
          <div className="neu-inset rounded-2xl p-2">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="border-b-0 hover:bg-transparent">
                  <TableHead className="px-3 py-3 text-[0.7rem] font-medium text-muted-foreground uppercase tracking-wider text-center">שם</TableHead>
                  <TableHead className="px-3 py-3 text-[0.7rem] font-medium text-muted-foreground uppercase tracking-wider text-center">מיקום</TableHead>
                  <TableHead className="px-3 py-3 text-[0.7rem] font-medium text-muted-foreground uppercase tracking-wider text-center">שעה</TableHead>
                  <TableHead className="px-3 py-3 text-[0.7rem] font-medium text-muted-foreground uppercase tracking-wider text-center">משתתפים</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.length === 0 ? (
                  <TableRow className="border-0 hover:bg-transparent">
                    <TableCell colSpan={4} className="p-10 text-center text-sm text-muted-foreground/60">
                      אין חוגים מתוכננים להיום
                    </TableCell>
                  </TableRow>
                ) : (
                  sessions.map((s, i) => (
                    <motion.tr
                      key={s.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      onClick={(e) => handleRowClick(i, e)}
                      className={cn(
                        "cursor-pointer border-0 transition-colors duration-150",
                        i % 2 === 1 ? "bg-primary/15 hover:bg-primary/25" : "hover:bg-primary/15",
                        menu.activeEvent?.id === s.id && "bg-primary/30",
                      )}
                    >
                      <TableCell className="px-3 py-3 text-sm text-center text-foreground">
                        {s.name}
                      </TableCell>
                      <TableCell className="px-3 py-3 text-sm text-center text-muted-foreground">
                        {s.location}
                      </TableCell>
                      <TableCell dir="ltr" className="px-3 py-3 text-sm num whitespace-nowrap text-center">
                        {s.time}
                      </TableCell>
                      <TableCell className="px-3 py-3 text-sm num text-center text-muted-foreground">
                        {s.participants}
                      </TableCell>
                    </motion.tr>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <ScheduleEventMenu
        open={menu.open}
        onOpenChange={menu.handleOpenChange}
        virtualRef={menu.virtualRef}
        category={menu.activeEvent?.category}
        onSelect={handleSelect}
      />
      <ScheduleActionModals actions={actions} />
    </>
  );
}
