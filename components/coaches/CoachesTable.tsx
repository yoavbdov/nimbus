"use client";

import { motion } from "framer-motion";
import { SortIcon } from "@/components/shared/SortIcon";
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
import { CoachStatusBadge } from "@/components/coaches/CoachStatusBadge";
import { CoachActionsMenuContent } from "@/components/coaches/CoachActionsMenu";
import { SelectionHead, SelectionCell } from "@/components/shared/SelectionColumn";
import { BulkActionsMenuContent } from "@/components/shared/BulkActionsMenu";
import { coachActions, type CoachAction } from "@/lib/coach-actions";
import { useTableSelection } from "@/hooks/useTableSelection";
import type { RowSelection } from "@/hooks/useRowSelection";
import { useCoachesTable } from "@/hooks/coaches/useCoachesTable";
import type { SortDir, SortKey } from "@/hooks/coaches/useCoachesSort";
import { cn } from "@/lib/utils";
import type { Coach } from "@/lib/coaches-data";

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
        <SortIcon active={active} dir={dir} />
      </Button>
    </TableHead>
  );
}

const MotionTableRow = motion.create(TableRow);

function CoachRow({
  coach: c,
  index: i,
  isActive,
  onOpen,
  onToggleStatus,
  selection,
}: {
  coach: Coach;
  index: number;
  isActive: boolean;
  onOpen: (id: string, e: React.MouseEvent) => void;
  onToggleStatus?: (id: string) => void;
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
      onClick={(e) => onOpen(c.id, e)}
      className={cn(
        "cursor-pointer border-b-2 border-foreground/10 transition-colors duration-150 hover:bg-primary/25",
        i % 2 === 1 && "bg-primary/15",
        isActive && "bg-primary/30",
      )}
    >
      <TableCell className="px-4 py-3 text-sm font-medium text-foreground text-center">
        {c.name}
      </TableCell>
      <TableCell className="px-4 py-3 text-sm num text-foreground/80 text-center">
        <span dir="ltr">{c.phone}</span>
      </TableCell>
      <TableCell className="px-4 py-3 text-sm text-center">
        <CountPill value={c.courses.length} />
      </TableCell>
      <TableCell className="px-4 py-3 text-sm text-center">
        <CountPill value={c.competitions} />
      </TableCell>
      <TableCell className="px-4 py-3 text-center">
        <CoachStatusBadge
          status={c.status}
          onToggle={onToggleStatus ? () => onToggleStatus(c.id) : undefined}
        />
      </TableCell>
      <SelectionCell id={c.id} selection={selection} />
    </MotionTableRow>
  );
}

interface CoachesTableProps {
  coaches: Coach[];
  onAction?: (actionId: string, coachId: string | null) => void;
  onBulkAction?: (actionId: string, coachIds: string[]) => void;
  onToggleStatus?: (id: string) => void;
}

export function CoachesTable({
  coaches,
  onAction,
  onBulkAction,
  onToggleStatus,
}: CoachesTableProps) {
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
  } = useCoachesTable(coaches, { onAction });
  const { selection, bulkMode, onBulkSelect } = useTableSelection({
    ids: sorted.map((c) => c.id),
    activeId,
    onAction: (action: CoachAction, ids) => onBulkAction?.(action.id, ids),
  });

  if (coaches.length === 0) {
    return (
      <Alert className="border-0 bg-transparent py-12 [&>svg]:hidden">
        <AlertTitle className="text-center text-sm text-foreground/60 font-normal">
          לא נמצאו מדריכים תואמים
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
                <SortableHeader {...headerProps("name")}>שם מלא</SortableHeader>
                <SortableHeader {...headerProps("phone")}>טלפון</SortableHeader>
                <SortableHeader {...headerProps("clubs")}>חוגים פעילים</SortableHeader>
                <SortableHeader {...headerProps("competitions")}>תחרויות פעילות</SortableHeader>
                <SortableHeader {...headerProps("status")}>סטטוס</SortableHeader>
                <SelectionHead selection={selection} />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((c, i) => (
                <CoachRow
                  key={c.id}
                  coach={c}
                  index={i}
                  isActive={activeId === c.id}
                  onOpen={handleRowClick}
                  onToggleStatus={onToggleStatus}
                  selection={selection}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      {bulkMode ? (
        <BulkActionsMenuContent
          actions={coachActions}
          count={selection.selectedCount}
          onSelect={onBulkSelect}
        />
      ) : (
        <CoachActionsMenuContent onSelect={onSelectAction} />
      )}
    </Popover>
  );
}
