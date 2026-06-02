"use client";

import { motion } from "framer-motion";
import { TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AttendanceSession } from "@/lib/attendance-data";

interface AttendanceSessionListProps {
  sessions: AttendanceSession[];
  activeId: string;
  missingById: Record<string, boolean>;
  onSelect: (id: string) => void;
}

export function AttendanceSessionList({
  sessions,
  activeId,
  missingById,
  onSelect,
}: AttendanceSessionListProps) {
  return (
    <div className="neu-inset rounded-2xl p-2 space-y-1">
      <p className="px-2 py-1.5 text-[0.65rem] uppercase tracking-[0.18em] text-foreground/50">
        מועדים
      </p>
      {sessions.map((ses) => {
        const active = ses.id === activeId;
        const missing = missingById[ses.id];
        return (
          <button
            key={ses.id}
            type="button"
            onClick={() => onSelect(ses.id)}
            aria-pressed={active}
            className={cn(
              "relative w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-start text-sm transition-all duration-200",
              active
                ? "text-foreground font-medium"
                : "text-foreground/70 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-500/10 hover:neu-raised-xs hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.98]",
            )}
          >
            {active && (
              <motion.span
                layoutId="attendance-session-active"
                className="absolute inset-0 rounded-xl neu-pressed"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            <span className="relative truncate">{ses.label}</span>
            {missing && (
              <TriangleAlert
                className="relative size-4 shrink-0 text-amber-500"
                aria-label="חסרה נוכחות"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
