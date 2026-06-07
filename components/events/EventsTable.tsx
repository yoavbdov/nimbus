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
import { EventStatusBadge } from "@/components/events/EventStatusBadge";
import { RowActionsMenuContent } from "@/components/shared/RowActionsMenu";
import { eventActions } from "@/lib/row-actions";
import { SelectionHead, SelectionCell } from "@/components/shared/SelectionColumn";
import { BulkActionsMenuContent } from "@/components/shared/BulkActionsMenu";
import { useTableSelection } from "@/hooks/useTableSelection";
import type { RowSelection } from "@/hooks/useRowSelection";
import { useEventsTable } from "@/hooks/events/useEventsTable";
import type { SortDir, SortKey } from "@/hooks/events/useEventsSort";
import { cn } from "@/lib/utils";
import type { ClubEvent } from "@/lib/events-data";

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

function RecurrenceBadge({ value }: { value: string }) {
  return (
    <Badge
      variant="secondary"
      className="h-6 px-2.5 rounded-full neu-raised-xs bg-transparent border-0 text-[0.7rem] text-foreground"
    >
      {value}
    </Badge>
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

function EventRow({
  event: e,
  index: i,
  isActive,
  onOpen,
  selection,
}: {
  event: ClubEvent;
  index: number;
  isActive: boolean;
  onOpen: (id: string, e: React.MouseEvent) => void;
  selection: RowSelection;
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
      onClick={(ev) => onOpen(e.id, ev)}
      className={cn(
        "cursor-pointer border-0 transition-colors duration-150 hover:bg-primary/25",
        i % 2 === 1 && "bg-primary/15",
        isActive && "bg-primary/30",
      )}
    >
      <TableCell className="px-4 py-3 text-sm font-medium text-foreground text-center">
        {e.name}
      </TableCell>
      <TableCell className="px-4 py-3 text-sm text-foreground/85 text-center">
        {e.room}
      </TableCell>
      <TableCell className="px-4 py-3 text-center">
        <RecurrenceBadge value={e.recurrence} />
      </TableCell>
      <TableCell className="px-4 py-3 text-center">
        <DaysPills days={e.days} />
      </TableCell>
      <TableCell className="px-4 py-3 text-center">
        <EventStatusBadge status={e.status} />
      </TableCell>
      <SelectionCell id={e.id} selection={selection} />
    </MotionTableRow>
  );
}

interface EventsTableProps {
  events: ClubEvent[];
}

export function EventsTable({ events }: EventsTableProps) {
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
  } = useEventsTable(events);
  const { selection, bulkMode, onBulkSelect } = useTableSelection({
    ids: sorted.map((e) => e.id),
    activeId,
    onAction: onSelectAction,
  });

  if (events.length === 0) {
    return (
      <Alert className="border-0 bg-transparent py-12 [&>svg]:hidden">
        <AlertTitle className="text-center text-sm text-foreground/60 font-normal">
          לא נמצאו אירועים תואמים
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
            <TableHeader className="sticky top-0 z-10 bg-background/40 backdrop-blur-md [&_tr]:border-b-2 [&_tr]:border-border">
              <TableRow className="hover:bg-transparent">
                <SortableHeader {...headerProps("name")}>שם אירוע</SortableHeader>
                <SortableHeader {...headerProps("room")}>חדר</SortableHeader>
                <SortableHeader {...headerProps("recurrence")}>קבוע/חד פעמי</SortableHeader>
                <SortableHeader {...headerProps("days")}>ימי פעילות</SortableHeader>
                <SortableHeader {...headerProps("status")}>סטטוס</SortableHeader>
                <SelectionHead selection={selection} />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((e, i) => (
                <EventRow
                  key={e.id}
                  event={e}
                  index={i}
                  isActive={activeId === e.id}
                  onOpen={handleRowClick}
                  selection={selection}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      {bulkMode ? (
        <BulkActionsMenuContent
          actions={eventActions}
          count={selection.selectedCount}
          onSelect={onBulkSelect}
        />
      ) : (
        <RowActionsMenuContent actions={eventActions} onSelect={onSelectAction} />
      )}
    </Popover>
  );
}
