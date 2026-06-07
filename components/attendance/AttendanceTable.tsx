"use client";

import { motion } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { AttendanceMarkButton } from "@/components/attendance/AttendanceMarkButton";
import { SelectionHead, SelectionCell } from "@/components/shared/SelectionColumn";
import { useRowSelection } from "@/hooks/useRowSelection";
import { cn } from "@/lib/utils";
import type { AttendanceMark } from "@/lib/attendance-data";

export interface AttendanceRow {
  id: string;
  name: string;
  rating: number;
  mark: AttendanceMark;
  comment: string;
}

const MotionTableRow = motion.create(TableRow);

interface AttendanceTableProps {
  roster: AttendanceRow[];
  onCycle: (studentId: string) => void;
  onComment: (studentId: string, value: string) => void;
}

export function AttendanceTable({
  roster,
  onCycle,
  onComment,
}: AttendanceTableProps) {
  const selection = useRowSelection(roster.map((r) => r.id));

  return (
    <div
      dir="ltr"
      className="overflow-x-hidden"
    >
      <div dir="rtl">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-background/40 backdrop-blur-md [&_tr]:border-b-2 [&_tr]:border-border">
            <TableRow className="hover:bg-transparent">
              <TableHead className="px-4 py-3 text-[0.7rem] font-medium uppercase tracking-[0.14em] text-foreground/70 text-center">
                שם תלמיד
              </TableHead>
              <TableHead className="px-4 py-3 text-[0.7rem] font-medium uppercase tracking-[0.14em] text-foreground/70 text-center">
                נוכחות
              </TableHead>
              <TableHead className="px-4 py-3 text-[0.7rem] font-medium uppercase tracking-[0.14em] text-foreground/70 text-center">
                הערה
              </TableHead>
              <SelectionHead selection={selection} />
            </TableRow>
          </TableHeader>
          <TableBody>
            {roster.map((row, i) => (
              <MotionTableRow
                key={row.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: Math.min(i * 0.015, 0.2),
                  duration: 0.3,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={cn(
                  "border-0 transition-colors duration-150",
                  i % 2 === 1 && "bg-primary/15",
                )}
              >
                <TableCell className="px-4 py-2.5 text-sm font-medium text-foreground text-center">
                  {row.name}
                </TableCell>
                <TableCell className="px-4 py-2.5 text-center">
                  <AttendanceMarkButton
                    mark={row.mark}
                    onClick={() => onCycle(row.id)}
                  />
                </TableCell>
                <TableCell className="px-4 py-2.5">
                  <Input
                    value={row.comment}
                    onChange={(e) => onComment(row.id, e.target.value)}
                    placeholder="הערה (אופציונלי)"
                    className="h-8 rounded-lg border-0 neu-inset bg-transparent text-sm text-right"
                  />
                </TableCell>
                <SelectionCell id={row.id} selection={selection} />
              </MotionTableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
