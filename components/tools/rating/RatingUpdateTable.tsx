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
import { Alert, AlertTitle } from "@/components/ui/alert";
import { type RatingPlayer } from "@/lib/rating-data";
import { cn } from "@/lib/utils";

const headClass =
  "px-4 py-3 text-[0.7rem] font-medium uppercase tracking-[0.14em] text-foreground/70 text-center";
const cellClass = "px-4 py-3 text-sm text-foreground/80 text-center";

const MotionTableRow = motion.create(TableRow);

function RatingRow({
  player: p,
  index: i,
  value,
  onDraftChange,
}: {
  player: RatingPlayer;
  index: number;
  value: string;
  onDraftChange: (id: string, value: string) => void;
}) {
  const filled = value.trim() !== "";
  return (
    <MotionTableRow
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: Math.min(i * 0.015, 0.2),
        duration: 0.3,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={cn(
        "border-b-2 border-foreground/10 transition-colors duration-150 hover:bg-primary/25",
        i % 2 === 1 && "bg-primary/15",
        filled && "bg-primary/30",
      )}
    >
      <TableCell className="px-4 py-3 text-sm font-medium text-foreground text-center">
        {p.name}
      </TableCell>
      <TableCell className={cn(cellClass, "num text-foreground")}>
        {p.currentRating}
      </TableCell>
      <TableCell className={cn(cellClass, "num")}>
        <span dir="ltr">{p.lastUpdated}</span>
      </TableCell>
      <TableCell className="px-4 py-3 text-center">
        <div className="flex justify-center">
          <Input
            type="text"
            inputMode="numeric"
            maxLength={4}
            value={value}
            onChange={(e) => onDraftChange(p.id, e.target.value)}
            placeholder="—"
            aria-label={`מד כושר חדש עבור ${p.name}`}
            className="h-9 w-24 rounded-xl text-center num"
          />
        </div>
      </TableCell>
    </MotionTableRow>
  );
}

interface RatingUpdateTableProps {
  players: RatingPlayer[];
  /** New rating typed per player id. */
  drafts: Record<string, string>;
  onDraftChange: (id: string, value: string) => void;
}

export function RatingUpdateTable({
  players,
  drafts,
  onDraftChange,
}: RatingUpdateTableProps) {
  if (players.length === 0) {
    return (
      <Alert className="border-0 bg-transparent py-12 [&>svg]:hidden">
        <AlertTitle className="text-center text-sm text-foreground/60 font-normal">
          לא נמצאו שחקנים
        </AlertTitle>
      </Alert>
    );
  }

  return (
    <div
      dir="ltr"
      className="players-scroll max-h-[calc(100dvh-22rem)] overflow-y-auto overflow-x-hidden"
    >
      <div dir="rtl">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-background/40 backdrop-blur-md [&_tr]:border-b-2 [&_tr]:border-border">
            <TableRow className="hover:bg-transparent">
              <TableHead className={headClass}>שם שחקן</TableHead>
              <TableHead className={headClass}>מד כושר נוכחי</TableHead>
              <TableHead className={headClass}>עודכן לאחרונה ב</TableHead>
              <TableHead className={headClass}>מד כושר חדש</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {players.map((p, i) => (
              <RatingRow
                key={p.id}
                player={p}
                index={i}
                value={drafts[p.id] ?? ""}
                onDraftChange={onDraftChange}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
