"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  FileDown,
  ListOrdered,
  Package,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Trophy,
  Users,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PeoplePickerDialog } from "@/components/shared/PeoplePickerDialog";
import { UnsavedCloseBar } from "@/components/shared/UnsavedCloseBar";
import {
  AddSourceChoiceDialog,
  RosterChoiceDialog,
  type RosterOption,
} from "@/components/shared/AddSourceDialogs";
import { cn } from "@/lib/utils";
import { equipment, OUTSIDE_CLUB_ROOM, type Room } from "@/lib/rooms-data";
import { equipmentAvailableNow } from "@/lib/course-form";
import {
  roundComplete,
  TOURNAMENT_FREQUENCY_OPTIONS,
  type TournamentFrequency,
  type EquipmentLineValues,
  type RoundValues,
  type TournamentFormValues,
  type TournamentFormat,
} from "@/lib/tournament-form";
import { useCollection } from "@/lib/firebase/useCollection";
import type { CoachRecord } from "@/lib/coaches-data";
import type {
  TournamentModalMode,
  TournamentTab,
} from "@/hooks/tournaments/useAddTournament";
import type { Player } from "@/lib/players-data";

/** The "no judge" choice in the searchable judge dropdown (maps to "" in the form). */
const NO_JUDGE = "ללא שופט";

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

const fieldClass =
  "h-9 rounded-xl neu-inset border-0 bg-foreground/8! px-3 text-start text-foreground placeholder:text-muted-foreground/70";
const triggerClass = `${fieldClass} w-full`;
const selectTriggerClass = cn(
  triggerClass,
  "text-center [&_[data-slot=select-value]]:flex-1 [&_[data-slot=select-value]]:justify-center",
);
const selectContentClass =
  "[&_[data-slot=select-item]]:justify-center [&_[data-slot=select-item]]:pl-8 [&_[data-slot=select-item]]:text-center";
// Native date/time inputs ignore text-align in Chrome, so center the internal
// flex fields-wrapper (and keep text-center for Firefox).
const dateFieldClass = cn(
  fieldClass,
  "px-2 text-center",
  "[&::-webkit-datetime-edit]:w-full [&::-webkit-datetime-edit]:text-center",
  "[&::-webkit-datetime-edit-fields-wrapper]:w-full [&::-webkit-datetime-edit-fields-wrapper]:justify-center",
);

function FieldLabel({
  required,
  className,
  children,
}: {
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Label
      onClick={(e) => e.preventDefault()}
      className={cn("w-fit cursor-default gap-1 text-foreground/80", className)}
    >
      {children}
      {required && (
        <span className="text-destructive" aria-hidden>
          *
        </span>
      )}
    </Label>
  );
}

function Field({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={itemVariants}
      className={cn("space-y-1.5", className)}
    >
      {children}
    </motion.div>
  );
}

function WarningNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
      <AlertTriangle className="size-3.5 shrink-0" />
      {children}
    </p>
  );
}

