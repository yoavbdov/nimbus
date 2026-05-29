"use client";

import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Popover, PopoverAnchor } from "@/components/ui/popover";
import { PlayerActionsMenuContent } from "@/components/players/PlayerActionsMenu";
import {
  useRatingPlayersTable,
  type RatingPlayer,
  type SortDir,
  type SortKey,
} from "@/hooks/dashboard/useRatingPlayersTable";
import { cn } from "@/lib/utils";

function SortIcon({
  col,
  sortKey,
  sortDir,
}: {
  col: SortKey;
  sortKey: SortKey;
  sortDir: SortDir;
}) {
  if (col !== sortKey)
    return <ChevronsUpDown className="size-3 text-muted-foreground/50" />;
  return sortDir === "asc" ? (
    <ChevronUp className="size-3" />
  ) : (
    <ChevronDown className="size-3" />
  );
}

function ColHead({
  col,
  label,
  sortKey,
  sortDir,
  onSort,
}: {
  col: SortKey;
  label: string;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
}) {
  return (
    <TableHead className="px-4 py-3 text-[0.7rem] font-medium uppercase tracking-[0.14em] text-foreground/80 text-center">
      <Button
        variant="ghost"
        size="sm"
        className="h-auto px-0 py-0 font-medium text-foreground/80 gap-1.5 hover:bg-transparent hover:text-foreground mx-auto"
        onClick={() => onSort(col)}
      >
        {label}
        <SortIcon col={col} sortKey={sortKey} sortDir={sortDir} />
      </Button>
    </TableHead>
  );
}

function RatingRow({
  player: p,
  index: i,
  isActive,
  onOpen,
}: {
  player: RatingPlayer;
  index: number;
  isActive: boolean;
  onOpen: (name: string, e: React.MouseEvent) => void;
}) {
  return (
    <TableRow
      onClick={(e) => onOpen(p.name, e)}
      className={cn(
        "cursor-pointer border-0 transition-colors duration-150 hover:bg-primary/25",
        i % 2 === 1 && "bg-primary/15",
        isActive && "bg-primary/30",
      )}
    >
      <TableCell className="px-4 py-2.5 text-sm font-medium text-foreground text-center">
        {p.name}
      </TableCell>
      <TableCell className="px-4 py-2.5 text-sm num text-foreground text-center">
        {p.rating}
      </TableCell>
      <TableCell className="px-4 py-2.5 text-sm num text-foreground text-center">
        {p.birthYear}
      </TableCell>
    </TableRow>
  );
}

interface RatingPlayersTableProps {
  players: RatingPlayer[];
}

export function RatingPlayersTable({ players }: RatingPlayersTableProps) {
  const {
    sortKey,
    sortDir,
    sorted,
    handleSort,
    menuOpen,
    virtualRef,
    onSelectAction,
    activeName,
    handleRowClick,
    handleMenuOpenChange,
  } = useRatingPlayersTable(players);

  return (
    <Popover open={menuOpen} onOpenChange={handleMenuOpenChange}>
      <PopoverAnchor virtualRef={virtualRef} />
      <div
        dir="ltr"
        className="players-scroll h-90 overflow-y-auto overflow-x-hidden"
      >
        <div dir="rtl">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-background/40 backdrop-blur-md [&_tr]:border-b-0">
              <TableRow className="hover:bg-transparent">
                <ColHead
                  col="name"
                  label="שם"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={handleSort}
                />
                <ColHead
                  col="rating"
                  label="מד כושר"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={handleSort}
                />
                <ColHead
                  col="birthYear"
                  label="שנתון"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={handleSort}
                />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((p, i) => (
                <RatingRow
                  key={p.name}
                  player={p}
                  index={i}
                  isActive={activeName === p.name}
                  onOpen={handleRowClick}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      <PlayerActionsMenuContent onSelect={onSelectAction} />
    </Popover>
  );
}
