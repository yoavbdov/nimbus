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
import { Pencil, Check, X } from "lucide-react";
import { RatingPlayersTable } from "@/components/dashboard/RatingPlayersTable";
import type { RatingPlayer } from "@/hooks/dashboard/useRatingPlayersTable";
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

const players: RatingPlayer[] = [
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
            <RatingPlayersTable players={players} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
