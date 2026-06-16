"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ToolTab<T extends string> {
  key: T;
  label: string;
  icon: React.ElementType;
}

interface ToolTabsProps<T extends string> {
  /** Unique id so multiple tab bars can animate independently. */
  layoutId: string;
  tabs: ToolTab<T>[];
  value: T;
  onChange: (value: T) => void;
}

/** Pill-style tab switcher matching the rest of the app (see SupportView). */
export function ToolTabs<T extends string>({
  layoutId,
  tabs,
  value,
  onChange,
}: ToolTabsProps<T>) {
  return (
    <div className="tint-indigo inline-flex items-center gap-1 p-1 rounded-2xl neu-inset w-fit">
      {tabs.map(({ key, label, icon: Icon }) => {
        const active = value === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            aria-pressed={active}
            className={cn(
              "relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200",
              active
                ? "text-foreground"
                : "text-foreground/60 hover:text-foreground",
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-xl neu-raised-xs bg-(--tint-soft)"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <Icon className={cn("relative z-10 size-4", active && "tint-text")} />
            <span className="relative z-10">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
