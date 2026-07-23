"use client";

import { useState } from "react";
import { AlertTriangle, ChevronLeft, PackageX } from "lucide-react";
import { ActivityWarningsDialog } from "@/components/schedule/ActivityWarningsDialog";
import type { DraftConflict } from "@/lib/conflicts";
import type { EquipmentDemand } from "@/lib/equipment-conflicts";
import { cn } from "@/lib/utils";

interface ActivityWarningsBarProps {
  /** Room / instructor clashes with other activities. */
  conflicts: DraftConflict[];
  /** Items the club doesn't have enough of while this activity runs. */
  shortages: EquipmentDemand[];
}

/**
 * The warnings strip above a modal's tabs: ONE line saying what is wrong, which
 * opens {@link ActivityWarningsDialog} with the full breakdown.
 *
 * The detail used to sit inline, and the two banners ran to ~220px — on a laptop
 * that left the tab body barely 220px, so a form that fits on one screen needed
 * 430px of scrolling. Moving it into a dialog costs the form ~34px instead, and
 * the detail gets a whole screen of its own. Nothing is hidden: the counts and
 * the short item names are on the bar itself.
 *
 * The open flag is local UI state (as with the modals' own SearchSelect) — no
 * business logic lives here; both engines run in the parent modal's hook.
 */
export function ActivityWarningsBar({
  conflicts,
  shortages,
}: ActivityWarningsBarProps) {
  const [open, setOpen] = useState(false);
  const total = conflicts.length + shortages.length;
  if (total === 0) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "flex w-full shrink-0 items-center gap-2 rounded-xl px-3 py-1.5 text-xs",
          "border border-amber-500/30 bg-amber-500/5",
          "transition-colors hover:bg-amber-500/10",
          "focus-visible:ring-2 focus-visible:ring-amber-500/40 focus-visible:outline-none",
        )}
      >
        <AlertTriangle className="size-3.5 shrink-0 text-amber-600 dark:text-amber-400" />

        <span className="flex min-w-0 flex-1 items-center gap-x-2 truncate whitespace-nowrap text-start">
          {conflicts.length > 0 && (
            <span className="text-destructive">
              <span className="num font-semibold">{conflicts.length}</span>{" "}
              {conflicts.length === 1 ? "התנגשות" : "התנגשויות"} בלוח הזמנים
            </span>
          )}
          {conflicts.length > 0 && shortages.length > 0 && (
            <span aria-hidden className="text-foreground/25">
              ·
            </span>
          )}
          {shortages.length > 0 && (
            <span className="flex items-center gap-1 text-amber-700 dark:text-amber-300">
              <PackageX className="size-3.5 shrink-0" />
              חוסר ב{shortages.map((s) => s.equipmentId).join(", ")}
            </span>
          )}
        </span>

        <span className="shrink-0 text-[0.7rem] font-medium text-foreground/60">
          הצג פרטים
        </span>
        <ChevronLeft className="size-3.5 shrink-0 text-foreground/50" />
      </button>

      <ActivityWarningsDialog
        open={open}
        onOpenChange={setOpen}
        conflicts={conflicts}
        shortages={shortages}
      />
    </>
  );
}
