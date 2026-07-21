"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarHeart,
  Check,
  ChevronDown,
  CalendarRange,
  FileDown,
  Package,
  Plus,
  Search,
  Trash2,
  Users,
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
import { EnrolledPersonRow } from "@/components/shared/EnrolledPersonRow";
import { UnsavedCloseBar } from "@/components/shared/UnsavedCloseBar";
import { ConflictWarning } from "@/components/schedule/ConflictWarning";
import type { DraftConflict } from "@/lib/conflicts";
import {
  AddSourceChoiceDialog,
  RosterChoiceDialog,
  type RosterOption,
} from "@/components/shared/AddSourceDialogs";
import { cn } from "@/lib/utils";
import {
  OUTSIDE_CLUB_ROOM,
  type Room,
  type Equipment,
} from "@/lib/rooms-data";
import { useCollection } from "@/lib/firebase/useCollection";
import {
  availableEquipmentOptions,
  equipmentAvailableNow,
  equipmentByName,
} from "@/lib/course-form";
import {
  EVENT_FREQUENCY_OPTIONS,
  type EventFormValues,
  type EventFormat,
  type EventFrequency,
  type EquipmentLineValues,
} from "@/lib/event-form";
import type { EventModalMode, EventTab } from "@/hooks/events/useAddEvent";
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

/** A single-select dropdown with a text-search box, portalled into the dialog. */
function SearchSelect({
  value,
  onChange,
  options,
  placeholder,
  searchPlaceholder,
  container,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  searchPlaceholder: string;
  container: HTMLElement | null;
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
                    <span className="text-center">{o}</span>
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

function EquipmentRow({
  line,
  onChange,
  onRemove,
  container,
  options,
  items,
}: {
  line: EquipmentLineValues;
  onChange: (patch: Partial<EquipmentLineValues>) => void;
  onRemove: () => void;
  container: HTMLElement | null;
  options: string[];
  items: Equipment[];
}) {
  const selected = equipmentByName(line.equipmentId, items);
  const available = selected ? equipmentAvailableNow(selected) : null;
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
            options={options}
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
        <p className="text-xs text-amber-600 dark:text-amber-400">
          הכמות חורגת מהמלאי הפנוי ({available}).
        </p>
      )}
    </motion.div>
  );
}

const FORMAT_OPTIONS: { value: EventFormat; label: string }[] = [
  { value: "oneoff", label: "חד פעמי" },
  { value: "recurring", label: "קבוע" },
];

