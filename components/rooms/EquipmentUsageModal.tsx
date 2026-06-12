"use client";

import { motion } from "framer-motion";
import { CalendarHeart, GraduationCap, Trophy } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { EquipmentSlot } from "@/lib/equipment-availability";
import type { EquipmentUsage, EquipmentUsageKind } from "@/lib/equipment-usage";

const ease = [0.22, 1, 0.36, 1] as const;

const bodyVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.04 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10, filter: "blur(4px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.3, ease },
  },
};

const kindMeta: Record<
  EquipmentUsageKind,
  { icon: React.ElementType; className: string }
> = {
  חוג: { icon: GraduationCap, className: "text-sky-600 dark:text-sky-400" },
  תחרות: { icon: Trophy, className: "text-amber-600 dark:text-amber-400" },
  אירוע: {
    icon: CalendarHeart,
    className: "text-violet-600 dark:text-violet-400",
  },
};

interface EquipmentUsageModalProps {
  /** The opened equipment + slot + users, or null when the modal is closed. */
  usage: { name: string; slot: EquipmentSlot; items: EquipmentUsage[] } | null;
  onOpenChange: (open: boolean) => void;
}

export function EquipmentUsageModal({
  usage,
  onOpenChange,
}: EquipmentUsageModalProps) {
  return (
    <Dialog open={usage !== null} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="max-w-md">
        <DialogHeader>
          <DialogTitle>מי משתמש ב{usage?.name ?? "ציוד"}</DialogTitle>
          <DialogDescription>
            {usage && (
              <>
                המשתמשים בשעות{" "}
                <span className="num">
                  {usage.slot.startTime}–{usage.slot.endTime}
                </span>{" "}
                בתאריך <span className="num">{usage.slot.date}</span>.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {usage && usage.items.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            אף אחד לא משתמש בציוד הזה בשעה שנבחרה.
          </p>
        ) : (
          <div className="players-scroll max-h-80 overflow-y-auto">
            <motion.ul
              className="flex flex-col gap-1.5 pe-1"
              variants={bodyVariants}
              initial="hidden"
              animate="show"
            >
              {usage?.items.map((item) => {
                const { icon: Icon, className } = kindMeta[item.kind];
                return (
                  <motion.li
                    key={`${item.kind}-${item.id}`}
                    variants={itemVariants}
                    className="flex items-center justify-between gap-2 rounded-xl bg-foreground/5 px-3 py-2.5"
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon className={cn("size-4 shrink-0", className)} />
                      <span className="text-sm font-medium text-foreground">
                        {item.name}
                      </span>
                      <Badge
                        variant="secondary"
                        className="rounded-full bg-foreground/8 px-2 py-0.5 text-[0.7rem] font-normal text-foreground/70"
                      >
                        {item.kind}
                      </Badge>
                    </span>
                    <span className="text-xs text-foreground/70">
                      <span className="num font-semibold text-foreground">
                        {item.units}
                      </span>{" "}
                      {item.units === 1 ? "יחידה" : "יחידות"}
                    </span>
                  </motion.li>
                );
              })}
            </motion.ul>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
