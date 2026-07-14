"use client";

import { motion } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Player } from "@/lib/players-data";

const ease = [0.22, 1, 0.36, 1] as const;

const rowVariants = {
  hidden: { opacity: 0, y: 8, filter: "blur(4px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.28, ease },
  },
};

interface EnrolledPersonRowProps {
  person: Player;
  /** Why this person is outside the activity's criteria; empty = a good fit. */
  mismatchReasons: string[];
  onRemove: () => void;
  removeLabel: string;
  /** The dialog element the mismatch tooltip should portal into. */
  container: HTMLElement | null;
}

/**
 * One enrolled player/student in an activity's roster: an initial avatar, name
 * and age/rating meta, plus a remove button. A criteria mismatch surfaces an
 * amber warning triangle whose tooltip spells out every failing bound. The whole
 * row lifts and brightens on hover.
 */
export function EnrolledPersonRow({
  person,
  mismatchReasons,
  onRemove,
  removeLabel,
  container,
}: EnrolledPersonRowProps) {
  const mismatch = mismatchReasons.length > 0;

  return (
    <motion.div
      layout
      variants={rowVariants}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 420, damping: 32 }}
      className={cn(
        "group/row flex items-center justify-between gap-2 rounded-xl neu-inset bg-foreground/5 px-2.5 py-2 transition-colors",
        "hover:bg-primary/10 hover:shadow-md",
        mismatch && "bg-amber-500/5 hover:bg-amber-500/10",
      )}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-transform group-hover/row:scale-110",
            mismatch
              ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
              : "bg-primary/15 text-primary",
          )}
          aria-hidden
        >
          {person.name.charAt(0)}
        </span>

        <div className="flex min-w-0 items-center gap-2">
          {mismatch && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label="לא עומד בקריטריונים"
                  className="shrink-0 cursor-help rounded-md p-0.5 text-amber-600 outline-none transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-amber-500/50 dark:text-amber-400"
                >
                  <AlertTriangle className="size-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent
                dir="rtl"
                container={container}
                className="text-start"
              >
                <p className="mb-1 flex items-center gap-1.5 font-semibold text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="size-3.5" />
                  לא עומד בקריטריונים
                </p>
                <ul className="space-y-0.5 text-foreground/80">
                  {mismatchReasons.map((reason) => (
                    <li key={reason} className="flex items-start gap-1.5">
                      <span className="mt-1 size-1 shrink-0 rounded-full bg-amber-500" />
                      {reason}
                    </li>
                  ))}
                </ul>
              </TooltipContent>
            </Tooltip>
          )}
          <span className="truncate text-sm font-medium text-foreground/90">
            {person.name}
          </span>
          <span className="shrink-0 rounded-md bg-foreground/8 px-1.5 py-0.5 text-xs text-muted-foreground num">
            גיל {person.age} · {person.israeliRating}
          </span>
        </div>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onRemove}
        aria-label={removeLabel}
        className="size-7 shrink-0 rounded-lg text-foreground/40 opacity-60 transition hover:bg-destructive/15 hover:text-destructive group-hover/row:opacity-100"
      >
        <X className="size-4" />
      </Button>
    </motion.div>
  );
}
