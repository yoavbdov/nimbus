"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Pencil,
  Check,
  X,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from "lucide-react";
import { Popover, PopoverAnchor } from "@/components/ui/popover";
import { PlayerActionsMenuContent } from "@/components/players/PlayerActionsMenu";
import { usePlayerActionsMenu } from "@/hooks/usePlayerActionsMenu";
import { cn } from "@/lib/utils";

export interface RatingTier {
  label: string;
  count: number;
  filter: string;
}

interface RatingDistributionProps {
  tiers: RatingTier[];
  onTierChange: (index: number, updated: Partial<RatingTier>) => void;
}


interface Player {
  name: string;
  rating: number;
  birthYear: number;
}

const players: Player[] = [
  { name: "יוסי כהן", rating: 2100, birthYear: 2001 },
  { name: "יצחק לוי", rating: 2000, birthYear: 2012 },
  { name: "אברהם יוסף", rating: 1531, birthYear: 1961 },
  { name: "דוד מזרחי", rating: 1800, birthYear: 1995 },
  { name: "משה פרץ", rating: 1650, birthYear: 2005 },
  { name: "נועם שפירא", rating: 2250, birthYear: 1998 },
  { name: "אורי גולן", rating: 1920, birthYear: 2003 },
  { name: "תמיר בן-דוד", rating: 1780, birthYear: 2008 },
  { name: "רועי אלון", rating: 1430, birthYear: 1990 },
  { name: "עמית שלום", rating: 2050, birthYear: 2000 },
  { name: "גיל ברקוביץ'", rating: 1350, birthYear: 1975 },
  { name: "שי אברהם", rating: 1600, birthYear: 2010 },
  { name: "ליאור נחמן", rating: 1720, birthYear: 2006 },
  { name: "בן כץ", rating: 1480, birthYear: 1985 },
  { name: "עידן מור", rating: 1950, birthYear: 2002 },
  { name: "אלון ברון", rating: 1280, birthYear: 1970 },
  { name: "יהונתן פלד", rating: 1830, birthYear: 1999 },
  { name: "מתן זיו", rating: 1560, birthYear: 2007 },
  { name: "ניב שגיא", rating: 2180, birthYear: 1997 },
  { name: "עמיחי דקל", rating: 1410, birthYear: 1983 },
  { name: "רן הרפז", rating: 1690, birthYear: 2004 },
  { name: "טל ורד", rating: 1870, birthYear: 1996 },
  { name: "אבי שרון", rating: 1320, birthYear: 1968 },
  { name: "כרמל נוי", rating: 2020, birthYear: 2001 },
  { name: "שחר לפיד", rating: 1750, birthYear: 2009 },
  { name: "אדם פישר", rating: 1580, birthYear: 1993 },
  { name: "יובל גפן", rating: 1900, birthYear: 2000 },
  { name: "ארי בלום", rating: 1450, birthYear: 1980 },
  { name: "נתן אוחיון", rating: 1640, birthYear: 2011 },
  { name: "עמוס רביד", rating: 1990, birthYear: 1994 },
];

type SortKey = "name" | "rating" | "birthYear";
type SortDir = "asc" | "desc";

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

function RatingRow({
  player: p,
  index: i,
  activeName,
  onOpen,
}: {
  player: Player;
  index: number;
  activeName: string | null;
  onOpen: (name: string, e: React.MouseEvent) => void;
}) {
  const isOpen = activeName === p.name;
  return (
    <TableRow
      onClick={(e) => onOpen(p.name, e)}
      className={cn(
        "cursor-pointer border-0 transition-colors duration-150 hover:bg-primary/25",
        i % 2 === 1 && "bg-primary/15",
        isOpen && "bg-primary/30",
      )}
    >
      <TableCell className="px-4 py-2.5 text-sm font-medium text-foreground">
        {p.name}
      </TableCell>
      <TableCell className="px-4 py-2.5 text-sm num text-foreground">
        {p.rating}
      </TableCell>
      <TableCell className="px-4 py-2.5 text-sm num text-foreground text-end">
        {p.birthYear}
      </TableCell>
    </TableRow>
  );
}