/** An animated two-option segmented control for the event frequency mode. */
function FormatToggle({
  value,
  onChange,
}: {
  value: EventFormat;
  onChange: (value: EventFormat) => void;
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
                layoutId="event-format-highlight"
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
    layoutId="add-event-tab-highlight"
    className="absolute inset-0 rounded-lg border-2 border-primary bg-primary/5"
    transition={{ type: "spring", stiffness: 420, damping: 34 }}
  />
);

interface AddEventModalProps {
  open: boolean;
  mode: EventModalMode;
  onOpenChange: (open: boolean) => void;
  confirmingClose: boolean;
  closeNudge: number;
  onConfirmClose: () => void;
  onCancelClose: () => void;
  tab: EventTab;
  onTabChange: (tab: EventTab) => void;
  values: EventFormValues;
  onFieldChange: <K extends keyof EventFormValues>(
    field: K,
    value: EventFormValues[K],
  ) => void;
  valid: boolean;
  onConfirm: () => void;
  onFormatChange: (format: EventFormat) => void;
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
  equipmentItems: Equipment[];
  conflicts: DraftConflict[];
}

export function AddEventModal({
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
  equipmentItems,
  conflicts,
}: AddEventModalProps) {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  // Rooms come from the live Firestore roster, so the frequency pickers list the
  // club's real rooms (plus the explicit "outside the club" choice), not a stale
  // mock.
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
              ? "צפייה באירוע"
              : mode === "edit"
                ? "עריכת אירוע"
                : "הוספת אירוע"}
          </DialogTitle>
          <DialogDescription>
            {readOnly ? (
              "פרטי האירוע מוצגים לצפייה בלבד."
            ) : (
              <>
                שדות המסומנים ב־
                <span className="text-destructive">*</span> הם שדות חובה.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {!readOnly && <ConflictWarning conflicts={conflicts} />}

        <Tabs
          value={tab}
          onValueChange={(v) => onTabChange(v as EventTab)}
          dir="rtl"
          className="min-h-0 flex-1 gap-4"
        >
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="details" className="relative">
              {tab === "details" && tabHighlight}
              <span className="relative z-10 flex items-center gap-1.5">
                <CalendarHeart className="size-4" />
                פרטים
              </span>
            </TabsTrigger>
            <TabsTrigger value="frequency" className="relative">
              {tab === "frequency" && tabHighlight}
              <span className="relative z-10 flex items-center gap-1.5">
                <CalendarRange className="size-4" />
                תדירות
              </span>
            </TabsTrigger>
            <TabsTrigger value="players" className="relative">
              {tab === "players" && tabHighlight}
              <span className="relative z-10 flex items-center gap-1.5">
                <Users className="size-4" />
                משתתפים
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
                        <FieldLabel required>שם האירוע</FieldLabel>
                        <Input
                          value={values.name}
                          onChange={(e) =>
                            onFieldChange("name", e.target.value)
                          }
                          className={fieldClass}
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

                {tab === "frequency" && (
                  <>
                    <Field>
                      <FormatToggle
                        value={values.format}
                        onChange={onFormatChange}
                      />
                    </Field>

                    <AnimatePresence mode="wait" initial={false}>
                      {values.format === "oneoff" ? (
                        <motion.div
                          key="oneoff"
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
                                value={values.oneoffRoom}
                                onChange={(v) => onFieldChange("oneoffRoom", v)}
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
                                value={values.oneoffDate}
                                onChange={(e) =>
                                  onFieldChange("oneoffDate", e.target.value)
                                }
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
                                value={values.oneoffStartTime}
                                onChange={(e) =>
                                  onFieldChange(
                                    "oneoffStartTime",
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
                                value={values.oneoffEndTime}
                                onChange={(e) =>
                                  onFieldChange("oneoffEndTime", e.target.value)
                                }
                                className={dateFieldClass}
                              />
                            </div>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="recurring"
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
                                value={values.recurringRoom}
                                onChange={(v) =>
                                  onFieldChange("recurringRoom", v)
                                }
                                options={roomOptions}
                                placeholder="בחר חדר"
                                searchPlaceholder="חיפוש חדר…"
                                container={container}
                              />
                            </div>
                            <div className="space-y-1.5">
                              <FieldLabel required>תדירות</FieldLabel>
                              <Select
                                value={values.recurringFrequency}
                                onValueChange={(v) =>
                                  onFieldChange(
                                    "recurringFrequency",
                                    v as EventFrequency,
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
                                  {EVENT_FREQUENCY_OPTIONS.map((f) => (
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
                                value={values.recurringStartTime}
                                onChange={(e) =>
                                  onFieldChange(
                                    "recurringStartTime",
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
                                value={values.recurringEndTime}
                                onChange={(e) =>
                                  onFieldChange(
                                    "recurringEndTime",
                                    e.target.value,
                                  )
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
                                value={values.recurringStartDate}
                                onChange={(e) =>
                                  onFieldChange(
                                    "recurringStartDate",
                                    e.target.value,
                                  )
                                }
                                className={dateFieldClass}
                              />
                            </div>
                            <div className="flex-1 space-y-1.5">
                              <FieldLabel required={values.recurringHasEndDate}>
                                תאריך סיום
                              </FieldLabel>
                              <Input
                                type="date"
                                value={values.recurringEndDate}
                                disabled={!values.recurringHasEndDate}
                                onChange={(e) =>
                                  onFieldChange(
                                    "recurringEndDate",
                                    e.target.value,
                                  )
                                }
                                className={cn(
                                  dateFieldClass,
                                  "disabled:opacity-40",
                                  values.recurringHasEndDate &&
                                    values.recurringEndDate &&
                                    "bg-primary/15! font-medium text-primary ring-1 ring-primary/30",
                                )}
                              />
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() =>
                                onFieldChange(
                                  "recurringHasEndDate",
                                  !values.recurringHasEndDate,
                                )
                              }
                              aria-pressed={values.recurringHasEndDate}
                              className={cn(
                                "group/btn relative h-9 shrink-0 overflow-hidden rounded-xl px-3 text-xs font-medium neu-raised-xs neu-interactive tint-indigo",
                                values.recurringHasEndDate
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
                                  {values.recurringHasEndDate
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
                        הוסף משתתפים
                      </Button>
                    </Field>

                    {players.length === 0 ? (
                      <motion.p
                        variants={itemVariants}
                        className="py-8 text-center text-sm text-muted-foreground"
                      >
                        אין משתתפים רשומים עדיין.
                      </motion.p>
                    ) : (
                      <motion.div
                        variants={itemVariants}
                        className="space-y-1.5"
                      >
                        {players.map((p) => (
                          <EnrolledPersonRow
                            key={p.id}
                            person={p}
                            mismatchReasons={[]}
                            onRemove={() => onRemovePlayer(p.id)}
                            removeLabel={`הסר ${p.name}`}
                            container={container}
                          />
                        ))}
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
                        options={availableEquipmentOptions(
                          values.equipment,
                          line.id,
                          equipmentItems,
                        )}
                        items={equipmentItems}
                      />
                    ))}

                    <motion.div variants={itemVariants}>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={onAddEquipment}
                        disabled={
                          availableEquipmentOptions(
                            values.equipment,
                            "",
                            equipmentItems,
                          ).length === 0
                        }
                        className="h-9 w-full justify-center gap-1.5 rounded-xl text-sm font-normal neu-raised-xs neu-interactive disabled:opacity-45"
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
        noun="משתתפים"
        onChooseRoster={onChoosePlayersFromRoster}
        onChooseAll={onChoosePlayersFromAll}
      />

      <RosterChoiceDialog
        open={rosterChoiceOpen}
        onOpenChange={onRosterChoiceOpenChange}
        noun="משתתפים"
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
        noun={{ plural: "משתתפים", singular: "משתתף" }}
      />
    </Dialog>
  );
}
