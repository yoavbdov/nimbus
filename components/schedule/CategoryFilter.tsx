"use client";

import { CATEGORY_META, type EventCategory } from "@/lib/schedule-data";
import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  categories: EventCategory[];
  hiddenCategories: Set<EventCategory>;
  onToggleCategory: (category: EventCategory) => void;
}

/** The category legend — each chip toggles its category on/off in the views. */
export function CategoryFilter({
  categories,
  hiddenCategories,
  onToggleCategory,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {categories.map((category) => {
        const meta = CATEGORY_META[category];
        const hidden = hiddenCategories.has(category);
        return (
          <button
            key={category}
            type="button"
            onClick={() => onToggleCategory(category)}
            aria-pressed={!hidden}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.7rem] transition-all duration-150",
              hidden
                ? "text-muted-foreground/50 neu-pressed"
                : "text-foreground/80 neu-raised-xs neu-interactive",
            )}
          >
            <span
              className="size-2 rounded-full transition-opacity"
              style={{ backgroundColor: meta.color, opacity: hidden ? 0.3 : 1 }}
            />
            {meta.label}
          </button>
        );
      })}
    </div>
  );
}
