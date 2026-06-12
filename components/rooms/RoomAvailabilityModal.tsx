"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, CircleCheck, CircleX, FileDown, Plus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { RoomAvailability, RoomSlot } from "@/lib/room-availability";
import type { Room } from "@/lib/rooms-data";

const ease = [0.22, 1, 0.36, 1] as const;

const bodyVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10, filter: "blur(4px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.32, ease } },
};

interface RoomMultiSelectProps {
  matches: Room[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  query: string;
  onQueryChange: (value: string) => void;
  container: HTMLElement | null;
}

function RoomMultiSelect({
  matches,
  selectedIds,
  onToggle,
  open,
  onOpenChange,
  query,
  onQueryChange,
  container,
}: RoomMultiSelectProps) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="h-8 w-full justify-center rounded-xl px-3 text-sm font-normal neu-raised-xs neu-interactive"
        >
          <span className="flex items-center gap-2 text-foreground/80">
            <Plus className="size-4 text-primary/70" />
            הוסף חדר
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="bottom"
        sideOffset={6}
        collisionPadding={12}
        container={container}
        dir="rtl"
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="flex max-h-[min(20rem,var(--radix-popover-content-available-height))] w-(--radix-popover-trigger-width) flex-col gap-1.5 p-1.5"
      >
        <Input
          autoFocus
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="חיפוש חדר…"
          className="h-8 shrink-0 rounded-lg"
        />
        <div className="players-scroll min-h-0 flex-1 overflow-y-auto">
          <div className="flex flex-col gap-0.5 pe-1">
            {matches.length === 0 ? (
              <p className="px-2 py-4 text-center text-xs text-muted-foreground">
                לא נמצאו חדרים
              </p>
            ) : (
              matches.map((r) => {
                const checked = selectedIds.includes(r.id);
                return (
                  <Button
                    key={r.id}
                    type="button"
                    variant="ghost"
                    onClick={() => onToggle(r.id)}
                    className={cn(
                      "h-auto w-full justify-center gap-2 rounded-lg px-2.5 py-1.5 text-sm transition-colors",
                      checked
                        ? "bg-primary/20 font-medium text-primary hover:bg-primary/35 hover:text-primary dark:hover:bg-primary/45"
                        : "font-normal text-foreground/80 hover:bg-primary/30 hover:text-foreground dark:hover:bg-primary/40",
                    )}
                  >
                    <span className="flex-1 text-center">{r.name}</span>
                    {checked && <Check className="size-4 text-primary" />}
                  </Button>
                );
              })
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface RoomAvailabilityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rooms: Room[];
  selectedIds: string[];
  onToggleRoom: (id: string) => void;
  slot: RoomSlot;
  onSlotChange: (patch: Partial<RoomSlot>) => void;
  slotValid: boolean;
  result: RoomAvailability[] | null;
  onConfirm: () => void;
  checkingAll: boolean;
  pickerOpen: boolean;
  onPickerOpenChange: (open: boolean) => void;
  pickerQuery: string;
  onPickerQueryChange: (value: string) => void;
  pickerMatches: Room[];
  container: HTMLElement | null;
  onContainerChange: (el: HTMLElement | null) => void;
}

export function RoomAvailabilityModal({
  open,
  onOpenChange,
  rooms,
  selectedIds,
  onToggleRoom,
  slot,
  onSlotChange,
  slotValid,
  result,
  onConfirm,
  checkingAll,
  pickerOpen,
  onPickerOpenChange,
  pickerQuery,
  onPickerQueryChange,
  pickerMatches,
  container,
  onContainerChange,
}: RoomAvailabilityModalProps) {
  const selected = rooms.filter((r) => selectedIds.includes(r.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Portal the room dropdown into the dialog so wheel-scroll isn't blocked
          by the dialog's scroll lock (which only allows scrolling inside itself). */}
      <DialogContent ref={onContainerChange} dir="rtl" className="max-w-md">
        <DialogHeader>
          <DialogTitle>בדיקת זמינות</DialogTitle>
          <DialogDescription>
            בחרו חדרים וטווח זמן כדי לבדוק מה פנוי.
          </DialogDescription>
        </DialogHeader>

        <motion.div
          className="space-y-4"
          variants={bodyVariants}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={itemVariants} className="space-y-1.5">
            {selected.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {selected.map((r) => (
                  <Badge
                    key={r.id}
                    variant="secondary"
                    className="gap-1 rounded-full bg-primary/15 py-1 ps-2.5 pe-1 text-foreground"
                  >
                    <span className="text-center">{r.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => onToggleRoom(r.id)}
                      aria-label={`הסר ${r.name}`}
                      className="size-auto rounded-full p-0.5 hover:bg-foreground/10"
                    >
                      <X className="size-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>חדרים</Label>
                <RoomMultiSelect
                  matches={pickerMatches}
                  selectedIds={selectedIds}
                  onToggle={onToggleRoom}
                  open={pickerOpen}
                  onOpenChange={onPickerOpenChange}
                  query={pickerQuery}
                  onQueryChange={onPickerQueryChange}
                  container={container}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="room-availability-date">תאריך</Label>
                <Input
                  id="room-availability-date"
                  type="date"
                  value={slot.date}
                  onChange={(e) => onSlotChange({ date: e.target.value })}
                  className="h-8 rounded-xl text-center native-center"
                />
              </div>
            </div>
            {checkingAll && (
              <p className="text-xs text-muted-foreground">
                לא נבחרו חדרים — נציג אילו חדרים פנויים בטווח שנבחר.
              </p>
            )}
          </motion.div>

          <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="room-availability-start">שעת התחלה</Label>
              <Input
                id="room-availability-start"
                type="time"
                value={slot.startTime}
                onChange={(e) => onSlotChange({ startTime: e.target.value })}
                className="h-8 w-28 mx-auto rounded-xl native-right"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="room-availability-end">שעת סיום</Label>
              <Input
                id="room-availability-end"
                type="time"
                value={slot.endTime}
                onChange={(e) => onSlotChange({ endTime: e.target.value })}
                className="h-8 w-28 mx-auto rounded-xl native-right"
              />
            </div>
          </motion.div>

          <AnimatePresence initial={false}>
            {result && (
              <motion.div
                key="room-availability-result"
                initial={{ opacity: 0, height: 0, filter: "blur(4px)" }}
                animate={{ opacity: 1, height: "auto", filter: "blur(0px)" }}
                exit={{ opacity: 0, height: 0, filter: "blur(4px)" }}
                transition={{ duration: 0.35, ease }}
                className="space-y-4 overflow-hidden"
              >
                <Separator className="bg-foreground/10" />
                <RoomAvailabilityResult result={result} checkingAll={checkingAll} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <DialogFooter className="gap-2 sm:justify-between">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="rounded-xl"
            >
              ביטול
            </Button>
            <Button
              type="button"
              disabled={!slotValid}
              onClick={onConfirm}
              className="rounded-xl"
            >
              אישור
            </Button>
          </div>
          <AnimatePresence initial={false}>
            {result && (
              <motion.div
                key="export-excel"
                initial={{ opacity: 0, x: 12, filter: "blur(4px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, x: 12, filter: "blur(4px)" }}
                transition={{ duration: 0.32, ease }}
                className="ms-auto"
              >
                <Button
                  type="button"
                  onClick={() => {}}
                  variant="ghost"
                  className={cn(
                    "group/btn relative overflow-hidden tint-indigo",
                    "h-8 rounded-xl gap-1.5 px-3.5 text-xs font-medium neu-raised-xs neu-interactive",
                  )}
                >
                  <span className="absolute inset-x-0 top-0 h-1 tint-bar origin-center scale-x-0 group-hover/btn:scale-x-100 transition-transform duration-700 ease-out" />
                  <FileDown className="size-4 text-[#217346]" />
                  ייצוא לאקסל
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RoomAvailabilityResult({
  result,
  checkingAll,
}: {
  result: RoomAvailability[];
  checkingAll: boolean;
}) {
  const rows = checkingAll ? result.filter((r) => r.available) : result;
  const freeCount = result.filter((r) => r.available).length;

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-foreground/70">
        {checkingAll
          ? `${freeCount} חדרים פנויים בטווח שנבחר`
          : `${freeCount} מתוך ${result.length} פנויים`}
      </p>
      {rows.length === 0 ? (
        <p className="py-2 text-center text-xs text-muted-foreground">
          אין חדרים פנויים בטווח שנבחר
        </p>
      ) : (
        <div className="players-scroll max-h-40 overflow-y-auto">
          <motion.ul
            className="flex flex-col gap-1 pe-1"
            variants={bodyVariants}
            initial="hidden"
            animate="show"
          >
            {rows.map((r) => (
              <motion.li
                key={r.roomId}
                variants={itemVariants}
                className="flex items-center justify-between gap-2 rounded-lg bg-foreground/5 px-3 py-2 text-sm"
              >
                <span className="text-foreground/85">{r.name}</span>
                {r.available ? (
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                    <CircleCheck className="size-4" />
                    פנוי
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-destructive">
                    <CircleX className="size-4" />
                    {r.reason}
                  </span>
                )}
              </motion.li>
            ))}
          </motion.ul>
        </div>
      )}
    </div>
  );
}
