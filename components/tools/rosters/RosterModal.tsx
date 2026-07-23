"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Pencil, Plus, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EnrolledPersonRow } from "@/components/shared/EnrolledPersonRow";
import { PeoplePickerDialog } from "@/components/shared/PeoplePickerDialog";
import type { RosterModalMode } from "@/hooks/tools/useRosters";
import type { Player } from "@/lib/players-data";

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

interface RosterModalProps {
  open: boolean;
  mode: RosterModalMode;
  onCancel: () => void;
  onConfirm: () => void;
  saving: boolean;
  rosterName: string;
  members: Player[];
  onRename: () => void;
  onRemoveMember: (id: string) => void;
  availablePlayers: Player[];
  pickerOpen: boolean;
  onPickerOpenChange: (open: boolean) => void;
  onOpenPicker: () => void;
  checkedIds: string[];
  onToggleChecked: (id: string) => void;
  onConfirmMembers: () => void;
}

/**
 * One player list, open for filling in (a brand-new list) or editing (a saved
 * one) — the exact same modal either way. Everything is edited in the parent's
 * draft and written only when the user confirms, so a new list is created only
 * on הוסף and cancelling an edit leaves the saved list untouched.
 *
 * The members list and the add-players picker are the very same components the
 * course modal uses for its students tab, so browsing, filtering, sorting and
 * removing behave identically in both places.
 */
export function RosterModal({
  open,
  mode,
  onCancel,
  onConfirm,
  saving,
  rosterName,
  members,
  onRename,
  onRemoveMember,
  availablePlayers,
  pickerOpen,
  onPickerOpenChange,
  onOpenPicker,
  checkedIds,
  onToggleChecked,
  onConfirmMembers,
}: RosterModalProps) {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <DialogContent
        ref={setContainer}
        dir="rtl"
        className="top-[6vh] flex max-h-[88vh] max-w-lg translate-y-0 flex-col"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {rosterName}
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={onRename}
              aria-label="שינוי שם הרשימה"
              className="rounded-lg text-muted-foreground hover:text-foreground"
            >
              <Pencil className="size-4" />
            </Button>
          </DialogTitle>
          <DialogDescription className="flex items-center gap-1 num">
            <Users className="size-3.5" />
            {members.length} שחקנים ברשימה
          </DialogDescription>
        </DialogHeader>

        <div
          dir="ltr"
          className="players-scroll -mx-1 min-h-0 flex-1 overflow-y-auto px-1"
        >
          <motion.div
            dir="rtl"
            variants={bodyVariants}
            initial="hidden"
            animate="show"
            className="space-y-4 overflow-hidden"
          >
            <motion.div variants={itemVariants}>
              <Button
                type="button"
                variant="ghost"
                onClick={onOpenPicker}
                className="h-9 w-fit justify-center gap-1.5 rounded-xl px-3.5 text-sm font-normal neu-raised-xs neu-interactive"
              >
                <Plus className="size-4 text-primary/70" />
                הוספת שחקנים
              </Button>
            </motion.div>

            {members.length === 0 ? (
              <motion.p
                variants={itemVariants}
                className="py-8 text-center text-sm text-muted-foreground"
              >
                אין שחקנים ברשימה עדיין.
              </motion.p>
            ) : (
              <motion.div variants={itemVariants} className="space-y-1.5">
                <AnimatePresence initial={false}>
                  {members.map((p) => (
                    <EnrolledPersonRow
                      key={p.id}
                      person={p}
                      mismatchReasons={[]}
                      onRemove={() => onRemoveMember(p.id)}
                      removeLabel={`הסרת ${p.name}`}
                      container={container}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Reversed row so, in RTL, the confirm lands on the left and ביטול on
            the right — same order as every other modal in the app. */}
        <DialogFooter className="gap-2 sm:flex-row-reverse sm:justify-end">
          <Button
            type="button"
            disabled={saving}
            onClick={onConfirm}
            className="rounded-xl"
          >
            {mode === "create" ? "הוסף" : "שמירה"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            className="rounded-xl"
          >
            ביטול
          </Button>
        </DialogFooter>
      </DialogContent>

      <PeoplePickerDialog
        open={pickerOpen}
        onOpenChange={onPickerOpenChange}
        people={availablePlayers}
        checkedIds={checkedIds}
        disabledIds={[]}
        onToggle={onToggleChecked}
        onConfirm={onConfirmMembers}
        noun={{ plural: "שחקנים", singular: "שחקן" }}
      />
    </Dialog>
  );
}
