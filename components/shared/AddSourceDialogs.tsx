"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, ClipboardList, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 12, filter: "blur(4px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.32, ease },
  },
};

/** A roster, reduced to what the chooser needs to render one row. */
export interface RosterOption {
  id: string;
  name: string;
  count: number;
}

/** One large, animated choice card used by both dialogs below. */
function ChoiceCard({
  icon,
  title,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      variants={cardVariants}
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
      onClick={onClick}
      className="group/card flex w-full items-center gap-3 rounded-2xl neu-raised-xs neu-interactive bg-foreground/5 p-4 text-start"
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary transition-colors group-hover/card:bg-primary/25">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-foreground">
          {title}
        </span>
        <span className="block text-xs text-muted-foreground">
          {description}
        </span>
      </span>
      <ChevronRight className="size-4 shrink-0 rotate-180 text-foreground/40 transition-transform group-hover/card:-translate-x-0.5" />
    </motion.button>
  );
}

/**
 * Step 1 — asks where the people to add should come from: a saved roster, or
 * every member in the club. Purely presentational; both branches are handlers.
 */
export function AddSourceChoiceDialog({
  open,
  onOpenChange,
  noun,
  onChooseRoster,
  onChooseAll,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The plural label, e.g. "תלמידים" / "שחקנים" / "משתתפים". */
  noun: string;
  onChooseRoster: () => void;
  onChooseAll: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="max-w-md">
        <DialogHeader>
          <DialogTitle>הוספת {noun}</DialogTitle>
          <DialogDescription>מהיכן להוסיף את ה{noun}?</DialogDescription>
        </DialogHeader>

        <motion.div
          variants={listVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-2.5"
        >
          <ChoiceCard
            icon={<ClipboardList className="size-5" />}
            title="מרשימה מוכנה מראש"
            description={`בחרו רשימת ${noun} ששמרתם מראש`}
            onClick={onChooseRoster}
          />
          <ChoiceCard
            icon={<Users className="size-5" />}
            title="מכלל המועדון"
            description={`בחרו מתוך כלל ה${noun} במועדון`}
            onClick={onChooseAll}
          />
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Step 2 (roster branch) — lists the saved rosters to pick one from. Selecting
 * a roster hands its id back to the parent, which pre-selects its members.
 */
export function RosterChoiceDialog({
  open,
  onOpenChange,
  noun,
  rosters,
  onSelect,
  onBack,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  noun: string;
  rosters: RosterOption[];
  onSelect: (rosterId: string) => void;
  onBack: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="max-w-md">
        <DialogHeader>
          <DialogTitle>בחירת רשימה מוכנה</DialogTitle>
          <DialogDescription>
            בחרו את הרשימה שממנה להוסיף {noun}.
          </DialogDescription>
        </DialogHeader>

        {rosters.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            אין רשימות שמורות עדיין.
          </p>
        ) : (
          <div className="players-scroll -mx-1 max-h-[50vh] overflow-y-auto px-1">
            <motion.div
              variants={listVariants}
              initial="hidden"
              animate="show"
              className="flex flex-col gap-2"
            >
              <AnimatePresence initial={false}>
                {rosters.map((r) => (
                  <ChoiceCard
                    key={r.id}
                    icon={<ClipboardList className="size-5" />}
                    title={r.name}
                    description={`${r.count} ${noun}`}
                    onClick={() => onSelect(r.id)}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
        )}

        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          className={cn(
            "h-9 w-fit justify-center gap-1.5 rounded-xl px-3.5",
            "text-sm font-normal text-foreground/70",
          )}
        >
          <ChevronRight className="size-4" />
          חזרה
        </Button>
      </DialogContent>
    </Dialog>
  );
}
