"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Pencil, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

const dotColors = ["bg-slate-400", "bg-blue-400", "bg-blue-600", "bg-amber-500"];

const initialTiers = [
  { label: "מד כושר מתחת ל800", count: 2, filter: "מתחת ל-800" },
  { label: "בינוניים", count: 3, filter: "800 – 1200" },
  { label: "מתקדמים", count: 2, filter: "1200 – 1600" },
  { label: "אליטה", count: 3, filter: "1600+" },
];

interface TierState {
  label: string;
  count: number;
  filter: string;
}

interface EditableFieldProps {
  value: string;
  onCommit: (val: string) => void;
  className?: string;
  inputClassName?: string;
}

function EditableField({ value, onCommit, className, inputClassName }: EditableFieldProps) {
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
          className={cn("h-6 text-xs px-1.5 flex-1", inputClassName)}
        />
        <Button variant="ghost" size="icon-xs" onClick={commit} aria-label="אשר">
          <Check className="size-3" />
        </Button>
        <Button variant="ghost" size="icon-xs" onClick={cancel} aria-label="בטל">
          <X className="size-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("group flex items-center gap-1 min-w-0", className)}>
      <span className="truncate">{value}</span>
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={() => { setDraft(value); setEditing(true); }}
        aria-label="ערוך"
        className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0 text-muted-foreground"
      >
        <Pencil className="size-3" />
      </Button>
    </div>
  );
}

function TierBox({
  tier,
  dot,
  onChange,
}: {
  tier: TierState;
  dot: string;
  onChange: (updated: Partial<TierState>) => void;
}) {
  return (
    <div className="bg-background rounded-lg border border-border p-4 flex flex-col gap-2.5">
      {/* שם הקטגוריה */}
      <EditableField
        value={tier.label}
        onCommit={(label) => onChange({ label })}
        className="text-sm font-medium text-foreground"
      />

      {/* ספירה */}
      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold font-mono tabular-nums text-foreground leading-none">
          {tier.count}
        </span>
        <span className="text-xs text-muted-foreground mb-0.5">שחקנים</span>
      </div>

      <Separator />

      {/* פילטר */}
      <div className="flex items-center gap-1.5">
        <div className={cn("size-2 rounded-full shrink-0", dot)} />
        <EditableField
          value={tier.filter}
          onCommit={(filter) => onChange({ filter })}
          className="text-xs text-muted-foreground"
        />
      </div>
    </div>
  );
}

export function RatingDistribution() {
  const [tiers, setTiers] = useState<TierState[]>(initialTiers);

  function updateTier(index: number, updated: Partial<TierState>) {
    setTiers((prev) =>
      prev.map((t, i) => (i === index ? { ...t, ...updated } : t))
    );
  }

  const total = tiers.reduce((sum, t) => sum + t.count, 0);

  return (
    <Card className="rounded-xl shadow-none bg-muted/30 border-dashed">
      <CardHeader className="px-5 pt-5 pb-0 flex-row items-center justify-between space-y-0">
        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          התפלגות דירוגים
        </p>
        <p className="text-xs text-muted-foreground">
          {total} שחקנים · לחץ על עיפרון לעריכה
        </p>
      </CardHeader>

      <CardContent className="px-5 pb-5 pt-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {tiers.map((tier, i) => (
            <TierBox
              key={i}
              tier={tier}
              dot={dotColors[i]}
              onChange={(updated) => updateTier(i, updated)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
