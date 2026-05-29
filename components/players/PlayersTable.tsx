"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { usePlayerActionsMenu } from "@/hooks/usePlayerActionsMenu";
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
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Popover, PopoverAnchor } from "@/components/ui/popover";
import { PlayerStatusBadge } from "@/components/players/PlayerStatusBadge";
import { PlayerActionsMenuContent } from "@/components/players/PlayerActionsMenu";
import { cn } from "@/lib/utils";
import type { Player } from "@/lib/players-data";

type SortKey =
  | "name"
  | "age"
  | "grade"
  | "israeliRating"
  | "phone"
  | "clubs"
  | "tournaments"
  | "leagueTeam"
  | "status";
type SortDir = "asc" | "desc";

const statusOrder: Record<Player["status"], number> = {
  "פעיל": 0,
  "ליגה בלבד": 1,
  "לא פעיל": 2,
};

function getSortValue(p: Player, key: SortKey): string | number {
  switch (key) {
    case "name":
      return p.name;
    case "age":
      return p.age;
    case "grade":
      return p.grade;
    case "israeliRating":
      return p.israeliRating;
    case "phone":
      return p.phone;
    case "clubs":
      return p.clubs.length;
    case "tournaments":
      return p.tournaments.length;
    case "leagueTeam":
      return p.leagueTeam ?? "";
    case "status":
      return statusOrder[p.status];
  }
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
    <TableHead className="px-4 py-3 text-[0.7rem] font-medium uppercase tracking-[0.14em] text-foreground/70 text-start">
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={cn(
          "inline-flex items-center gap-1.5 transition-colors hover:text-foreground cursor-pointer",
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
      </button>
    </TableHead>
  );
}

const MotionTableRow = motion.create(TableRow);

function PlayerRow({
  player: p,
  index: i,
  activeId,
  onOpen,
}: {
  player: Player;
  index: number;
  activeId: string | null;
  onOpen: (id: string, e: React.MouseEvent) => void;
}) {
  const isOpen = activeId === p.id;
  return (
      <MotionTableRow
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: Math.min(i * 0.015, 0.2),
          duration: 0.3,
          ease: [0.22, 1, 0.36, 1],
        }}
        onClick={(e) => onOpen(p.id, e)}
        className={cn(
          "cursor-pointer border-0 transition-colors duration-150 hover:bg-primary/25",
          i % 2 === 1 && "bg-primary/15",
          isOpen && "bg-primary/30",
        )}
      >
          <TableCell className="px-4 py-3 text-sm font-medium text-foreground">
            {p.name}
          </TableCell>
          <TableCell className="px-4 py-3 text-sm num text-foreground/80">
            {p.age}
          </TableCell>
          <TableCell className="px-4 py-3 text-sm text-foreground/80">
            {p.grade}
          </TableCell>
          <TableCell className="px-4 py-3 text-sm num text-foreground">
            {p.israeliRating}
          </TableCell>
          <TableCell className="px-4 py-3 text-sm num text-foreground/80 ltr:text-left">
            <span dir="ltr">{p.phone}</span>
          </TableCell>
          <TableCell className="px-4 py-3 text-sm">
            <CountPill value={p.clubs.length} />
          </TableCell>
          <TableCell className="px-4 py-3 text-sm">
            <CountPill value={p.tournaments.length} />
          </TableCell>
          <TableCell className="px-4 py-3 text-sm text-foreground/80">
            {p.leagueTeam ?? (
              <span className="text-foreground/40 num">—</span>
            )}
          </TableCell>
          <TableCell className="px-4 py-3">
            <PlayerStatusBadge status={p.status} />
          </TableCell>
      </MotionTableRow>
  );
}

interface PlayersTableProps {
  players: Player[];
}

export function PlayersTable({ players }: PlayersTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const { open, setOpen, virtualRef, openAt, onSelect } = usePlayerActionsMenu();
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleOpen = (id: string, e: React.MouseEvent) => {
    setActiveId(id);
    openAt(e);
  };

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sorted = useMemo(() => {
    const arr = [...players];
    arr.sort((a, b) => {
      const av = getSortValue(a, sortKey);
      const bv = getSortValue(b, sortKey);
      let cmp = 0;
      if (typeof av === "number" && typeof bv === "number") {
        cmp = av - bv;
      } else {
        cmp = String(av).localeCompare(String(bv), "he");
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [players, sortKey, sortDir]);

  if (players.length === 0) {
    return (
      <Alert className="border-0 bg-transparent py-12 [&>svg]:hidden">
        <AlertTitle className="text-center text-sm text-foreground/60 font-normal">
          לא נמצאו שחקנים תואמים
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
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor virtualRef={virtualRef} />
    <div
      dir="ltr"
      className="players-scroll max-h-[calc(100dvh-22rem)] overflow-y-auto overflow-x-hidden"
    >
      <div dir="rtl">
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-background/40 backdrop-blur-md [&_tr]:border-b-0">
          <TableRow className="hover:bg-transparent">
            <SortableHeader {...headerProps("name")}>שם מלא</SortableHeader>
            <SortableHeader {...headerProps("age")}>גיל</SortableHeader>
            <SortableHeader {...headerProps("grade")}>כיתה</SortableHeader>
            <SortableHeader {...headerProps("israeliRating")}>
              דירוג ישראלי
            </SortableHeader>
            <SortableHeader {...headerProps("phone")}>טלפון</SortableHeader>
            <SortableHeader {...headerProps("clubs")}>חוגים</SortableHeader>
            <SortableHeader {...headerProps("tournaments")}>
              תחרויות
            </SortableHeader>
            <SortableHeader {...headerProps("leagueTeam")}>
              קבוצות ליגה
            </SortableHeader>
            <SortableHeader {...headerProps("status")}>סטטוס</SortableHeader>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((p, i) => (
            <PlayerRow key={p.id} player={p} index={i} activeId={activeId} onOpen={handleOpen} />
          ))}
        </TableBody>
      </Table>
      </div>
    </div>
    <PlayerActionsMenuContent onSelect={onSelect} />
    </Popover>
  );
}
