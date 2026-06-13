"use client";

import { motion } from "framer-motion";
import { Toggle } from "@/components/ui/toggle";
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
      {categories.map((category, i) => {
        const meta = CATEGORY_META[category];
        const hidden = hiddenCategories.has(category);
        return (
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
            whileTap={{ scale: 0.94 }}
          >
          <Toggle
            pressed={!hidden}
            onPressedChange={() => onToggleCategory(category)}
            className={cn(
              "h-auto gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all duration-150",
              hidden
                ? "border-transparent bg-foreground/5 text-muted-foreground/50 hover:bg-foreground/8"
                : "hover:brightness-95",
            )}
            style={
              hidden
                ? undefined
                : {
                    // inline styles win over the Toggle's base bg utilities
                    backgroundColor: meta.soft,
                    color: meta.color,
                    borderColor: "transparent",
                  }
            }
          >
            <span
              className={cn(
                "size-2.5 rounded-full transition-all",
                hidden && "ring-1 ring-inset ring-muted-foreground/40",
              )}
              style={{
                backgroundColor: hidden ? "transparent" : meta.color,
              }}
            />
            {meta.label}
          </Toggle>
          </motion.div>
        );
      })}
    </div>
  );
}
