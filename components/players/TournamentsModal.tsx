"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  Check,
  ChevronDown,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  TriangleAlert,
  Trophy,
  User,
} from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import { UnsavedCloseBar } from "@/components/shared/UnsavedCloseBar";
import { useDisclosure } from "@/hooks/useDisclosure";
import { TournamentStatusBadge } from "@/components/tournaments/TournamentStatusBadge";
import { cn } from "@/lib/utils";
import type { Tournament } from "@/lib/tournaments-data";

const ease = [0.22, 1, 0.36, 1] as const;

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12, filter: "blur(4px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.32, ease },
  },
  exit: {
    opacity: 0,
    x: -16,
    filter: "blur(4px)",
    transition: { duration: 0.22, ease },
  },
};

function TournamentMeta({ tournament }: { tournament: Tournament }) {
  return (
    <div className="flex flex-nowrap items-center gap-x-4 whitespace-nowrap text-xs text-foreground/70">
      <span className="flex shrink-0 items-center gap-1.5">
        <User className="size-3.5 text-primary/70" />
        {tournament.judge}
      </span>
      <span className="flex shrink-0 items-center gap-1.5">
        <CalendarDays className="size-3.5 text-primary/70" />
        {tournament.days.join(", ")}
      </span>
      <span className="flex shrink-0 items-center gap-1.5">
        <MapPin className="size-3.5 text-primary/70" />
        {tournament.room}
      </span>
      <span className="num shrink-0 text-foreground/55">
        המועד הבא: {tournament.nextDate}
      </span>
    </div>
  );
}

interface TournamentCardProps {
  tournament: Tournament;
  editing: boolean;
  confirming: boolean;
  onRequestRemove: (name: string) => void;
  onCancelRemove: () => void;
  onConfirmRemove: () => void;
}

function TournamentCard({
  tournament,
  editing,
  confirming,
  onRequestRemove,
  onCancelRemove,
  onConfirmRemove,
}: TournamentCardProps) {
  return (
    <motion.li
      layout
      variants={itemVariants}
      exit="exit"
      className={cn(
        "relative overflow-hidden rounded-2xl neu-raised-xs bg-foreground/5 p-3.5",
        confirming && "ring-1 ring-destructive/40",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <Trophy className="size-4 shrink-0 text-primary" />
            <span className="font-medium text-foreground">
              {tournament.name}
            </span>
            <TournamentStatusBadge status={tournament.status} />
          </div>
          <TournamentMeta tournament={tournament} />
        </div>

        {editing && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onRequestRemove(tournament.name)}
            aria-label={`מחק רישום ל${tournament.name}`}
            className="size-8 shrink-0 rounded-lg text-destructive/80 hover:bg-destructive/15 hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </Button>
        )}
      </div>

      <AnimatePresence>
        {confirming && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease }}
            className="overflow-hidden"
          >
            <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-destructive/10 px-3 py-2">
              <span className="flex items-center gap-2 text-sm text-destructive">
                <TriangleAlert className="size-4 shrink-0" />
                למחוק את הרישום לתחרות זו?
              </span>
              <div className="flex shrink-0 gap-2">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={onConfirmRemove}
                  className="h-7 rounded-lg px-3 text-xs"
                >
                  כן, מחק
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onCancelRemove}
                  className="h-7 rounded-lg px-3 text-xs"
                >
                  ביטול
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
}

interface TournamentComboboxProps {
  available: Tournament[];
  selectedTournament: string;
  onSelectedTournamentChange: (value: string) => void;
  container: HTMLElement | null;
}

