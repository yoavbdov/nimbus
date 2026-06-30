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
import { LeagueRankBadge } from "@/components/leagues/LeagueRankBadge";
import { LeagueActionsMenuContent } from "@/components/leagues/LeagueActionsMenu";
import { SelectionHead, SelectionCell } from "@/components/shared/SelectionColumn";
import { BulkActionsMenuContent } from "@/components/shared/BulkActionsMenu";
import { leagueActions } from "@/lib/league-actions";
import { useTableSelection } from "@/hooks/useTableSelection";
import type { RowSelection } from "@/hooks/useRowSelection";
import { useLeaguesTable } from "@/hooks/leagues/useLeaguesTable";
import type { SortDir, SortKey } from "@/hooks/leagues/useLeaguesSort";
import { cn } from "@/lib/utils";
import type { LeagueTeam } from "@/lib/leagues-data";

function CountPill({ value }: { value: number }) {
  if (value === 0) return <span className="text-foreground/40 num">—</span>;
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

function LeagueTeamRow({
  team,
  index: i,
  isActive,
  onOpen,
  selection,
}: {
  team: LeagueTeam;
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
      onClick={(e) => onOpen(team.id, e)}
      className={cn(
        "cursor-pointer border-b-2 border-foreground/10 transition-colors duration-150 hover:bg-primary/25",
        i % 2 === 1 && "bg-primary/15",
        isActive && "bg-primary/30",
      )}
    >
      <TableCell className="px-4 py-3 text-sm font-medium text-foreground text-center">
        {team.name}
      </TableCell>
      <TableCell className="px-4 py-3 text-center">
        <LeagueRankBadge category={team.category} rank={team.rank} />
      </TableCell>
      <TableCell className="px-4 py-3 text-center">
        <CountPill value={team.players.length} />
      </TableCell>
      <TableCell className="px-4 py-3 text-sm text-foreground/75 text-center">
        {team.notes || <span className="text-foreground/40">—</span>}
      </TableCell>
      <SelectionCell id={team.id} selection={selection} />
    </MotionTableRow>
  );
}

interface LeaguesTableProps {
  teams: LeagueTeam[];
  onTeamAction?: (actionId: string, teamId: string) => void;
}

export function LeaguesTable({ teams, onTeamAction }: LeaguesTableProps) {
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
  } = useLeaguesTable(teams, onTeamAction);
  const { selection, bulkMode, onBulkSelect } = useTableSelection({
    ids: sorted.map((t) => t.id),
    activeId,
    onAction: onSelectAction,
  });

  if (teams.length === 0) {
    return (
      <Alert className="border-0 bg-transparent py-12 [&>svg]:hidden">
        <AlertTitle className="text-center text-sm text-foreground/60 font-normal">
          אין קבוצות בקטגוריה זו
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
            <TableHeader className="sticky top-0 z-10 bg-background/40 backdrop-blur-md [&_tr]:border-b-2 [&_tr]:border-foreground/15">
              <TableRow className="hover:bg-transparent">
                <SortableHeader {...headerProps("name")}>שם קבוצה</SortableHeader>
                <SortableHeader {...headerProps("rank")}>דרגת ליגה</SortableHeader>
                <SortableHeader {...headerProps("players")}>שחקנים</SortableHeader>
                <SortableHeader {...headerProps("notes")}>הערות</SortableHeader>
                <SelectionHead selection={selection} />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((team, i) => (
                <LeagueTeamRow
                  key={team.id}
                  team={team}
                  index={i}
                  isActive={activeId === team.id}
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
          actions={leagueActions}
          count={selection.selectedCount}
          onSelect={onBulkSelect}
        />
      ) : (
        <LeagueActionsMenuContent onSelect={onSelectAction} />
      )}
    </Popover>
  );
}
