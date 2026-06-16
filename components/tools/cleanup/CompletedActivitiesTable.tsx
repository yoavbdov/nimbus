"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SelectionHead, SelectionCell } from "@/components/shared/SelectionColumn";
import { CleanupKindBadge } from "@/components/tools/cleanup/CleanupKindBadge";
import { type CompletedActivity } from "@/lib/cleanup-data";
import { type RowSelection } from "@/hooks/useRowSelection";
import { cn } from "@/lib/utils";

const headClass =
  "px-3 py-2.5 text-center text-[0.7rem] font-medium uppercase tracking-[0.14em] text-foreground/70";
const cellClass = "px-3 py-2.5 text-center text-sm text-foreground/85";

interface CompletedActivitiesTableProps {
  items: CompletedActivity[];
  selection: RowSelection;
  onOpenDetails: (item: CompletedActivity) => void;
}

export function CompletedActivitiesTable({
  items,
  selection,
  onOpenDetails,
}: CompletedActivitiesTableProps) {
  return (
    <Table>
      <TableHeader className="[&_tr]:border-b-2 [&_tr]:border-border">
        <TableRow className="hover:bg-transparent">
          <TableHead className={headClass}>סוג</TableHead>
          <TableHead className={cn(headClass, "text-start")}>שם</TableHead>
          <TableHead className={headClass}>אחראי</TableHead>
          <TableHead className={headClass}>מועד אחרון</TableHead>
          <TableHead className={headClass}>חדר</TableHead>
          <SelectionHead selection={selection} />
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item, i) => {
          return (
            <TableRow
              key={item.id}
              onClick={() => onOpenDetails(item)}
              className={cn(
                "cursor-pointer border-b-2 border-foreground/10 transition-colors duration-150 hover:bg-primary/25",
                i % 2 === 1 && "bg-primary/15",
              )}
            >
              <TableCell className={cellClass}>
                <div className="flex justify-center">
                  <CleanupKindBadge kind={item.kind} />
                </div>
              </TableCell>
              <TableCell
                className={cn(cellClass, "text-start font-medium text-foreground")}
              >
                {item.name}
              </TableCell>
              <TableCell className={cellClass}>{item.owner}</TableCell>
              <TableCell className={cn(cellClass, "num")} dir="ltr">
                {item.date}
              </TableCell>
              <TableCell className={cellClass}>{item.room}</TableCell>
              <SelectionCell id={item.id} selection={selection} />
            </TableRow>
          );
        })}
        {items.length === 0 && (
          <TableRow className="hover:bg-transparent">
            <TableCell
              colSpan={6}
              className="px-3 py-10 text-center text-sm text-muted-foreground"
            >
              הארכיון ריק.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