function TournamentCombobox({
  available,
  selectedTournament,
  onSelectedTournamentChange,
  container,
}: TournamentComboboxProps) {
  const { open, setOpen } = useDisclosure();
  const [query, setQuery] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  // The side is decided once when the popover opens (based on the room below the
  // trigger) and then locked, so filtering the list never flips its direction.
  const [side, setSide] = useState<"top" | "bottom">("bottom");

  const matches = available.filter((tournament) =>
    tournament.name.includes(query.trim()),
  );

  function handleOpenChange(next: boolean) {
    if (next && triggerRef.current) {
      const spaceBelow =
        window.innerHeight - triggerRef.current.getBoundingClientRect().bottom;
      // ~20rem dropdown + offset; below this there isn't room to open downward.
      setSide(spaceBelow < 340 ? "top" : "bottom");
    }
    setOpen(next);
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          type="button"
          variant="ghost"
          className="h-9 w-full justify-between rounded-xl px-3 text-sm font-normal neu-inset border-0 bg-foreground/8"
        >
          <span
            className={cn(
              "flex-1 text-center",
              !selectedTournament && "text-muted-foreground",
            )}
          >
            {selectedTournament || "בחרו תחרות…"}
          </span>
          <ChevronDown className="size-4 shrink-0 text-foreground/50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side={side}
        sideOffset={6}
        avoidCollisions={false}
        container={container}
        dir="rtl"
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="flex max-h-80 w-(--radix-popover-trigger-width) flex-col gap-1.5 p-1.5"
      >
        <Input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="חיפוש תחרות…"
          className="h-8 shrink-0 rounded-lg text-center"
        />
        <div className="players-scroll scrollbar-right min-h-0 flex-1 overflow-y-auto">
          <div className="flex flex-col gap-0.5 pe-1">
            {matches.length === 0 ? (
              <p className="px-2 py-4 text-center text-xs text-muted-foreground">
                לא נמצאו תחרויות
              </p>
            ) : (
              matches.map((tournament) => {
                const checked = selectedTournament === tournament.name;
                return (
                  <Button
                    key={tournament.id}
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      onSelectedTournamentChange(tournament.name);
                      setOpen(false);
                    }}
                    className={cn(
                      "h-auto w-full justify-between gap-2 rounded-lg px-2.5 py-1.5 text-sm transition-colors",
                      checked
                        ? "bg-primary/20 font-medium text-primary hover:bg-primary/35 hover:text-primary dark:hover:bg-primary/45"
                        : "font-normal text-foreground/80 hover:bg-primary/30 hover:text-foreground dark:hover:bg-primary/40",
                    )}
                  >
                    <span className="text-start">{tournament.name}</span>
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

interface AddTournamentFieldProps {
  available: Tournament[];
  selectedTournament: string;
  onSelectedTournamentChange: (value: string) => void;
  onAdd: () => void;
  container: HTMLElement | null;
}

function AddTournamentField({
  available,
  selectedTournament,
  onSelectedTournamentChange,
  onAdd,
  container,
}: AddTournamentFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label className="text-foreground/80">הוספה לתחרות קיימת</Label>
      <div className="flex w-72 gap-2">
        <div className="flex-1">
          <TournamentCombobox
            available={available}
            selectedTournament={selectedTournament}
            onSelectedTournamentChange={onSelectedTournamentChange}
            container={container}
          />
        </div>
        <Button
          type="button"
          disabled={!selectedTournament}
          onClick={onAdd}
          className="h-9 shrink-0 gap-1.5 rounded-xl"
        >
          <Plus className="size-4" />
          הוסף
        </Button>
      </div>
    </div>
  );
}

interface TournamentsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  playerName: string;
  editing: boolean;
  registered: Tournament[];
  available: Tournament[];
  pendingRemoval: string | null;
  selectedTournament: string;
  onSelectedTournamentChange: (value: string) => void;
  dirty: boolean;
  confirmingClose: boolean;
  closeNudge: number;
  onStartEditing: () => void;
  onCommit: () => void;
  onConfirmClose: () => void;
  onCancelClose: () => void;
  onRequestRemove: (name: string) => void;
  onCancelRemove: () => void;
  onConfirmRemove: () => void;
  onAddTournament: () => void;
}

export function TournamentsModal({
  open,
  onOpenChange,
  playerName,
  editing,
  registered,
  available,
  pendingRemoval,
  selectedTournament,
  onSelectedTournamentChange,
  dirty,
  confirmingClose,
  closeNudge,
  onStartEditing,
  onCommit,
  onConfirmClose,
  onCancelClose,
  onRequestRemove,
  onCancelRemove,
  onConfirmRemove,
  onAddTournament,
}: TournamentsModalProps) {
  // Portal the tournament combobox into the dialog so its wheel-scroll isn't
  // blocked by the dialog's scroll lock (which only allows scrolling inside it).
  const [container, setContainer] = useState<HTMLElement | null>(null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        ref={setContainer}
        dir="rtl"
        className="top-[20%] max-w-2xl translate-y-0"
      >
        <DialogHeader>
          <DialogTitle>הרשמה לתחרויות</DialogTitle>
          <DialogDescription>
            {editing ? "ניהול " : "להלן "}
            התחרויות שאליהן רשום{" "}
            <span className="font-semibold text-foreground">{playerName}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {registered.length === 0 ? (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease }}
              className="rounded-2xl neu-inset bg-foreground/5 py-8 text-center text-sm text-foreground/60"
            >
              השחקן אינו רשום לאף תחרות.
            </motion.p>
          ) : (
            <motion.ul
              layout
              variants={listVariants}
              initial="hidden"
              animate="show"
              className="players-scroll scrollbar-right max-h-60 space-y-2.5 overflow-y-auto pe-1"
            >
              <AnimatePresence initial={false}>
                {registered.map((tournament) => (
                  <TournamentCard
                    key={tournament.id}
                    tournament={tournament}
                    editing={editing}
                    confirming={pendingRemoval === tournament.name}
                    onRequestRemove={onRequestRemove}
                    onCancelRemove={onCancelRemove}
                    onConfirmRemove={onConfirmRemove}
                  />
                ))}
              </AnimatePresence>
            </motion.ul>
          )}

          <AnimatePresence initial={false}>
            {editing && available.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0, filter: "blur(4px)" }}
                animate={{ opacity: 1, height: "auto", filter: "blur(0px)" }}
                exit={{ opacity: 0, height: 0, filter: "blur(4px)" }}
                transition={{ duration: 0.3, ease }}
                className="space-y-4 overflow-hidden"
              >
                <Separator className="bg-foreground/10" />
                <AddTournamentField
                  available={available}
                  selectedTournament={selectedTournament}
                  onSelectedTournamentChange={onSelectedTournamentChange}
                  onAdd={onAddTournament}
                  container={container}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <DialogFooter className="gap-2 sm:justify-start">
          {confirmingClose ? (
            <UnsavedCloseBar
              nudge={closeNudge}
              onConfirmClose={onConfirmClose}
              onCancelClose={onCancelClose}
            />
          ) : editing ? (
            <>
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
                disabled={!dirty}
                onClick={onCommit}
                className="gap-1.5 rounded-xl"
              >
                <Check className="size-4" />
                עדכן
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="rounded-xl"
              >
                סגור
              </Button>
              <Button
                type="button"
                onClick={onStartEditing}
                className="gap-1.5 rounded-xl"
              >
                <Pencil className="size-4" />
                עריכה
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
