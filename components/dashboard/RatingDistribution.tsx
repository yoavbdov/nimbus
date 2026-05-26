"use client";

import { useState } from "react";
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

function PlayersTable() {
  const [sortKey, setSortKey] = useState<SortKey>("rating");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

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

  function ColHead({ col, label }: { col: SortKey; label: string }) {
    return (
      <TableHead>
        <Button
          variant="ghost"
          size="sm"
          className="h-auto px-0 py-0 font-medium text-foreground gap-1 hover:bg-transparent"
          onClick={() => handleSort(col)}
        >
          {label}
          <SortIcon col={col} sortKey={sortKey} sortDir={sortDir} />
        </Button>
      </TableHead>
    );
  }

  return (
    <ScrollArea className="h-90">
      <Table>
        <TableHeader>
          <TableRow>
            <ColHead col="name" label="שם" />
            <ColHead col="rating" label="מד כושר" />
            <ColHead col="birthYear" label="שנתון" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((p) => (
            <TableRow key={p.name}>
              <TableCell className="font-medium">{p.name}</TableCell>
              <TableCell className="font-mono tabular-nums">
                {p.rating}
              </TableCell>
              <TableCell className="font-mono tabular-nums text-muted-foreground">
                {p.birthYear}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
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
          className="h-6 text-xs px-1.5 border-border/60 bg-background flex-1"
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
    <Card className="border-[3px] border-blue-400 bg-blue-100 shadow-none rounded-lg h-full">
      <CardContent className="p-2.5 h-full">
        <div className="flex flex-col items-center text-center justify-center h-full gap-1">
          <EditableField
            value={tier.label}
            onCommit={(label) => onChange({ label })}
            className="text-xl font-medium text-muted-foreground justify-center"
          />
          <span className="text-5xl font-semibold font-mono tabular-nums text-foreground leading-none">
            {tier.count}
          </span>
          <EditableField
            value={tier.filter}
            onCommit={(filter) => onChange({ filter })}
            className="text-base text-muted-foreground/60 justify-center"
          />
        </div>
      </CardContent>
    </Card>
  );
}

export function RatingDistribution({
  tiers,
  onTierChange,
}: RatingDistributionProps) {
  const total = tiers.reduce((sum, t) => sum + t.count, 0);

  return (
    <Card className="border-blue-400 border-[3px] bg-blue-50 shadow-md rounded-xl">
      <CardContent className="p-4">
        <div className="flex flex-col items-center mb-4 gap-0.5">
          <CardTitle className="text-base font-semibold text-foreground">
            התפלגות דירוגים
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground/80">
            {total} שחקנים
          </CardDescription>
        </div>

        <div className="flex gap-4 items-stretch">
          <div className="w-1/2 h-90">
            <div className="grid grid-cols-2 grid-rows-2 gap-4 h-full p-2">
              {tiers.map((tier, i) => (
                <TierBox
                  key={i}
                  tier={tier}

                  onChange={(updated) => onTierChange(i, updated)}
                />
              ))}
            </div>
          </div>
          <div className="w-1/2">
            <PlayersTable />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
