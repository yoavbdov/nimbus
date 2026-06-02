"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AttendanceClass } from "@/lib/attendance-data";

interface AttendanceClassListProps {
  classes: AttendanceClass[];
  activeId: string;
  missingCount: Record<string, number>;
  onSelect: (id: string) => void;
}

export function AttendanceClassList({
  classes,
  activeId,
  missingCount,
  onSelect,
}: AttendanceClassListProps) {
  return (
    <div className="neu-inset rounded-2xl p-2 space-y-1">
      <p className="px-2 py-1.5 text-[0.65rem] uppercase tracking-[0.18em] text-foreground/50">
        חוגים
      </p>
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
              <span className="block text-sm font-medium truncate">{cls.name}</span>
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
