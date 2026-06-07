"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, CircleCheck, CircleX, Plus, X } from "lucide-react";
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
import { useDisclosure } from "@/hooks/useDisclosure";
import { cn } from "@/lib/utils";
import type { AvailabilitySlot, PlayerAvailability } from "@/lib/availability";
import type { Player } from "@/lib/players-data";

const ease = [0.22, 1, 0.36, 1] as const;

const bodyVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10, filter: "blur(4px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.32, ease } },
};

interface PlayerMultiSelectProps {
  players: Player[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  container: HTMLElement | null;
}

function PlayerMultiSelect({
  players,
  selectedIds,
  onToggle,
  container,
}: PlayerMultiSelectProps) {
  const { open, setOpen } = useDisclosure();
  const [query, setQuery] = useState("");

  const matches = players.filter((p) => p.name.includes(query.trim()));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="h-9 w-full justify-between rounded-xl px-3 text-sm font-normal neu-raised-xs neu-interactive"
        >
          <span className="flex items-center gap-2 text-foreground/80">
            <Plus className="size-4 text-primary/70" />
            הוסף שחקן
          </span>
          <ChevronDown className="size-4 text-foreground/50" />
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
          onChange={(e) => setQuery(e.target.value)}
          placeholder="חיפוש שחקן…"
          className="h-8 shrink-0 rounded-lg"
        />
        <div className="players-scroll min-h-0 flex-1 overflow-y-auto">
          <div className="flex flex-col gap-0.5 pe-1">
            {matches.length === 0 ? (
              <p className="px-2 py-4 text-center text-xs text-muted-foreground">
                לא נמצאו שחקנים
              </p>
            ) : (
              matches.map((p) => {
                const checked = selectedIds.includes(p.id);
                return (
                  <Button
                    key={p.id}
                    type="button"
                    variant="ghost"
                    onClick={() => onToggle(p.id)}
                    className={cn(
                      "h-auto w-full justify-between gap-2 rounded-lg px-2.5 py-1.5 text-sm transition-colors",
                      checked
                        ? "bg-primary/20 font-medium text-primary hover:bg-primary/35 hover:text-primary dark:hover:bg-primary/45"
                        : "font-normal text-foreground/80 hover:bg-primary/30 hover:text-foreground dark:hover:bg-primary/40",
                    )}
                  >
                    <span className="text-start">{p.name}</span>
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

interface AvailabilityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  players: Player[];
  selectedIds: string[];
  onTogglePlayer: (id: string) => void;
  slot: AvailabilitySlot;
  onSlotChange: (patch: Partial<AvailabilitySlot>) => void;
  slotValid: boolean;
  result: PlayerAvailability[] | null;
  onConfirm: () => void;
  checkingAll: boolean;
}

export function AvailabilityModal({
  open,
  onOpenChange,
  players,
  selectedIds,
  onTogglePlayer,
  slot,
  onSlotChange,
  slotValid,
  result,
  onConfirm,
  checkingAll,
}: AvailabilityModalProps) {
  const selected = players.filter((p) => selectedIds.includes(p.id));
  // Portal the player dropdown into the dialog so wheel-scroll isn't blocked
  // by the dialog's scroll lock (which only allows scrolling inside itself).
  const [container, setContainer] = useState<HTMLElement | null>(null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent ref={setContainer} dir="rtl" className="max-w-md">
        <DialogHeader>
          <DialogTitle>בדיקת זמינות</DialogTitle>
          <DialogDescription>
            בחרו שחקנים וטווח זמן כדי לבדוק מי פנוי.
          </DialogDescription>
        </DialogHeader>

        <motion.div
          className="space-y-4"
          variants={bodyVariants}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={itemVariants} className="space-y-1.5">
            <Label>שחקנים</Label>
            {selected.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {selected.map((p) => (
                  <Badge
                    key={p.id}
                    variant="secondary"
                    className="gap-1 rounded-full bg-primary/15 py-1 ps-2.5 pe-1 text-foreground"
                  >
                    {p.name}
                    <button
                      type="button"
                      onClick={() => onTogglePlayer(p.id)}
                      className="rounded-full p-0.5 hover:bg-foreground/10"
                      aria-label={`הסר ${p.name}`}
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <PlayerMultiSelect
              players={players}
              selectedIds={selectedIds}
              onToggle={onTogglePlayer}
              container={container}
            />
            {checkingAll && (
              <p className="text-xs text-muted-foreground">
                לא נבחרו שחקנים — נציג מי מכלל השחקנים פנוי בטווח שנבחר.
              </p>
            )}
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-1.5">
            <Label htmlFor="availability-date">תאריך</Label>
            <Input
              id="availability-date"
              type="date"
              value={slot.date}
              onChange={(e) => onSlotChange({ date: e.target.value })}
              className="h-9 rounded-xl"
            />
          </motion.div>

          <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="availability-start">שעת התחלה</Label>
              <Input
                id="availability-start"
                type="time"
                value={slot.startTime}
                onChange={(e) => onSlotChange({ startTime: e.target.value })}
                className="h-9 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="availability-end">שעת סיום</Label>
              <Input
                id="availability-end"
                type="time"
                value={slot.endTime}
                onChange={(e) => onSlotChange({ endTime: e.target.value })}
                className="h-9 rounded-xl"
              />
            </div>
          </motion.div>

          <AnimatePresence initial={false}>
            {result && (
              <motion.div
                key="availability-result"
                initial={{ opacity: 0, height: 0, filter: "blur(4px)" }}
                animate={{ opacity: 1, height: "auto", filter: "blur(0px)" }}
                exit={{ opacity: 0, height: 0, filter: "blur(4px)" }}
                transition={{ duration: 0.35, ease }}
                className="space-y-4 overflow-hidden"
              >
                <Separator className="bg-foreground/10" />
                <AvailabilityResult result={result} checkingAll={checkingAll} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <DialogFooter className="gap-2">
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AvailabilityResult({
  result,
  checkingAll,
}: {
  result: PlayerAvailability[];
  checkingAll: boolean;
}) {
  const rows = checkingAll ? result.filter((r) => r.available) : result;
  const freeCount = result.filter((r) => r.available).length;

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-foreground/70">
        {checkingAll
          ? `${freeCount} שחקנים פנויים בטווח שנבחר`
          : `${freeCount} מתוך ${result.length} פנויים`}
      </p>
      {rows.length === 0 ? (
        <p className="py-2 text-center text-xs text-muted-foreground">
          אין שחקנים פנויים בטווח שנבחר
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
                key={r.playerId}
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
