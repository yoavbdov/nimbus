"use client";

import { Popover, PopoverAnchor } from "@/components/ui/popover";
import { ActivityActionsMenuContent } from "@/components/activities/ActivityActionsMenu";
import { TournamentActionsMenuContent } from "@/components/tournaments/TournamentActionsMenu";
import { LeagueActionsMenuContent } from "@/components/leagues/LeagueActionsMenu";
import { RowActionsMenuContent } from "@/components/shared/RowActionsMenu";
import { eventActions } from "@/lib/row-actions";
import type { EventCategory } from "@/lib/schedule-data";

interface ScheduleEventMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  virtualRef: React.ComponentProps<typeof PopoverAnchor>["virtualRef"];
  /** Category of the clicked event — picks which module's menu to show. */
  category?: EventCategory;
  onSelect: (action: { id: string }) => void;
}

/**
 * The actions menu that opens when a schedule event is clicked. It mirrors the
 * exact dropdown from each management module, picked by the event's category:
 * חוג → חוגים, תחרות → תחרויות, אירוע → אירועים, ליגה → ליגות.
 */
export function ScheduleEventMenu({
  open,
  onOpenChange,
  virtualRef,
  category,
  onSelect,
}: ScheduleEventMenuProps) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverAnchor virtualRef={virtualRef} />
      {category === "חוג" && <ActivityActionsMenuContent onSelect={onSelect} />}
      {category === "תחרות" && <TournamentActionsMenuContent onSelect={onSelect} />}
      {category === "ליגה" && <LeagueActionsMenuContent onSelect={onSelect} />}
      {category === "אירוע" && (
        <RowActionsMenuContent actions={eventActions} onSelect={onSelect} />
      )}
    </Popover>
  );
}
