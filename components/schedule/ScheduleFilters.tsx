"use client";

import { Check, ChevronDown, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useFacetDropdown } from "@/hooks/schedule/useFacetDropdown";
import { cn } from "@/lib/utils";
import type { FacetKey } from "@/lib/schedule-data";

interface FacetDef {
  key: FacetKey;
  label: string;
}

interface ScheduleFiltersProps {
  facets: FacetDef[];
  facetOptions: Record<FacetKey, string[]>;
  facetFilters: Record<FacetKey, Set<string>>;
  onToggleValue: (key: FacetKey, value: string) => void;
  onClearFacet: (key: FacetKey) => void;
  onClearAll: () => void;
  activeCount: number;
}

export function ScheduleFilters({
  facets,
  facetOptions,
  facetFilters,
  onToggleValue,
  onClearFacet,
  onClearAll,
  activeCount,
}: ScheduleFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {facets.map((facet) => (
        <FacetDropdown
          key={facet.key}
          label={facet.label}
          options={facetOptions[facet.key]}
          selected={facetFilters[facet.key]}
          onToggle={(value) => onToggleValue(facet.key, value)}
          onClear={() => onClearFacet(facet.key)}
        />
      ))}

      {activeCount > 0 && (
        <Button
          type="button"
          variant="ghost"
          onClick={onClearAll}
          className="h-7 rounded-full px-2.5 text-[0.7rem] text-muted-foreground/70 hover:text-foreground"
        >
          <X className="size-3" />
          נקה הכל
        </Button>
      )}
    </div>
  );
}

function FacetDropdown({
  label,
  options,
  selected,
  onToggle,
  onClear,
}: {
  label: string;
  options: string[];
  selected: Set<string>;
  onToggle: (value: string) => void;
  onClear: () => void;
}) {
  const { query, setQuery, filtered } = useFacetDropdown(options);
  const count = selected.size;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className={cn(
            "h-8 rounded-full px-3 text-xs font-medium neu-raised-xs neu-interactive",
            count > 0 && "tint-indigo tint-text",
          )}
        >
          {label}
          {count > 0 && (
            <span className="num flex size-4 items-center justify-center rounded-full bg-primary text-[0.6rem] font-semibold text-primary-foreground">
              {count}
            </span>
          )}
          <ChevronDown className="size-3.5 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="start"
        sideOffset={8}
        dir="rtl"
        className="w-64 overflow-hidden rounded-2xl p-0 bg-popover/95 backdrop-blur-xl ring-1 ring-foreground/10 shadow-depth-xl"
      >
        {/* Header: centered facet label + live count, with clear pinned to the side */}
        <div className="relative flex items-center justify-center border-b border-foreground/8 px-3 py-3">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold tint-text">{label}</span>
            {count > 0 && (
              <span className="num flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[0.65rem] font-semibold text-primary-foreground">
                {count}
              </span>
            )}
          </div>
          {count > 0 && (
            <Button
              type="button"
              variant="ghost"
              onClick={onClear}
              className="absolute inset-s-2 h-auto gap-1 p-0 text-[0.7rem] text-muted-foreground/70 hover:bg-transparent hover:text-foreground"
            >
              <X className="size-3" />
              נקה
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="px-2.5 pt-2.5">
          <div className="flex items-center gap-2 rounded-xl bg-foreground/5 px-2.5 py-1.5 ring-1 ring-transparent focus-within:ring-primary/30 focus-within:bg-foreground/8 transition-colors">
            <Search className="size-3.5 shrink-0 text-muted-foreground/60" />
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`חיפוש ${label}…`}
              className="h-5 border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
            />
          </div>
        </div>

        {/* Options */}
        <div className="players-scroll max-h-64 overflow-y-auto p-1.5">
          {filtered.length === 0 ? (
            <p className="px-2 py-6 text-center text-xs text-muted-foreground/60">
              אין תוצאות
            </p>
          ) : (
            filtered.map((option) => {
              const checked = selected.has(option);
              return (
                <div
                  key={option}
                  role="option"
                  aria-selected={checked}
                  onClick={() => onToggle(option)}
                  className={cn(
                    "group/opt flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 text-start text-sm transition-colors",
                    checked
                      ? "bg-primary/10 font-medium text-foreground"
                      : "text-foreground/75 hover:bg-foreground/5",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-4 shrink-0 items-center justify-center rounded-md border transition-colors",
                      checked
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-foreground/25 group-hover/opt:border-foreground/40",
                    )}
                  >
                    {checked && <Check className="size-3" strokeWidth={3} />}
                  </span>
                  <span className="truncate">{option}</span>
                </div>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
