"use client";

import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ToolBackLink } from "@/components/tools/ToolBackLink";
import { CompletedActivitiesTable } from "@/components/tools/cleanup/CompletedActivitiesTable";
import { DeleteConfirmDialog } from "@/components/tools/cleanup/DeleteConfirmDialog";
import { ActivityFormModal } from "@/components/activities/ActivityFormModal";
import { TournamentFormModal } from "@/components/tournaments/TournamentFormModal";
import { EventFormModal } from "@/components/events/EventFormModal";
import { useActivityCleanup } from "@/hooks/tools/useActivityCleanup";
import { useCleanupDetails } from "@/hooks/tools/useCleanupDetails";

export function ActivityCleanupView() {
  const { items, selection, confirming, requestDelete, cancelDelete, confirmDelete } =
    useActivityCleanup();

  const details = useCleanupDetails();

  return (
    <div className="space-y-4">
      <ToolBackLink />

      <Card className="tint-indigo glass shadow-depth-xl border-0 ring-0 rounded-3xl gap-0 py-0 overflow-hidden">
        <div className="h-1 tint-bar" />
        <div className="p-6 space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-1.5">
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight tint-text leading-none">
                ארכיון פעילויות
              </h1>
              <p className="text-xs text-muted-foreground/80 num">
                {items.length} פעילויות שהסתיימו · חוגים, אירועים ותחרויות
              </p>
            </div>

            <Button
              type="button"
              onClick={requestDelete}
              disabled={selection.selectedCount === 0}
              className="gap-1.5 rounded-xl bg-destructive text-white hover:bg-destructive/90"
            >
              <Trash2 className="size-4" />
              מחיקת מסומנים ({selection.selectedCount})
            </Button>
          </div>

          <Separator className="bg-foreground/8" />

          <div className="neu-inset rounded-2xl p-2">
            <motion.div
              initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <CompletedActivitiesTable
                items={items}
                selection={selection}
                onOpenDetails={details.open}
              />
            </motion.div>
          </div>
        </div>
      </Card>

      <DeleteConfirmDialog
        open={confirming}
        count={selection.selectedCount}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
      />

      {/* Real details views, reusing the app's own form modals. */}
      <ActivityFormModal addActivity={details.activityForm} />
      <TournamentFormModal addTournament={details.tournamentForm} />
      <EventFormModal addEvent={details.eventForm} />
    </div>
  );
}
