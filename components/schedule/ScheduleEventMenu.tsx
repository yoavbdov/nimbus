"use client";

import { AlertTriangle } from "lucide-react";
import { Popover, PopoverAnchor } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CourseActionsMenuContent } from "@/components/courses/CourseActionsMenu";
import { TournamentActionsMenuContent } from "@/components/tournaments/TournamentActionsMenu";
import { LeagueActionsMenuContent } from "@/components/leagues/LeagueActionsMenu";
import { RowActionsMenuContent } from "@/components/shared/RowActionsMenu";
import { eventActions } from "@/lib/row-actions";
import type { EventCategory } from "@/lib/schedule-data";
import { cn } from "@/lib/utils";

interface ScheduleEventMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  virtualRef: React.ComponentProps<typeof PopoverAnchor>["virtualRef"];
  /** Category of the clicked event — picks which module's menu to show. */
  category?: EventCategory;
  /** How many activities the clicked occurrence clashes with (0 = none). */
  conflictCount?: number;
  onShowConflicts?: () => void;
  onSelect: (action: { id: string }) => void;
}

/** The "הצג קונפליקטים" entry shown atop the menu when the block has clashes. */
function ConflictsMenuItem({
  count,
  onClick,
}: {
  count: number;
  onClick: () => void;
}) {
  return (
    <>
      <Button
        variant="ghost"
        onClick={onClick}
        className={cn(
          "group w-full justify-start gap-2.5 rounded-lg px-2.5 py-2 h-auto",
          "text-sm font-normal text-destructive/90",
          "hover:bg-destructive/20 dark:hover:bg-destructive/40 hover:text-destructive hover:pe-1",
          "transition-all duration-150",
        )}
      >
        <AlertTriangle className="size-4 text-destructive/70 transition-colors group-hover:text-destructive" />
        <span className="flex-1 text-start">הצג קונפליקטים ({count})</span>
      </Button>
      <Separator className="my-1 bg-linear-to-r from-transparent via-foreground/15 to-transparent" />
    </>
  );
}

/**
 * The actions menu that opens when a schedule event is clicked. It mirrors the
 * exact dropdown from each management module, picked by the event's category:
 * חוג → חוגים, תחרות → תחרויות, אירוע → אירועים, ליגה → ליגות. When the clicked
 * occurrence clashes (room/coach), a "הצג קונפליקטים" entry is added on top.
 */
export function ScheduleEventMenu({
  open,
  onOpenChange,
  virtualRef,
  category,
  conflictCount = 0,
  onShowConflicts,
  onSelect,
}: ScheduleEventMenuProps) {
  const header =
    conflictCount > 0 && onShowConflicts ? (
      <ConflictsMenuItem count={conflictCount} onClick={onShowConflicts} />
    ) : undefined;

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverAnchor virtualRef={virtualRef} />
      {category === "חוג" && (
        <CourseActionsMenuContent onSelect={onSelect} header={header} />
      )}
      {category === "תחרות" && (
        <TournamentActionsMenuContent onSelect={onSelect} header={header} />
      )}
      {category === "ליגה" && <LeagueActionsMenuContent onSelect={onSelect} />}
      {category === "אירוע" && (
        <RowActionsMenuContent
          actions={eventActions}
          onSelect={onSelect}
          header={header}
        />
      )}
    </Popover>
  );
}
