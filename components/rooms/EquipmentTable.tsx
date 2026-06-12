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
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Popover, PopoverAnchor } from "@/components/ui/popover";
import { RowActionsMenuContent, type RowAction } from "@/components/shared/RowActionsMenu";
import { SelectionHead, SelectionCell } from "@/components/shared/SelectionColumn";
import { BulkActionsMenuContent } from "@/components/shared/BulkActionsMenu";
import { useRowActionsMenu } from "@/hooks/useRowActionsMenu";
import { useTableSelection } from "@/hooks/useTableSelection";
import { equipmentActions } from "@/lib/row-actions";
import { cn } from "@/lib/utils";
import type { Equipment } from "@/lib/rooms-data";

function StaticHeader({ children }: { children: React.ReactNode }) {
  return (
    <TableHead className="px-4 py-3 text-[0.7rem] font-medium uppercase tracking-[0.14em] text-foreground/70 text-center">
      <span className="mx-auto inline-flex items-center gap-1.5">
        {children}
        <SortIcon active={false} dir="asc" />
      </span>
    </TableHead>
  );
}

const MotionTableRow = motion.create(TableRow);

function QuantityPill({ value }: { value: number }) {
  return (
    <Badge
      variant="secondary"
      className="min-w-6 h-6 px-2 rounded-full neu-raised-xs bg-transparent border-0 text-[0.7rem] num text-foreground justify-center"
    >
      {value}
    </Badge>
  );
}

interface EquipmentTableProps {
  equipment: Equipment[];
  onAction?: (actionId: string, equipmentId: string | null) => void;
  onBulkAction?: (actionId: string, equipmentIds: string[]) => void;
}

export function EquipmentTable({ equipment, onAction, onBulkAction }: EquipmentTableProps) {
  const { open, activeId, virtualRef, openAt, handleOpenChange } =
    useRowActionsMenu();
  const { selection, bulkMode, onBulkSelect } = useTableSelection({
    ids: equipment.map((e) => e.id),
    activeId,
    onAction: (action: RowAction, ids) => onBulkAction?.(action.id, ids),
  });

  function handleSelectAction(action: RowAction) {
    const equipmentId = activeId;
    handleOpenChange(false);
    onAction?.(action.id, equipmentId);
  }

  if (equipment.length === 0) {
    return (
      <Alert className="border-0 bg-transparent py-12 [&>svg]:hidden">
        <AlertTitle className="text-center text-sm text-foreground/60 font-normal">
          לא נמצא ציוד תואם
        </AlertTitle>
      </Alert>
    );
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverAnchor virtualRef={virtualRef} />
      <div
        dir="ltr"
        className="players-scroll max-h-[calc(100dvh-22rem)] overflow-y-auto overflow-x-hidden"
      >
        <div dir="rtl">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-background/40 backdrop-blur-md [&_tr]:border-b-2 [&_tr]:border-border">
              <TableRow className="hover:bg-transparent">
                <StaticHeader>שם</StaticHeader>
                <StaticHeader>כמות</StaticHeader>
                <StaticHeader>הערות</StaticHeader>
                <SelectionHead selection={selection} />
              </TableRow>
            </TableHeader>
            <TableBody>
              {equipment.map((item, i) => (
                <MotionTableRow
                  key={item.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: Math.min(i * 0.015, 0.2),
                    duration: 0.3,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  onClick={(e) => openAt(item.id, e)}
                  className={cn(
                    "cursor-pointer border-b-2 border-foreground/10 transition-colors duration-150 hover:bg-primary/25",
                    i % 2 === 1 && "bg-primary/15",
                    activeId === item.id && "bg-primary/30",
                  )}
                >
                  <TableCell className="px-4 py-3 text-sm font-medium text-foreground text-center">
                    {item.name}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-center">
                    <QuantityPill value={item.quantity} />
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-foreground/85 text-center">
                    {item.notes}
                  </TableCell>
                  <SelectionCell id={item.id} selection={selection} />
                </MotionTableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      {bulkMode ? (
        <BulkActionsMenuContent
          actions={equipmentActions}
          count={selection.selectedCount}
          onSelect={onBulkSelect}
        />
      ) : (
        <RowActionsMenuContent actions={equipmentActions} onSelect={handleSelectAction} />
      )}
    </Popover>
  );
}
