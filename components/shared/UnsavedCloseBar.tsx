"use client";

import { useEffect, useRef } from "react";
import { motion, useAnimationControls } from "framer-motion";
import { Pencil, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

const ease = [0.22, 1, 0.36, 1] as const;

interface UnsavedCloseBarProps {
  // Increments on every re-attempt to close while the bar is already open; each
  // bump replays a shake to reinforce that a choice ("save" or "discard") is due.
  nudge: number;
  onConfirmClose: () => void;
  onCancelClose: () => void;
}

/**
 * The "יש שינויים שלא נשמרו" confirmation shown in a registration modal footer
 * when a close is attempted with staged edits. It slides in on open, and shakes
 * whenever `nudge` changes — i.e. when the user tries to close again (X / Escape
 * / backdrop) instead of picking one of the two actions.
 */
export function UnsavedCloseBar({
  nudge,
  onConfirmClose,
  onCancelClose,
}: UnsavedCloseBarProps) {
  const controls = useAnimationControls();
  // The nudge value already reflected in the UI; a change means "shake now".
  const seenNudge = useRef(nudge);

  useEffect(() => {
    if (nudge === seenNudge.current) return;
    seenNudge.current = nudge;
    void controls.start({
      x: [0, -8, 8, -6, 6, -3, 3, 0],
      transition: { duration: 0.45, ease: "easeInOut" },
    });
  }, [nudge, controls]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.28, ease }}
      className="w-full"
    >
      <motion.div
        animate={controls}
        className="flex w-full flex-wrap items-center justify-between gap-3 rounded-xl bg-destructive/10 px-3 py-2 ring-1 ring-destructive/20"
      >
        <span className="flex items-center gap-2 text-sm text-destructive">
          <TriangleAlert className="size-4 shrink-0" />
          יש שינויים שלא נשמרו. לצאת בלי לשמור?
        </span>
        {/* ms-auto keeps the buttons pinned to the inline-end (left in RTL) even
            in a narrow modal where the bar wraps them onto their own line —
            without it, a wrapped line's lone item falls back to the start. */}
        <div className="flex shrink-0 gap-2 ms-auto">
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onConfirmClose}
            className="h-8 rounded-lg px-3 text-xs"
          >
            צא בלי לשמור
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancelClose}
            className="h-8 gap-1.5 rounded-lg border-foreground/15 bg-background/70 px-3 text-xs font-medium shadow-sm hover:bg-background hover:text-foreground"
          >
            <Pencil className="size-3.5" />
            המשך עריכה
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
