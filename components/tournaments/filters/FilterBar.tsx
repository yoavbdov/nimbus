"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CalendarClock, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AddFilterPopover } from "@/components/tournaments/filters/AddFilterPopover";
import { FilterChip } from "@/components/tournaments/filters/FilterChip";
import { cn } from "@/lib/utils";
import type { TournamentFilter, FieldOptions } from "@/lib/tournaments-filters";

interface FilterBarProps {
  search: string;
  filters: TournamentFilter[];
  todayOnly: boolean;
  onSearchChange: (v: string) => void;
  onAdd: (filter: TournamentFilter) => void;
  onUpdate: (id: string, next: TournamentFilter) => void;
  onRemove: (id: string) => void;
  onToggleToday: () => void;
  onClearAll: () => void;
  /** Live dropdown options for the שופט/חדר fields. */
  options?: FieldOptions;
}

export function FilterBar({
  search,
  filters,
  todayOnly,
  onSearchChange,
  onAdd,
  onUpdate,
  onRemove,
  onToggleToday,
  onClearAll,
  options,
}: FilterBarProps) {
  const hasAny = filters.length > 0 || search.length > 0 || todayOnly;

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute top-1/2 -translate-y-1/2 inset-s-3 size-4 text-foreground/50 pointer-events-none" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="חיפוש לפי שם תחרות או שופט…"
          className="h-11 ps-10 pe-3 text-sm neu-inset border-0 rounded-2xl"
        />
      </div>

      <div className="flex items-center gap-2">
        <AddFilterPopover onAdd={onAdd} options={options} />
        <Button
          type="button"
          variant="ghost"
          onClick={onToggleToday}
          aria-pressed={todayOnly}
          className={cn(
            "group/btn relative overflow-hidden tint-indigo h-9 rounded-xl gap-1.5 px-3.5 text-xs font-medium neu-raised-xs neu-interactive",
            todayOnly && "tint-glow bg-(--tint-soft) text-foreground",
          )}
        >
          <span className="absolute inset-x-0 top-0 h-1 tint-bar origin-center scale-x-0 group-hover/btn:scale-x-100 transition-transform duration-700 ease-out" />
          <CalendarClock className="size-4" />
          תחרויות היום
        </Button>
        {hasAny && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="h-9 rounded-xl text-xs gap-1.5 px-3 text-foreground/60 hover:text-foreground"
          >
            <X className="size-3.5" />
            נקה הכל
          </Button>
        )}
      </div>

      <AnimatePresence initial={false}>
        {filters.length > 0 && (
          <motion.div
            key="chips"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[0.65rem] uppercase tracking-[0.14em] text-foreground/50 shrink-0">
                פילטרים פעילים
              </span>
              <Separator orientation="vertical" className="h-4 bg-foreground/15" />
              <div className="flex flex-wrap items-center gap-1.5">
                <AnimatePresence initial={false}>
                  {filters.map((f) => (
                    <FilterChip
                      key={f.id}
                      filter={f}
                      onUpdate={(next) => onUpdate(f.id, next)}
                      onRemove={() => onRemove(f.id)}
                      options={options}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
