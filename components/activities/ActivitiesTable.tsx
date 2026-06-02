"use client";

import { motion } from "framer-motion";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Popover, PopoverAnchor } from "@/components/ui/popover";
import { ActivityStatusBadge } from "@/components/activities/ActivityStatusBadge";
import { ActivityActionsMenuContent } from "@/components/activities/ActivityActionsMenu";
import { useActivitiesTable } from "@/hooks/activities/useActivitiesTable";
import type { SortDir, SortKey } from "@/hooks/activities/useActivitiesSort";
import { cn } from "@/lib/utils";
import type { Activity } from "@/lib/activities-data";

function RangePill({ from, to }: { from: number; to: number }) {
  return (
    <span className="num text-sm text-foreground/85" dir="ltr">
      {from}–{to}
    </span>
  );
}

function CountPill({ value }: { value: number }) {
  if (value === 0)
    return <span className="text-foreground/40 num">—</span>;
  return (
    <Badge
      variant="secondary"
      className="min-w-6 h-6 px-2 rounded-full neu-raised-xs bg-transparent border-0 text-[0.7rem] num text-foreground justify-center"
    >
      {value}
    </Badge>
  );
}

function DaysPills({ days }: { days: string[] }) {
  if (days.length === 0)
    return <span className="text-foreground/40 num">—</span>;
  return (
    <div className="flex flex-wrap justify-center gap-1">
      {days.map((d) => (
        <Badge
          key={d}
          variant="secondary"
          className="h-6 px-2 rounded-full neu-raised-xs bg-transparent border-0 text-[0.7rem] text-foreground"
        >
          {d}
        </Badge>
      ))}
    </div>
  );
}

function SortableHeader({
  children,
  sortKey,
  active,
  dir,
  onSort,
}: {
  children: React.ReactNode;
  sortKey: SortKey;
  active: boolean;
  dir: SortDir;
  onSort: (key: SortKey) => void;
}) {
  const Icon = !active ? ArrowUpDown : dir === "asc" ? ArrowUp : ArrowDown;
  return (
    <TableHead className="px-4 py-3 text-[0.7rem] font-medium uppercase tracking-[0.14em] text-foreground/70 text-center">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onSort(sortKey)}
        className={cn(
          "mx-auto h-auto px-0 py-0 gap-1.5 font-medium uppercase tracking-[0.14em] text-foreground/70 hover:bg-transparent hover:text-foreground",
          active && "text-foreground",
        )}
      >
        {children}
        <Icon
          className={cn(
            "size-3 transition-opacity",
            active ? "opacity-100" : "opacity-40",
          )}
        />
      </Button>
    </TableHead>
  );
}

const MotionTableRow = motion.create(TableRow);

function ActivityRow({
  activity: a,
  index: i,
  isActive,
  onOpen,
}: {
  activity: Activity;
  index: number;
  isActive: boolean;
  onOpen: (id: string, e: React.MouseEvent) => void;
}) {
  return (
    <MotionTableRow
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: Math.min(i * 0.015, 0.2),
        duration: 0.3,
        ease: [0.22, 1, 0.36, 1],
      }}
      onClick={(e) => onOpen(a.id, e)}
      className={cn(
        "cursor-pointer border-0 transition-colors duration-150 hover:bg-primary/25",
        i % 2 === 1 && "bg-primary/15",
        isActive && "bg-primary/30",
      )}
    >
      <TableCell className="px-4 py-3 text-sm font-medium text-foreground text-center">
        {a.name}
      </TableCell>
      <TableCell className="px-4 py-3 text-sm text-foreground/85 text-center">
        {a.coach}
      </TableCell>
      <TableCell className="px-4 py-3 text-center">
        <RangePill from={a.ageMin} to={a.ageMax} />
      </TableCell>
      <TableCell className="px-4 py-3 text-center">
        <RangePill from={a.fitnessMin} to={a.fitnessMax} />
      </TableCell>
      <TableCell className="px-4 py-3 text-center">
        <CountPill value={a.enrolled} />
      </TableCell>
      <TableCell className="px-4 py-3 text-center">
        <CountPill value={a.capacity} />
      </TableCell>
      <TableCell className="px-4 py-3 text-center">
        <DaysPills days={a.days} />
      </TableCell>
      <TableCell className="px-4 py-3 text-center">
        <ActivityStatusBadge status={a.status} />
      </TableCell>
    </MotionTableRow>
  );
}

interface ActivitiesTableProps {
  activities: Activity[];
}

export function ActivitiesTable({ activities }: ActivitiesTableProps) {
  const {
    sortKey,
    sortDir,
    sorted,
    handleSort,
    menuOpen,
    virtualRef,
    onSelectAction,
    activeId,
    handleRowClick,
    handleMenuOpenChange,
  } = useActivitiesTable(activities);

  if (activities.length === 0) {
    return (
      <Alert className="border-0 bg-transparent py-12 [&>svg]:hidden">
        <AlertTitle className="text-center text-sm text-foreground/60 font-normal">
          לא נמצאו חוגים תואמים
        </AlertTitle>
      </Alert>
    );
  }

  const headerProps = (key: SortKey) => ({
    sortKey: key,
    active: sortKey === key,
    dir: sortDir,
    onSort: handleSort,
  });

  return (
    <Popover open={menuOpen} onOpenChange={handleMenuOpenChange}>
      <PopoverAnchor virtualRef={virtualRef} />
      <div
        dir="ltr"
        className="players-scroll max-h-[calc(100dvh-22rem)] overflow-y-auto overflow-x-hidden"
      >
        <div dir="rtl">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-background/40 backdrop-blur-md [&_tr]:border-b-0">
              <TableRow className="hover:bg-transparent">
                <SortableHeader {...headerProps("name")}>שם החוג</SortableHeader>
                <SortableHeader {...headerProps("coach")}>מדריך</SortableHeader>
                <SortableHeader {...headerProps("age")}>גילאים</SortableHeader>
                <SortableHeader {...headerProps("fitness")}>מד כושר</SortableHeader>
                <SortableHeader {...headerProps("enrolled")}>רשומים</SortableHeader>
                <SortableHeader {...headerProps("capacity")}>קיבולת</SortableHeader>
                <SortableHeader {...headerProps("days")}>ימי פעילות</SortableHeader>
                <SortableHeader {...headerProps("status")}>סטטוס</SortableHeader>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((a, i) => (
                <ActivityRow
                  key={a.id}
                  activity={a}
                  index={i}
                  isActive={activeId === a.id}
                  onOpen={handleRowClick}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      <ActivityActionsMenuContent onSelect={onSelectAction} />
    </Popover>
  );
}
