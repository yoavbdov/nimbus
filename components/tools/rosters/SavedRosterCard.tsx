"use client";

import { Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type RosterActivity,
  type SavedRoster,
} from "@/lib/rosters-data";

interface SavedRosterCardProps {
  roster: SavedRoster;
  activities: RosterActivity[];
  targetId?: string;
  onTargetChange: (targetId: string) => void;
  onExport: () => void;
  onRemove: () => void;
}

export function SavedRosterCard({
  roster,
  activities,
  targetId,
  onTargetChange,
  onExport,
  onRemove,
}: SavedRosterCardProps) {
  return (
    <div className="rounded-2xl neu-inset p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-0.5">
          <h3 className="text-sm font-semibold text-foreground">{roster.name}</h3>
          <p className="text-xs text-muted-foreground num">
            {roster.players.length} שחקנים · מתוך {roster.sourceName}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onRemove}
          aria-label="מחיקת רשימה שמורה"
          className="rounded-xl text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {roster.players.map((p) => (
          <span
            key={p.id}
            className="rounded-lg border border-foreground/10 bg-background/40 px-2 py-1 text-xs text-foreground/80"
          >
            {p.name}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-foreground/10 pt-3">
        <Select value={targetId ?? ""} onValueChange={onTargetChange}>
          <SelectTrigger className="h-8 w-44 gap-1.5 rounded-xl neu-inset border-0">
            <SelectValue placeholder="בחירת פעילות יעד" />
          </SelectTrigger>
          <SelectContent dir="rtl" position="popper">
            {activities.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          type="button"
          size="sm"
          onClick={onExport}
          disabled={!targetId}
          className="h-8 gap-1.5 rounded-xl"
        >
          <Send className="size-3.5" />
          ייצוא לפעילות
        </Button>
      </div>
    </div>
  );
}
