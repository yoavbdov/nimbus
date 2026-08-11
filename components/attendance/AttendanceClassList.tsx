"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AttendanceClass } from "@/lib/attendance-data";

interface AttendanceClassListProps {
  classes: AttendanceClass[];
  activeId: string;
  missingCount: Record<string, number>;
  /** Whether archived חוגים are currently revealed in the list. */
  showArchived: boolean;
  /** How many archived חוגים exist — the toggle hides itself when zero. */
  archivedCount: number;
  onToggleArchived: () => void;
  onSelect: (id: string) => void;
}

export function AttendanceClassList({
  classes,
  activeId,
  missingCount,
  showArchived,
  archivedCount,
  onToggleArchived,
  onSelect,
}: AttendanceClassListProps) {
  return (
    <div className="neu-inset rounded-2xl p-2 space-y-1">
      <div className="flex items-center justify-between gap-2 px-2 py-1.5">
        <p className="text-[0.65rem] uppercase tracking-[0.18em] text-foreground/50">
          חוגים
        </p>
        {archivedCount > 0 && (
          <button
            type="button"
            onClick={onToggleArchived}
            aria-pressed={showArchived}
            title={showArchived ? "הסתר חוגים בארכיון" : "הצג חוגים בארכיון"}
            className={cn(
              "group/arch relative overflow-hidden tint-indigo",
              "flex items-center gap-1.5 h-7 rounded-xl px-2.5 text-[0.7rem] font-medium",
              "neu-raised-xs neu-interactive transition-transform duration-200",
              "hover:-translate-y-0.5 hover:scale-[1.03] active:scale-95",
              showArchived && "text-indigo-600 dark:text-indigo-400 neu-pressed",
            )}
          >
            <span className="absolute inset-x-0 top-0 h-0.5 tint-bar origin-center scale-x-0 group-hover/arch:scale-x-100 transition-transform duration-500 ease-out" />
            <motion.span
              animate={{ rotate: showArchived ? 45 : 0 }}
              transition={{ type: "spring", stiffness: 420, damping: 26 }}
              className="flex"
            >
              <Plus className="size-3.5" />
            </motion.span>
            <span>ארכיון</span>
            <Badge className="min-w-4 h-4 px-1 rounded-full justify-center num bg-foreground/10 text-foreground/60 border-0 text-[0.6rem]">
              {archivedCount}
            </Badge>
          </button>
        )}
      </div>
      {classes.map((cls) => {
        const active = cls.id === activeId;
        const missing = missingCount[cls.id] ?? 0;
        return (
          <button
            key={cls.id}
            type="button"
            onClick={() => onSelect(cls.id)}
            aria-pressed={active}
            className={cn(
              "relative w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-start transition-all duration-200",
              active
                ? "text-foreground"
                : "text-foreground/70 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-500/10 hover:neu-raised-xs hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.98]",
            )}
          >
            {active && (
              <motion.span
                layoutId="attendance-class-active"
                className="absolute inset-0 rounded-xl neu-pressed"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            <span className="relative min-w-0">
              <span className="flex items-center gap-1.5">
                <span className="block text-sm font-medium truncate">{cls.name}</span>
                {cls.archived && (
                  <Badge className="shrink-0 h-4 px-1.5 rounded-full text-[0.6rem] bg-foreground/10 text-foreground/60 border-0">
                    ארכיון
                  </Badge>
                )}
              </span>
              <span className="block text-xs text-foreground/50 truncate">
                {cls.coach}
              </span>
            </span>
            {missing > 0 && (
              <Badge
                className="relative shrink-0 min-w-5 h-5 px-1.5 rounded-full justify-center num bg-amber-500/15 text-amber-600 dark:text-amber-400 border-0"
                title={`${missing} מועדים חסרים`}
              >
                {missing}
              </Badge>
            )}
          </button>
        );
      })}
    </div>
  );
}
