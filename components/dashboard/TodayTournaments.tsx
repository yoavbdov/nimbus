"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverAnchor } from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TournamentActionsMenuContent } from "@/components/tournaments/TournamentActionsMenu";
import { SelectionHead, SelectionCell } from "@/components/shared/SelectionColumn";
import { BulkActionsMenuContent } from "@/components/shared/BulkActionsMenu";
import { tournamentActions } from "@/lib/tournament-actions";
import { useTableSelection } from "@/hooks/useTableSelection";
import { useTodayTournaments, todayLabel } from "@/hooks/dashboard/useTodayTournaments";
import { cn } from "@/lib/utils";

export function TodayTournaments() {
  const {
    tournaments,
    menuOpen,
    virtualRef,
    onSelectAction,
    activeIndex,
    handleRowClick,
    handleMenuOpenChange,
  } = useTodayTournaments();
  const { selection, bulkMode, onBulkSelect } = useTableSelection({
    ids: tournaments.map((_, i) => String(i)),
    activeId: activeIndex === null ? null : String(activeIndex),
    onAction: onSelectAction,
  });

  return (
    <Popover open={menuOpen} onOpenChange={handleMenuOpenChange}>
      <PopoverAnchor virtualRef={virtualRef} />
      <Card className="tint-indigo glass shadow-depth-xl border-0 ring-0 rounded-3xl gap-0 py-0 overflow-hidden">
        <div className="h-1 tint-bar" />
        <CardHeader className="px-6 pt-5 pb-4 flex flex-col items-center space-y-0">
          <CardTitle className="text-base font-semibold tracking-wide tint-text text-center">
            תחרויות היום · {todayLabel}
          </CardTitle>
        </CardHeader>

        <CardContent className="px-4 pb-4">
          <div className="neu-inset rounded-2xl p-2">
            <ScrollArea>
              <Table className="min-w-150">
                <TableHeader>
                  <TableRow className="border-b-0 hover:bg-transparent">
                    <TableHead className="px-4 py-3 text-[0.7rem] font-medium text-muted-foreground uppercase tracking-wider text-start">שעה</TableHead>
                    <TableHead className="px-4 py-3 text-[0.7rem] font-medium text-muted-foreground uppercase tracking-wider text-start">שם</TableHead>
                    <TableHead className="px-4 py-3 text-[0.7rem] font-medium text-muted-foreground uppercase tracking-wider text-start">סבב</TableHead>
                    <TableHead className="px-4 py-3 text-[0.7rem] font-medium text-muted-foreground uppercase tracking-wider text-start">מיקום / שופט</TableHead>
                    <TableHead className="px-4 py-3 text-[0.7rem] font-medium text-muted-foreground uppercase tracking-wider text-start">משתתפים</TableHead>
                    <SelectionHead selection={selection} />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tournaments.length === 0 ? (
                    <TableRow className="border-0 hover:bg-transparent">
                      <TableCell colSpan={6} className="p-10 text-center text-sm text-muted-foreground/60">
                        אין תחרויות מתוכננות להיום
                      </TableCell>
                    </TableRow>
                  ) : (
                    tournaments.map((t, i) => (
                      <motion.tr
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        onClick={(e) => handleRowClick(i, e)}
                        className={cn(
                          "cursor-pointer border-0 transition-colors duration-150 hover:bg-primary/25",
                          i % 2 === 1 && "bg-primary/15",
                          activeIndex === i && "bg-primary/30",
                        )}
                      >
                        <TableCell className="px-4 py-3 text-sm num whitespace-nowrap">
                          {t.time}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm text-foreground">
                          {t.name}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <Badge
                            variant="secondary"
                            className="status-ok tint-text rounded-full px-2.5 py-0.5 text-[0.65rem] font-medium border-0"
                            style={{ backgroundColor: "var(--tint-soft)" }}
                          >
                            {t.round}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm text-muted-foreground">
                          {t.room} · {t.judge}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm num text-muted-foreground">
                          {t.participants}
                        </TableCell>
                        <SelectionCell id={String(i)} selection={selection} />
                      </motion.tr>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
      {bulkMode ? (
        <BulkActionsMenuContent
          actions={tournamentActions}
          count={selection.selectedCount}
          onSelect={onBulkSelect}
        />
      ) : (
        <TournamentActionsMenuContent onSelect={onSelectAction} />
      )}
    </Popover>
  );
}
