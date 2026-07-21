"use client";

import { DoorOpen, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CATEGORY_META, type ScheduleEvent } from "@/lib/schedule-data";
import type { ConflictPartner } from "@/lib/conflicts";

interface ConflictsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The occurrence whose clashes are being shown. */
  event: ScheduleEvent | null;
  /** The activities it clashes with, over room and/or coach. */
  partners: ConflictPartner[];
}

/**
 * Lists every activity a clicked schedule occurrence clashes with — for each,
 * the clashing activity, whether the clash is over a room or an instructor
 * (with the shared resource name), and the clashing date + time.
 */
export function ConflictsDialog({
  open,
  onOpenChange,
  event,
  partners,
}: ConflictsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-start">
            קונפליקטים · {event?.title}
          </DialogTitle>
          <DialogDescription className="text-start">
            הפעילויות שמתנגשות עם מפגש זה על אותו חדר או מדריך באותה שעה.
          </DialogDescription>
        </DialogHeader>

        <ul className="space-y-2">
          {partners.map((partner) => (
            <li
              key={partner.parentId}
              className="rounded-xl border border-destructive/25 bg-destructive/5 p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{partner.title}</span>
                <Badge
                  variant="outline"
                  style={{
                    color: CATEGORY_META[partner.category].color,
                    borderColor: CATEGORY_META[partner.category].color,
                  }}
                >
                  {partner.category}
                </Badge>
              </div>

              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                {partner.kinds.includes("room") && (
                  <span className="flex items-center gap-1.5">
                    <DoorOpen className="size-3.5" />
                    חדר: {partner.roomName}
                  </span>
                )}
                {partner.kinds.includes("coach") && (
                  <span className="flex items-center gap-1.5">
                    <User className="size-3.5" />
                    מדריך: {partner.coachName}
                  </span>
                )}
              </div>

              <p dir="ltr" className="num mt-1 text-end text-xs text-muted-foreground/80">
                {partner.date} · {partner.start}–{partner.end}
              </p>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
