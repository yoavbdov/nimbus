"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AddFilterPopover } from "@/components/rooms/filters/AddFilterPopover";
import { FilterChip } from "@/components/rooms/filters/FilterChip";
import type { Filter, FilterSchema } from "@/lib/filters/schema";

interface RoomsFilterBarProps {
  search: string;
  placeholder: string;
  onSearchChange: (v: string) => void;
  /** Advanced filter controls — omit to render a search-only bar. */
  schema?: FilterSchema;
  filters?: Filter[];
  onAdd?: (filter: Filter) => void;
  onUpdate?: (id: string, next: Filter) => void;
  onRemove?: (id: string) => void;
  onClearAll?: () => void;
}

export function RoomsFilterBar({
  search,
  placeholder,
  onSearchChange,
  schema,
  filters,
  onAdd,
  onUpdate,
  onRemove,
  onClearAll,
}: RoomsFilterBarProps) {
  // When no filter handlers are wired up, render a plain search box only.
  if (!schema || !filters || !onAdd || !onUpdate || !onRemove || !onClearAll) {
    return (
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute top-1/2 -translate-y-1/2 inset-s-3 size-4 text-foreground/50 pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={placeholder}
            className="h-11 ps-10 pe-3 text-sm neu-inset border-0 rounded-2xl"
          />
        </div>
      </div>
    );
  }

  const hasAny = filters.length > 0 || search.length > 0;

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute top-1/2 -translate-y-1/2 inset-s-3 size-4 text-foreground/50 pointer-events-none" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="h-11 ps-10 pe-3 text-sm neu-inset border-0 rounded-2xl"
        />
      </div>

      <div className="flex items-center gap-2">
        <AddFilterPopover schema={schema} onAdd={onAdd} />
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
                      schema={schema}
                      filter={f}
                      onUpdate={(next) => onUpdate(f.id, next)}
                      onRemove={() => onRemove(f.id)}
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