function PlayersTable() {
  const [sortKey, setSortKey] = useState<SortKey>("rating");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const { open, setOpen, virtualRef, openAt, onSelect } = usePlayerActionsMenu();
  const [activeName, setActiveName] = useState<string | null>(null);

  const handleOpen = (name: string, e: React.MouseEvent) => {
    setActiveName(name);
    openAt(e);
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setActiveName(null);
  };

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "name" ? "asc" : "desc");
    }
  }

  const sorted = [...players].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    const cmp =
      typeof aVal === "string"
        ? aVal.localeCompare(bVal as string, "he")
        : (aVal as number) - (bVal as number);
    return sortDir === "asc" ? cmp : -cmp;
  });

  function ColHead({ col, label, align }: { col: SortKey; label: string; align?: "start" | "end" }) {
    return (
      <TableHead
        className={cn(
          "px-4 py-3 text-[0.7rem] font-medium uppercase tracking-[0.14em] text-foreground/80",
          align === "end" ? "text-end" : "text-start",
        )}
      >
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-auto px-0 py-0 font-medium text-foreground/80 gap-1.5 hover:bg-transparent hover:text-foreground",
            align === "end" && "ms-auto",
          )}
          onClick={() => handleSort(col)}
        >
          {label}
          <SortIcon col={col} sortKey={sortKey} sortDir={sortDir} />
        </Button>
      </TableHead>
    );
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverAnchor virtualRef={virtualRef} />
    <ScrollArea className="h-90" dir="rtl">
      <Table>
        <TableHeader className="sticky top-0 z-10 [&_tr]:border-b-0">
          <TableRow className="hover:bg-transparent">
            <ColHead col="name" label="שם" />
            <ColHead col="rating" label="מד כושר" />
            <ColHead col="birthYear" label="שנתון" align="end" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((p, i) => (
            <RatingRow key={p.name} player={p} index={i} activeName={activeName} onOpen={handleOpen} />
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
    <PlayerActionsMenuContent onSelect={onSelect} />
    </Popover>
  );
}

interface EditableFieldProps {
  value: string;
  onCommit: (val: string) => void;
  className?: string;
}

function EditableField({ value, onCommit, className }: EditableFieldProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  function commit() {
    onCommit(draft.trim() || value);
    setEditing(false);
  }

  function cancel() {
    setDraft(value);
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") cancel();
          }}
          autoFocus
          className="h-7 text-xs px-2 neu-inset border-0 rounded-md flex-1"
        />
        <Button
          variant="ghost"
          size="icon"
          className="size-5"
          onClick={commit}
          aria-label="אשר"
        >
          <Check className="size-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-5"
          onClick={cancel}
          aria-label="בטל"
        >
          <X className="size-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("group relative flex items-center justify-center min-w-0", className)}>
      <span className="truncate">{value}</span>
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-5 size-5 opacity-0 group-hover:opacity-100 transition-opacity duration-100 text-muted-foreground shrink-0"
        onClick={() => {
          setDraft(value);
          setEditing(true);
        }}
        aria-label="ערוך"
      >
        <Pencil className="size-3" />
      </Button>
    </div>
  );
}

function TierBox({
  tier,
  onChange,
}: {
  tier: RatingTier;
  onChange: (updated: Partial<RatingTier>) => void;
}) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 320, damping: 24 }}
      className="tint-indigo bloom bloom-indigo bloom-hover rounded-2xl h-full"
    >
      <Card className="group/tier relative overflow-hidden glass-sm shadow-depth neu-interactive border-0 ring-0 rounded-2xl h-full gap-0 py-0">
        <div className="absolute inset-x-0 top-0 h-1 tint-bar origin-center scale-x-0 group-hover/tier:scale-x-100 transition-transform duration-700 ease-out" />
        <CardContent className="p-4 h-full">
          <div className="flex flex-col items-center text-center justify-center h-full gap-2">
            <EditableField
              value={tier.label}
              onCommit={(label) => onChange({ label })}
              className="text-sm font-medium uppercase tracking-[0.12em] text-foreground justify-center"
            />
            <span className="text-5xl font-semibold num tint-text leading-none">
              {tier.count}
            </span>
            <EditableField
              value={tier.filter}
              onCommit={(filter) => onChange({ filter })}
              className="text-xs text-foreground justify-center"
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function RatingDistribution({
  tiers,
  onTierChange,
}: RatingDistributionProps) {
  const total = tiers.reduce((sum, t) => sum + t.count, 0);

  return (
    <Card className="tint-indigo glass shadow-depth-xl border-0 ring-0 rounded-3xl gap-0 py-0 overflow-hidden">
      <div className="h-1 tint-bar" />
      <CardContent className="p-6">
        <div className="flex flex-col items-center mb-6 gap-1">
          <CardTitle className="text-base font-semibold tracking-wide tint-text">
            התפלגות דירוגים
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground/80 num">
            {total} שחקנים
          </CardDescription>
        </div>

        <div className="flex gap-6 items-stretch">
          <div className="w-1/2 h-90">
            <div className="grid grid-cols-2 grid-rows-2 gap-5 h-full">
              {tiers.map((tier, i) => (
                <TierBox
                  key={i}
                  tier={tier}
                  onChange={(updated) => onTierChange(i, updated)}
                />
              ))}
            </div>
          </div>
          <div className="w-1/2 neu-inset rounded-2xl p-3">
            <PlayersTable />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