/** A single-select dropdown with a text-search box, portalled into the dialog. */
function SearchSelect({
  value,
  onChange,
  options,
  placeholder,
  searchPlaceholder,
  container,
  dangerOption,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  searchPlaceholder: string;
  container: HTMLElement | null;
  /** An option rendered in a subtle red to mark it apart (e.g. "ללא שופט"). */
  dangerOption?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const matches = options.filter((o) =>
    o.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className={cn(triggerClass, "justify-between font-normal")}
        >
          <span
            className={cn(
              "flex-1 text-center",
              !value && "text-muted-foreground",
              value &&
                value === dangerOption &&
                "font-medium text-destructive/90",
            )}
          >
            {value || placeholder}
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
        className="flex max-h-[min(18rem,var(--radix-popover-content-available-height))] w-(--radix-popover-trigger-width) flex-col gap-1.5 p-1.5"
      >
        <div className="relative shrink-0">
          <Search className="pointer-events-none absolute top-1/2 inset-s-2.5 size-3.5 -translate-y-1/2 text-foreground/50" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-8 ps-8 rounded-lg"
          />
        </div>
        <div className="players-scroll min-h-0 flex-1 overflow-y-auto">
          <div className="flex flex-col gap-0.5 pe-1">
            {matches.length === 0 ? (
              <p className="px-2 py-4 text-center text-xs text-muted-foreground">
                לא נמצאו תוצאות
              </p>
            ) : (
              matches.map((o) => {
                const checked = o === value;
                return (
                  <Button
                    key={o}
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      onChange(o);
                      setOpen(false);
                    }}
                    className={cn(
                      "relative h-auto w-full justify-center gap-2 rounded-lg px-8 py-1.5 text-sm transition-colors",
                      checked
                        ? "bg-primary/20 font-medium text-primary hover:bg-primary/35 hover:text-primary dark:hover:bg-primary/45"
                        : "font-normal text-foreground/80 hover:bg-primary/30 hover:text-foreground dark:hover:bg-primary/40",
                    )}
                  >
                    <span
                      className={cn(
                        "text-center",
                        o === dangerOption &&
                          !checked &&
                          "font-medium text-destructive/90",
                      )}
                    >
                      {o}
                    </span>
                    {checked && (
                      <Check className="absolute inset-s-2 size-4 text-primary" />
                    )}
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

function RoundCard({
  index,
  round,
  onChange,
  container,
  roomOptions,
}: {
  index: number;
  round: RoundValues;
  onChange: (patch: Partial<RoundValues>) => void;
  container: HTMLElement | null;
  roomOptions: string[];
}) {
  return (
    <motion.div
      variants={itemVariants}
      className="space-y-3 rounded-2xl neu-inset bg-foreground/5 p-3"
    >
      <div className="flex items-center gap-2">
        <span className="flex size-6 items-center justify-center rounded-lg bg-primary/15 text-xs font-semibold text-primary num">
          {index + 1}
        </span>
        <span className="text-sm font-semibold text-foreground">
          סיבוב {index + 1}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div className="space-y-1.5">
          <FieldLabel required>חדר</FieldLabel>
          <SearchSelect
            value={round.room}
            onChange={(v) => onChange({ room: v })}
            options={roomOptions}
            placeholder="בחר חדר"
            searchPlaceholder="חיפוש חדר…"
            container={container}
          />
        </div>
        <div className="space-y-1.5">
          <FieldLabel required>תאריך</FieldLabel>
          <Input
            type="date"
            value={round.date}
            onChange={(e) => onChange({ date: e.target.value })}
            className={dateFieldClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div className="space-y-1.5">
          <FieldLabel required>שעת התחלה</FieldLabel>
          <Input
            type="time"
            dir="rtl"
            value={round.startTime}
            onChange={(e) => onChange({ startTime: e.target.value })}
            className={dateFieldClass}
          />
        </div>
        <div className="space-y-1.5">
          <FieldLabel required>שעת סיום</FieldLabel>
          <Input
            type="time"
            dir="rtl"
            value={round.endTime}
            onChange={(e) => onChange({ endTime: e.target.value })}
            className={dateFieldClass}
          />
        </div>
      </div>
    </motion.div>
  );
}

/** The "magic" button: pick a base round, then fill all later rounds a week apart. */
function MagicCompleteButton({
  rounds,
  onComplete,
  container,
}: {
  rounds: RoundValues[];
  onComplete: (baseIndex: number) => void;
  container: HTMLElement | null;
}) {
  const [open, setOpen] = useState(false);
  // Only rounds that are fully filled (and aren't the last) make sense as a base
  // to copy forward from.
  const candidates = rounds
    .map((round, index) => ({ round, index }))
    .filter(
      ({ round, index }) => roundComplete(round) && index < rounds.length - 1,
    );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          disabled={candidates.length === 0}
          className={cn(
            "group/btn relative h-9 shrink-0 overflow-hidden rounded-xl px-3 text-xs font-medium neu-raised-xs neu-interactive tint-indigo",
            "text-primary disabled:opacity-40",
          )}
        >
          <span className="absolute inset-x-0 top-0 h-1 tint-bar origin-center scale-x-0 group-hover/btn:scale-x-100 transition-transform duration-700 ease-out" />
          <Sparkles className="size-4" />
          השלם סיבובים
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="bottom"
        sideOffset={6}
        collisionPadding={12}
        container={container}
        dir="rtl"
        className="flex w-60 flex-col gap-1 p-1.5"
      >
        <p className="px-2 py-1.5 text-center text-xs text-muted-foreground">
          השלמה אוטומטית בהפרשים של שבוע — בחרו מאיזה סיבוב להמשיך:
        </p>
        {candidates.map(({ index }) => (
          <Button
            key={index}
            type="button"
            variant="ghost"
            onClick={() => {
              onComplete(index);
              setOpen(false);
            }}
            className="h-auto w-full justify-center gap-1.5 rounded-lg py-1.5 text-sm font-normal text-foreground/80 hover:bg-primary/30 hover:text-foreground"
          >
            <Sparkles className="size-3.5 text-primary/70" />
            מסיבוב {index + 1}
          </Button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

function EquipmentRow({
  line,
  onChange,
  onRemove,
  container,
}: {
  line: EquipmentLineValues;
  onChange: (patch: Partial<EquipmentLineValues>) => void;
  onRemove: () => void;
  container: HTMLElement | null;
}) {
  const selected = equipment.find((e) => e.name === line.equipmentId);
  const available = selected ? equipmentAvailableNow(selected.id) : null;
  const overQuota =
    available != null &&
    line.quantity !== "" &&
    Number(line.quantity) > available;

  return (
    <motion.div
      variants={itemVariants}
      className="space-y-2 rounded-2xl neu-inset bg-foreground/5 p-3"
    >
      <div className="flex items-end gap-2.5">
        <div className="flex-1 space-y-1.5">
          <FieldLabel>פריט</FieldLabel>
          <SearchSelect
            value={line.equipmentId}
            onChange={(v) => onChange({ equipmentId: v })}
            options={equipment.map((e) => e.name)}
            placeholder="בחר ציוד"
            searchPlaceholder="חיפוש ציוד…"
            container={container}
          />
        </div>
        <div className="w-20 space-y-1.5">
          <FieldLabel>כמות</FieldLabel>
          <Input
            inputMode="numeric"
            value={line.quantity}
            onChange={(e) =>
              onChange({ quantity: e.target.value.replace(/\D/g, "") })
            }
            className={cn(fieldClass, "text-center num")}
          />
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          aria-label="הסר ציוד"
          className="size-9 shrink-0 rounded-xl text-destructive/80 hover:bg-destructive/15 hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
      {available != null && (
        <p className="text-xs text-muted-foreground num">
          פנוי כעת: {available}
        </p>
      )}
      {overQuota && (
        <WarningNote>הכמות חורגת מהמלאי הפנוי ({available}).</WarningNote>
      )}
    </motion.div>
  );
}

const FORMAT_OPTIONS: { value: TournamentFormat; label: string }[] = [
  { value: "rounds", label: "תחרות סבבים" },
  { value: "fixed", label: "תחרות קבועה" },
];

/** An animated two-option segmented control for the tournament format. */
function FormatToggle({
  value,
  onChange,
}: {
  value: TournamentFormat;
  onChange: (value: TournamentFormat) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-1 rounded-2xl neu-inset bg-foreground/5 p-1">
      {FORMAT_OPTIONS.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              "relative h-9 rounded-xl text-sm font-medium transition-colors",
              active
                ? "text-primary"
                : "text-foreground/60 hover:text-foreground/80",
            )}
          >
            {active && (
              <motion.span
                layoutId="tournament-format-highlight"
                className="absolute inset-0 rounded-xl border-2 border-primary bg-primary/10"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            <span className="relative z-10">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

const tabHighlight = (
  <motion.span
    layoutId="add-tournament-tab-highlight"
    className="absolute inset-0 rounded-lg border-2 border-primary bg-primary/5"
    transition={{ type: "spring", stiffness: 420, damping: 34 }}
  />
);

interface AddTournamentModalProps {
  open: boolean;
  mode: TournamentModalMode;
  onOpenChange: (open: boolean) => void;
  confirmingClose: boolean;
  closeNudge: number;
  onConfirmClose: () => void;
  onCancelClose: () => void;
  tab: TournamentTab;
  onTabChange: (tab: TournamentTab) => void;
  values: TournamentFormValues;
  onFieldChange: <K extends keyof TournamentFormValues>(
    field: K,
    value: TournamentFormValues[K],
  ) => void;
  valid: boolean;
  onConfirm: () => void;
  onFormatChange: (format: TournamentFormat) => void;
  onRoundsCountChange: (raw: string) => void;
  onUpdateRound: (id: string, patch: Partial<RoundValues>) => void;
  onCompleteFromRound: (baseIndex: number) => void;
  players: Player[];
  availablePlayers: Player[];
  onRemovePlayer: (id: string) => void;
  playerPickerOpen: boolean;
  onPlayerPickerOpenChange: (open: boolean) => void;
  onOpenPlayerPicker: () => void;
  sourceChoiceOpen: boolean;
  onSourceChoiceOpenChange: (open: boolean) => void;
  rosterChoiceOpen: boolean;
  onRosterChoiceOpenChange: (open: boolean) => void;
  playerRosters: RosterOption[];
  onChoosePlayersFromAll: () => void;
  onChoosePlayersFromRoster: () => void;
  onBackToSourceChoice: () => void;
  onSelectPlayerRoster: (rosterId: string) => void;
  pickerDisabledIds: string[];
  checkedPlayerIds: string[];
  onToggleCheckedPlayer: (id: string) => void;
  onConfirmPlayers: () => void;
  onAddEquipment: () => void;
  onUpdateEquipment: (id: string, patch: Partial<EquipmentLineValues>) => void;
  onRemoveEquipment: (id: string) => void;
  judgeWarning: boolean;
  criteriaMismatch: (playerId: string) => boolean;
}

export function AddTournamentModal({
  open,
  mode,
  onOpenChange,
  confirmingClose,
  closeNudge,
  onConfirmClose,
  onCancelClose,
  tab,
  onTabChange,
  values,
  onFieldChange,
  valid,
  onConfirm,
  onFormatChange,
  onRoundsCountChange,
  onUpdateRound,
  onCompleteFromRound,
  players,
  availablePlayers,
  onRemovePlayer,
  playerPickerOpen,
  onPlayerPickerOpenChange,
  onOpenPlayerPicker,
  sourceChoiceOpen,
  onSourceChoiceOpenChange,
  rosterChoiceOpen,
  onRosterChoiceOpenChange,
  playerRosters,
  onChoosePlayersFromAll,
  onChoosePlayersFromRoster,
  onBackToSourceChoice,
  onSelectPlayerRoster,
  pickerDisabledIds,
  checkedPlayerIds,
  onToggleCheckedPlayer,
  onConfirmPlayers,
  onAddEquipment,
  onUpdateEquipment,
  onRemoveEquipment,
  judgeWarning,
  criteriaMismatch,
}: AddTournamentModalProps) {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  // The judge picker is fed by the live coach roster (Firestore), so it always
  // reflects real coaches and can't drift from a stale mock. The dropdown is a
  // strict SearchSelect — a judge can only be one of these names, never free text.
  const { data: coaches } = useCollection<CoachRecord>("coaches");
  const judgeOptions = coaches.map((c) => c.name);

  // Rooms come from the live Firestore roster too, so the round / fixed-format
  // pickers list the club's real rooms (plus the explicit "outside the club"
  // choice), not a stale mock.
  const { data: rooms } = useCollection<Room>("rooms");
  const roomOptions = [OUTSIDE_CLUB_ROOM, ...rooms.map((r) => r.name)];

  // The cleanup archive opens this modal read-only: every control is disabled
  // (via the wrapping fieldset) and the confirm/export actions are hidden.
  const readOnly = mode === "view";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        ref={setContainer}
        dir="rtl"
        className="top-[6vh] flex max-h-[88vh] max-w-lg translate-y-0 flex-col"
      >
        <DialogHeader>
          <DialogTitle>
            {readOnly
              ? "צפייה בתחרות"
              : mode === "edit"
                ? "עריכת תחרות"
                : "הוספת תחרות"}
          </DialogTitle>
          <DialogDescription>
            {readOnly ? (
              "פרטי התחרות מוצגים לצפייה בלבד."
            ) : (
              <>
                שדות המסומנים ב־
                <span className="text-destructive">*</span> הם שדות חובה.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={tab}
          onValueChange={(v) => onTabChange(v as TournamentTab)}
          dir="rtl"
          className="min-h-0 flex-1 gap-4"
        >
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="details" className="relative">
              {tab === "details" && tabHighlight}
              <span className="relative z-10 flex items-center gap-1.5">
                <Trophy className="size-4" />
                פרטים
              </span>
            </TabsTrigger>
            <TabsTrigger value="rounds" className="relative">
              {tab === "rounds" && tabHighlight}
              <span className="relative z-10 flex items-center gap-1.5">
                <ListOrdered className="size-4" />
                סיבובים
              </span>
            </TabsTrigger>
            <TabsTrigger value="players" className="relative">
              {tab === "players" && tabHighlight}
              <span className="relative z-10 flex items-center gap-1.5">
                <Users className="size-4" />
                שחקנים
              </span>
            </TabsTrigger>
            <TabsTrigger value="equipment" className="relative">
              {tab === "equipment" && tabHighlight}
              <span className="relative z-10 flex items-center gap-1.5">
                <Package className="size-4" />
                ציוד
              </span>
            </TabsTrigger>
          </TabsList>

          <div
            dir="ltr"
            className="players-scroll -mx-1 min-h-0 flex-1 overflow-y-auto px-1"
          >
            {/* A disabled fieldset turns the whole form read-only in "view"
                mode (cleanup archive) — every nested control is inert. */}
            <fieldset disabled={readOnly} className="m-0 min-w-0 border-0 p-0">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={tab}
                dir="rtl"
                variants={bodyVariants}
                initial="hidden"
                animate="show"
                exit={{
                  opacity: 0,
                  x: -16,
                  filter: "blur(4px)",
                  transition: { duration: 0.18 },
                }}
                className="space-y-4 overflow-hidden"
              >
                {tab === "details" && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <Field>
                        <FieldLabel required>שם התחרות</FieldLabel>
                        <Input
                          value={values.name}
                          onChange={(e) =>
                            onFieldChange("name", e.target.value)
                          }
                          className={fieldClass}
                        />
                      </Field>

                      <Field>
                        <FieldLabel className="ps-1">שופט</FieldLabel>
                        <SearchSelect
                          value={values.judge || NO_JUDGE}
                          onChange={(v) =>
                            onFieldChange("judge", v === NO_JUDGE ? "" : v)
                          }
                          options={[NO_JUDGE, ...judgeOptions]}
                          placeholder={NO_JUDGE}
                          searchPlaceholder="חיפוש שופט…"
                          container={container}
                          dangerOption={NO_JUDGE}
                        />
                      </Field>
                    </div>

                    {/* Fixed-height slot so the judge warning doesn't grow the
                        modal. Mirrors the row's columns so it sits under the
                        judge field. */}
                    <div className="-mt-2.5 grid h-4 grid-cols-2 gap-3">
                      <div />
                      {judgeWarning && (
                        <div className="ps-3">
                          <WarningNote>התחרות תיווצר ללא שופט</WarningNote>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Field>
                        <FieldLabel>מד כושר מינימלי</FieldLabel>
                        <Input
                          inputMode="numeric"
                          value={values.fitnessMin}
                          onChange={(e) =>
                            onFieldChange(
                              "fitnessMin",
                              e.target.value.replace(/\D/g, ""),
                            )
                          }
                          className={cn(fieldClass, "num")}
                        />
                      </Field>
                      <Field>
                        <FieldLabel>מד כושר מקסימלי</FieldLabel>
                        <Input
                          inputMode="numeric"
                          value={values.fitnessMax}
                          onChange={(e) =>
                            onFieldChange(
                              "fitnessMax",
                              e.target.value.replace(/\D/g, ""),
                            )
                          }
                          className={cn(fieldClass, "num")}
                        />
                      </Field>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Field>
                        <FieldLabel>גיל מינימלי</FieldLabel>
                        <Input
                          inputMode="numeric"
                          value={values.ageMin}
                          onChange={(e) =>
                            onFieldChange(
                              "ageMin",
                              e.target.value.replace(/\D/g, ""),
                            )
                          }
                          className={cn(fieldClass, "num")}
                        />
                      </Field>
                      <Field>
                        <FieldLabel>גיל מקסימלי</FieldLabel>
                        <Input
                          inputMode="numeric"
                          value={values.ageMax}
                          onChange={(e) =>
                            onFieldChange(
                              "ageMax",
                              e.target.value.replace(/\D/g, ""),
                            )
                          }
                          className={cn(fieldClass, "num")}
                        />
                      </Field>
                    </div>

                    <Field>
                      <FieldLabel>הערות</FieldLabel>
                      <Textarea
                        value={values.notes}
                        onChange={(e) => onFieldChange("notes", e.target.value)}
                        className={cn(fieldClass, "h-auto min-h-20 py-2")}
                      />
                    </Field>
                  </>
                )}

                {tab === "rounds" && (
                  <>
                    <Field>
                      <FormatToggle
                        value={values.format}
                        onChange={onFormatChange}
                      />
                    </Field>

                    <AnimatePresence mode="wait" initial={false}>
                      {values.format === "rounds" ? (
                        <motion.div
                          key="rounds"
                          initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                          exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
                          transition={{ duration: 0.25, ease }}
                          className="space-y-4"
                        >
                          <div className="flex items-end gap-2.5">
                            <div className="flex-1 space-y-1.5">
                              <FieldLabel required>מספר סיבובים</FieldLabel>
                              <Input
                                inputMode="numeric"
                                value={values.roundsCount}
                                onChange={(e) =>
                                  onRoundsCountChange(e.target.value)
                                }
                                placeholder="לדוגמה: 7"
                                className={cn(fieldClass, "text-center num")}
                              />
                            </div>
                            <MagicCompleteButton
                              rounds={values.rounds}
                              onComplete={onCompleteFromRound}
                              container={container}
                            />
                          </div>

                          {values.rounds.length === 0 ? (
                            <p className="py-8 text-center text-sm text-muted-foreground">
                              הזינו מספר סיבובים כדי להתחיל.
                            </p>
                          ) : (
                            values.rounds.map((round, index) => (
                              <RoundCard
                                key={round.id}
                                index={index}
                                round={round}
                                onChange={(patch) =>
                                  onUpdateRound(round.id, patch)
                                }
                                container={container}
                                roomOptions={roomOptions}
                              />
                            ))
                          )}
                        </motion.div>
                      ) : (
                        <motion.div
                          key="fixed"
                          initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                          exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
                          transition={{ duration: 0.25, ease }}
                          className="space-y-4"
                        >
                          <div className="grid grid-cols-2 gap-2.5">
                            <div className="space-y-1.5">
                              <FieldLabel required>חדר</FieldLabel>
                              <SearchSelect
                                value={values.fixedRoom}
                                onChange={(v) => onFieldChange("fixedRoom", v)}
                                options={roomOptions}
                                placeholder="בחר חדר"
                                searchPlaceholder="חיפוש חדר…"
                                container={container}
                              />
                            </div>
                            <div className="space-y-1.5">
                              <FieldLabel required>תדירות</FieldLabel>
                              <Select
                                value={values.fixedFrequency}
                                onValueChange={(v) =>
                                  onFieldChange(
                                    "fixedFrequency",
                                    v as TournamentFrequency,
                                  )
                                }
                              >
                                <SelectTrigger
                                  className={cn(
                                    selectTriggerClass,
                                    "whitespace-nowrap",
                                  )}
                                >
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent
                                  dir="rtl"
                                  position="popper"
                                  className={selectContentClass}
                                >
                                  {TOURNAMENT_FREQUENCY_OPTIONS.map((f) => (
                                    <SelectItem key={f.value} value={f.value}>
                                      {f.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2.5">
                            <div className="space-y-1.5">
                              <FieldLabel required>שעת התחלה</FieldLabel>
                              <Input
                                type="time"
                                dir="rtl"
                                value={values.fixedStartTime}
                                onChange={(e) =>
                                  onFieldChange(
                                    "fixedStartTime",
                                    e.target.value,
                                  )
                                }
                                className={dateFieldClass}
                              />
                            </div>
                            <div className="space-y-1.5">
                              <FieldLabel required>שעת סיום</FieldLabel>
                              <Input
                                type="time"
                                dir="rtl"
                                value={values.fixedEndTime}
                                onChange={(e) =>
                                  onFieldChange("fixedEndTime", e.target.value)
                                }
                                className={dateFieldClass}
                              />
                            </div>
                          </div>

                          <div className="flex items-end gap-2.5">
                            <div className="flex-1 space-y-1.5">
                              <FieldLabel required>תאריך התחלה</FieldLabel>
                              <Input
                                type="date"
                                value={values.fixedStartDate}
                                onChange={(e) =>
                                  onFieldChange(
                                    "fixedStartDate",
                                    e.target.value,
                                  )
                                }
                                className={dateFieldClass}
                              />
                            </div>
                            <div className="flex-1 space-y-1.5">
                              <FieldLabel required={values.fixedHasEndDate}>
                                תאריך סיום
                              </FieldLabel>
                              <Input
                                type="date"
                                value={values.fixedEndDate}
                                disabled={!values.fixedHasEndDate}
                                onChange={(e) =>
                                  onFieldChange("fixedEndDate", e.target.value)
                                }
                                className={cn(
                                  dateFieldClass,
                                  "disabled:opacity-40",
                                  values.fixedHasEndDate &&
                                    values.fixedEndDate &&
                                    "bg-primary/15! font-medium text-primary ring-1 ring-primary/30",
                                )}
                              />
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() =>
                                onFieldChange(
                                  "fixedHasEndDate",
                                  !values.fixedHasEndDate,
                                )
                              }
                              aria-pressed={values.fixedHasEndDate}
                              className={cn(
                                "group/btn relative h-9 shrink-0 overflow-hidden rounded-xl px-3 text-xs font-medium neu-raised-xs neu-interactive tint-indigo",
                                values.fixedHasEndDate
                                  ? "bg-primary/20! text-primary ring-1 ring-primary/40"
                                  : "text-foreground/70",
                              )}
                            >
                              <span className="absolute inset-x-0 top-0 h-1 tint-bar origin-center scale-x-0 group-hover/btn:scale-x-100 transition-transform duration-700 ease-out" />
                              {/* Reserve the width of the longer label so the
                                  button doesn't resize when toggled. */}
                              <span className="grid">
                                <span
                                  aria-hidden
                                  className="invisible col-start-1 row-start-1"
                                >
                                  הוסף תאריך סיום
                                </span>
                                <span className="col-start-1 row-start-1 text-center">
                                  {values.fixedHasEndDate
                                    ? "הסר תאריך סיום"
                                    : "הוסף תאריך סיום"}
                                </span>
                              </span>
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}

                {tab === "players" && (
                  <>
                    <Field>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={onOpenPlayerPicker}
                        className="h-9 w-fit justify-center gap-1.5 rounded-xl px-3.5 text-sm font-normal neu-raised-xs neu-interactive"
                      >
                        <Plus className="size-4 text-primary/70" />
                        הוסף שחקנים
                      </Button>
                    </Field>

                    {players.length === 0 ? (
                      <motion.p
                        variants={itemVariants}
                        className="py-8 text-center text-sm text-muted-foreground"
                      >
                        אין שחקנים רשומים עדיין.
                      </motion.p>
                    ) : (
                      <motion.div
                        variants={itemVariants}
                        className="space-y-1.5"
                      >
                        {players.map((p) => {
                          const mismatch = criteriaMismatch(p.id);
                          return (
                            <div
                              key={p.id}
                              className="flex items-center justify-between gap-2 rounded-xl neu-inset bg-foreground/5 px-3 py-2"
                            >
                              <div className="flex items-center gap-2">
                                {mismatch && (
                                  <AlertTriangle
                                    className="size-4 shrink-0 text-amber-600 dark:text-amber-400"
                                    aria-label="לא עומד בקריטריונים"
                                  />
                                )}
                                <span className="text-sm text-foreground/85">
                                  {p.name}
                                </span>
                                <span className="text-xs text-muted-foreground num">
                                  גיל {p.age} · {p.israeliRating}
                                </span>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => onRemovePlayer(p.id)}
                                aria-label={`הסר ${p.name}`}
                                className="size-7 rounded-lg text-foreground/50 hover:bg-foreground/10 hover:text-foreground"
                              >
                                <X className="size-4" />
                              </Button>
                            </div>
                          );
                        })}
                      </motion.div>
                    )}
                  </>
                )}

                {tab === "equipment" && (
                  <>
                    {values.equipment.map((line) => (
                      <EquipmentRow
                        key={line.id}
                        line={line}
                        onChange={(patch) => onUpdateEquipment(line.id, patch)}
                        onRemove={() => onRemoveEquipment(line.id)}
                        container={container}
                      />
                    ))}

                    <motion.div variants={itemVariants}>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={onAddEquipment}
                        className="h-9 w-full justify-center gap-1.5 rounded-xl text-sm font-normal neu-raised-xs neu-interactive"
                      >
                        <Plus className="size-4 text-primary/70" />
                        הוסף ציוד
                      </Button>
                    </motion.div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
            </fieldset>
          </div>
        </Tabs>

        <DialogFooter
          className={cn(
            "gap-2",
            confirmingClose
              ? "sm:justify-start"
              : "sm:flex-row-reverse sm:justify-end",
          )}
        >
          {confirmingClose ? (
            <UnsavedCloseBar
              nudge={closeNudge}
              onConfirmClose={onConfirmClose}
              onCancelClose={onCancelClose}
            />
          ) : (
            <>
          {!readOnly && tab === "players" && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {}}
              className="group/btn relative ms-auto h-9 w-fit justify-center gap-1.5 overflow-hidden rounded-xl px-3.5 text-xs font-medium neu-raised-xs neu-interactive tint-indigo"
            >
              <span className="absolute inset-x-0 top-0 h-1 tint-bar origin-center scale-x-0 group-hover/btn:scale-x-100 transition-transform duration-700 ease-out" />
              <FileDown className="size-4 text-[#217346]" />
              ייצוא לאקסל
            </Button>
          )}
          {!readOnly && (
            <Button
              type="button"
              disabled={!valid}
              onClick={onConfirm}
              className="rounded-xl"
            >
              {mode === "edit" ? "עדכון" : "אישור"}
            </Button>
          )}
          <Button
            type="button"
            variant={readOnly ? "default" : "ghost"}
            onClick={() => onOpenChange(false)}
            className="rounded-xl"
          >
            {readOnly ? "סגירה" : "ביטול"}
          </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>

      <AddSourceChoiceDialog
        open={sourceChoiceOpen}
        onOpenChange={onSourceChoiceOpenChange}
        noun="שחקנים"
        onChooseRoster={onChoosePlayersFromRoster}
        onChooseAll={onChoosePlayersFromAll}
      />

      <RosterChoiceDialog
        open={rosterChoiceOpen}
        onOpenChange={onRosterChoiceOpenChange}
        noun="שחקנים"
        rosters={playerRosters}
        onSelect={onSelectPlayerRoster}
        onBack={onBackToSourceChoice}
      />

      <PeoplePickerDialog
        open={playerPickerOpen}
        onOpenChange={onPlayerPickerOpenChange}
        people={availablePlayers}
        checkedIds={checkedPlayerIds}
        disabledIds={pickerDisabledIds}
        onToggle={onToggleCheckedPlayer}
        onConfirm={onConfirmPlayers}
        noun={{ plural: "שחקנים", singular: "שחקן" }}
      />
    </Dialog>
  );
}
