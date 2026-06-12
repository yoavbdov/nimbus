"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  BookOpen,
  CalendarClock,
  Check,
  ChevronDown,
  FileDown,
  Package,
  Plus,
  Search,
  Trash2,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { SelectCheckbox } from "@/components/shared/SelectCheckbox";
import { cn } from "@/lib/utils";
import { ACTIVITY_DAYS, allActivityCoaches } from "@/lib/activities-data";
import { rooms, equipment } from "@/lib/rooms-data";
import {
  FREQUENCY_OPTIONS,
  equipmentAvailableNow,
  meetingEndDateValid,
  type ActivityFormValues,
  type EquipmentLineValues,
  type MeetingValues,
} from "@/lib/activity-form";
import type {
  ActivityModalMode,
  ActivityTab,
} from "@/hooks/activities/useAddActivity";
import type { Player } from "@/lib/players-data";

/** The "no coach" choice in the searchable coach dropdown (maps to "" in the form). */
const NO_COACH = "ללא מדריך";

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
// Native date inputs ignore text-align in Chrome, so center the internal flex
// fields-wrapper (and keep text-center for Firefox).
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
  /** An option rendered in a subtle red to mark it apart (e.g. "ללא מדריך"). */
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

const studentHeadClass =
  "px-3 py-2.5 text-center text-[0.7rem] font-medium uppercase tracking-[0.14em] text-foreground/70";

/** A dialog table of available students with checkboxes; confirm adds all checked at once. */
function StudentPickerDialog({
  open,
  onOpenChange,
  students,
  checkedIds,
  onToggle,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  students: Player[];
  checkedIds: string[];
  onToggle: (id: string) => void;
  onConfirm: () => void;
}) {
  const [query, setQuery] = useState("");
  const filtered = students.filter((p) =>
    p.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="max-w-lg">
        <DialogHeader>
          <DialogTitle>הוספת תלמידים</DialogTitle>
          <DialogDescription>
            סמנו את התלמידים שברצונכם להוסיף בריבוע משמאל, ובסיום לחצו הוסף.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 inset-s-2.5 size-4 -translate-y-1/2 text-foreground/50" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="חיפוש תלמיד…"
            className="h-9 ps-9 rounded-xl"
          />
        </div>

        {filtered.length === 0 ? (
          <Alert className="border-0 bg-transparent py-10 [&>svg]:hidden">
            <AlertTitle className="text-center text-sm font-normal text-foreground/60">
              לא נמצאו תלמידים
            </AlertTitle>
          </Alert>
        ) : (
          <div className="neu-inset rounded-2xl p-3">
            <div
              dir="ltr"
              className="players-scroll max-h-[50vh] overflow-y-auto overflow-x-hidden"
            >
              <div dir="rtl">
                <Table>
                  <TableHeader className="sticky top-0 z-10 bg-background/40 backdrop-blur-md [&_tr]:border-b-2 [&_tr]:border-border">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className={studentHeadClass}>
                        שם תלמיד
                      </TableHead>
                      <TableHead className={studentHeadClass}>גיל</TableHead>
                      <TableHead className={studentHeadClass}>
                        מד כושר
                      </TableHead>
                      <TableHead className={cn(studentHeadClass, "w-12")} />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((p, i) => {
                      const checked = checkedIds.includes(p.id);
                      return (
                        <TableRow
                          key={p.id}
                          onClick={() => onToggle(p.id)}
                          className={cn(
                            "cursor-pointer border-b-2 border-foreground/10 transition-colors duration-150 hover:bg-primary/25",
                            i % 2 === 1 && "bg-primary/15",
                            checked && "bg-primary/20",
                          )}
                        >
                          <TableCell className="px-3 py-2.5 text-center text-sm font-medium text-foreground">
                            {p.name}
                          </TableCell>
                          <TableCell className="px-3 py-2.5 text-center text-sm text-foreground/85 num">
                            {p.age}
                          </TableCell>
                          <TableCell className="px-3 py-2.5 text-center text-sm text-foreground/85 num">
                            {p.israeliRating}
                          </TableCell>
                          <TableCell className="px-3 py-2.5 text-center">
                            <div className="flex justify-center">
                              <SelectCheckbox
                                checked={checked}
                                onCheckedChange={() => onToggle(p.id)}
                                ariaLabel={`בחר ${p.name}`}
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:flex-row-reverse sm:justify-end">
          <Button
            type="button"
            disabled={checkedIds.length === 0}
            onClick={onConfirm}
            className="rounded-xl"
          >
            הוסף{checkedIds.length > 0 ? ` (${checkedIds.length})` : ""}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="rounded-xl"
          >
            ביטול
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MeetingCard({
  meeting,
  onChange,
  onRemove,
  container,
}: {
  meeting: MeetingValues;
  onChange: (patch: Partial<MeetingValues>) => void;
  onRemove: () => void;
  container: HTMLElement | null;
}) {
  const isRecurring = meeting.frequency !== "once";
  const showEndDateWarning =
    isRecurring && !meeting.noEndDate && !meetingEndDateValid(meeting);

  return (
    <motion.div
      variants={itemVariants}
      className="space-y-3 rounded-2xl neu-inset bg-foreground/5 p-3"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">מפגש קבוע</span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          aria-label="הסר מפגש"
          className="size-7 rounded-lg text-destructive/80 hover:bg-destructive/15 hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div className="space-y-1.5">
          <FieldLabel required>יום בשבוע</FieldLabel>
          <Select
            value={meeting.day}
            onValueChange={(v) => onChange({ day: v })}
          >
            <SelectTrigger className={selectTriggerClass}>
              <SelectValue placeholder="בחר יום" />
            </SelectTrigger>
            <SelectContent
              dir="rtl"
              position="popper"
              className={selectContentClass}
            >
              {ACTIVITY_DAYS.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <FieldLabel required>חדר</FieldLabel>
          <SearchSelect
            value={meeting.room}
            onChange={(v) => onChange({ room: v })}
            options={rooms.map((r) => r.name)}
            placeholder="בחר חדר"
            searchPlaceholder="חיפוש חדר…"
            container={container}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div className="space-y-1.5">
          <FieldLabel required>שעת התחלה</FieldLabel>
          <Input
            type="time"
            dir="rtl"
            value={meeting.startTime}
            onChange={(e) => onChange({ startTime: e.target.value })}
            className={dateFieldClass}
          />
        </div>
        <div className="space-y-1.5">
          <FieldLabel required>שעת סיום</FieldLabel>
          <Input
            type="time"
            dir="rtl"
            value={meeting.endTime}
            onChange={(e) => onChange({ endTime: e.target.value })}
            className={dateFieldClass}
          />
        </div>
      </div>

      <div className="flex items-end gap-2.5">
        <div className="flex-1 space-y-1.5">
          <FieldLabel required>תדירות</FieldLabel>
          <Select
            value={meeting.frequency}
            onValueChange={(v) =>
              onChange({ frequency: v as MeetingValues["frequency"] })
            }
          >
            <SelectTrigger
              className={cn(selectTriggerClass, "whitespace-nowrap")}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent
              dir="rtl"
              position="popper"
              className={selectContentClass}
            >
              {FREQUENCY_OPTIONS.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <AnimatePresence initial={false}>
          {isRecurring && (
            <motion.div
              key="end-date-controls"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.25, ease }}
              className="flex items-end gap-2.5 overflow-hidden"
            >
              <div className="w-32 shrink-0 space-y-1.5">
                <FieldLabel required>תאריך סיום</FieldLabel>
                <Input
                  type="date"
                  value={meeting.endDate}
                  disabled={meeting.noEndDate}
                  onChange={(e) => onChange({ endDate: e.target.value })}
                  className={cn(
                    dateFieldClass,
                    "disabled:opacity-40",
                    meeting.endDate &&
                      !meeting.noEndDate &&
                      "bg-primary/15! font-medium text-primary ring-1 ring-primary/30",
                  )}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onChange({ noEndDate: !meeting.noEndDate })}
                aria-pressed={meeting.noEndDate}
                className={cn(
                  "group/btn relative shrink-0 overflow-hidden tint-indigo",
                  "h-9 rounded-xl px-3 text-xs font-medium neu-raised-xs neu-interactive",
                  meeting.noEndDate
                    ? "bg-primary/20! text-primary ring-1 ring-primary/40"
                    : "text-foreground/70",
                )}
              >
                <span className="absolute inset-x-0 top-0 h-1 tint-bar origin-center scale-x-0 group-hover/btn:scale-x-100 transition-transform duration-700 ease-out" />
                ללא תאריך סיום
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {showEndDateWarning && (
        <WarningNote>
          תאריך הסיום חייב לחול ביום {meeting.day || "שבו החוג מתקיים"}.
        </WarningNote>
      )}
    </motion.div>
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

const tabHighlight = (
  <motion.span
    layoutId="add-activity-tab-highlight"
    className="absolute inset-0 rounded-lg border-2 border-primary bg-primary/5"
    transition={{ type: "spring", stiffness: 420, damping: 34 }}
  />
);

interface AddActivityModalProps {
  open: boolean;
  mode: ActivityModalMode;
  onOpenChange: (open: boolean) => void;
  tab: ActivityTab;
  onTabChange: (tab: ActivityTab) => void;
  values: ActivityFormValues;
  onFieldChange: <K extends keyof ActivityFormValues>(
    field: K,
    value: ActivityFormValues[K],
  ) => void;
  valid: boolean;
  onConfirm: () => void;
  onAddMeeting: () => void;
  onUpdateMeeting: (id: string, patch: Partial<MeetingValues>) => void;
  onRemoveMeeting: (id: string) => void;
  students: Player[];
  availableStudents: Player[];
  onRemoveStudent: (id: string) => void;
  studentPickerOpen: boolean;
  onStudentPickerOpenChange: (open: boolean) => void;
  onOpenStudentPicker: () => void;
  checkedStudentIds: string[];
  onToggleCheckedStudent: (id: string) => void;
  onConfirmStudents: () => void;
  onAddEquipment: () => void;
  onUpdateEquipment: (id: string, patch: Partial<EquipmentLineValues>) => void;
  onRemoveEquipment: (id: string) => void;
  coachWarning: boolean;
  capacityWarning: boolean;
  criteriaMismatch: (playerId: string) => boolean;
}

export function AddActivityModal({
  open,
  mode,
  onOpenChange,
  tab,
  onTabChange,
  values,
  onFieldChange,
  valid,
  onConfirm,
  onAddMeeting,
  onUpdateMeeting,
  onRemoveMeeting,
  students,
  availableStudents,
  onRemoveStudent,
  studentPickerOpen,
  onStudentPickerOpenChange,
  onOpenStudentPicker,
  checkedStudentIds,
  onToggleCheckedStudent,
  onConfirmStudents,
  onAddEquipment,
  onUpdateEquipment,
  onRemoveEquipment,
  coachWarning,
  capacityWarning,
  criteriaMismatch,
}: AddActivityModalProps) {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        ref={setContainer}
        dir="rtl"
        className="top-[6vh] flex max-h-[88vh] max-w-lg translate-y-0 flex-col"
      >
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "עריכת חוג" : "הוספת חוג"}</DialogTitle>
          <DialogDescription>
            שדות המסומנים ב־
            <span className="text-destructive">*</span> הם שדות חובה.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={tab}
          onValueChange={(v) => onTabChange(v as ActivityTab)}
          dir="rtl"
          className="min-h-0 flex-1 gap-4"
        >
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="details" className="relative">
              {tab === "details" && tabHighlight}
              <span className="relative z-10 flex items-center gap-1.5">
                <BookOpen className="size-4" />
                פרטים
              </span>
            </TabsTrigger>
            <TabsTrigger value="meetings" className="relative">
              {tab === "meetings" && tabHighlight}
              <span className="relative z-10 flex items-center gap-1.5">
                <CalendarClock className="size-4" />
                מפגשים
              </span>
            </TabsTrigger>
            <TabsTrigger value="students" className="relative">
              {tab === "students" && tabHighlight}
              <span className="relative z-10 flex items-center gap-1.5">
                <Users className="size-4" />
                תלמידים
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
                // Clip the entrance transform (children start at y:10) so it
                // doesn't briefly extend the scroll area and flash a scrollbar.
                className="space-y-4 overflow-hidden"
              >
                {tab === "details" && (
                  <>
                    <div className="grid grid-cols-[1fr_1fr_3.5rem] gap-3">
                      <Field>
                        <FieldLabel required>שם החוג</FieldLabel>
                        <Input
                          value={values.name}
                          onChange={(e) =>
                            onFieldChange("name", e.target.value)
                          }
                          className={fieldClass}
                        />
                      </Field>

                      <Field>
                        <FieldLabel className="ps-1">מדריך</FieldLabel>
                        <SearchSelect
                          value={values.coach || NO_COACH}
                          onChange={(v) =>
                            onFieldChange("coach", v === NO_COACH ? "" : v)
                          }
                          options={[NO_COACH, ...allActivityCoaches]}
                          placeholder={NO_COACH}
                          searchPlaceholder="חיפוש מדריך…"
                          container={container}
                          dangerOption={NO_COACH}
                        />
                      </Field>

                      <Field>
                        <FieldLabel>קיבולת</FieldLabel>
                        <Input
                          inputMode="numeric"
                          value={values.capacity}
                          onChange={(e) =>
                            onFieldChange(
                              "capacity",
                              e.target.value.replace(/\D/g, ""),
                            )
                          }
                          className={cn(fieldClass, "px-2 text-center num")}
                        />
                      </Field>
                    </div>

                    {/* Fixed-height slot so the coach warning doesn't grow the modal.
                        Mirrors the row's columns so it sits under the coach field. */}
                    <div className="-mt-2.5 grid h-4 grid-cols-[1fr_1fr_3.5rem] gap-3">
                      <div />
                      {coachWarning && (
                        <div className="ps-3">
                          <WarningNote>החוג יווצר ללא מדריך</WarningNote>
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

                {tab === "meetings" && (
                  <>
                    <Field className="flex flex-col items-center">
                      <FieldLabel required>תאריך התחלה</FieldLabel>
                      <Input
                        type="date"
                        value={values.startDate}
                        onChange={(e) =>
                          onFieldChange("startDate", e.target.value)
                        }
                        className={cn(dateFieldClass, "w-40")}
                      />
                    </Field>

                    {values.meetings.map((m) => (
                      <MeetingCard
                        key={m.id}
                        meeting={m}
                        onChange={(patch) => onUpdateMeeting(m.id, patch)}
                        onRemove={() => onRemoveMeeting(m.id)}
                        container={container}
                      />
                    ))}

                    <motion.div variants={itemVariants}>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={onAddMeeting}
                        className="h-9 w-full justify-center gap-1.5 rounded-xl text-sm font-normal neu-raised-xs neu-interactive"
                      >
                        <Plus className="size-4 text-primary/70" />
                        הוסף מפגש קבוע
                      </Button>
                    </motion.div>
                  </>
                )}

                {tab === "students" && (
                  <>
                    <Field>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={onOpenStudentPicker}
                        className="h-9 w-fit justify-center gap-1.5 rounded-xl px-3.5 text-sm font-normal neu-raised-xs neu-interactive"
                      >
                        <Plus className="size-4 text-primary/70" />
                        הוסף תלמידים
                      </Button>
                    </Field>

                    {students.length === 0 ? (
                      <motion.p
                        variants={itemVariants}
                        className="py-8 text-center text-sm text-muted-foreground"
                      >
                        אין תלמידים רשומים עדיין.
                      </motion.p>
                    ) : (
                      <motion.div
                        variants={itemVariants}
                        className="space-y-1.5"
                      >
                        {students.map((p) => {
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
                                onClick={() => onRemoveStudent(p.id)}
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

                    {capacityWarning && (
                      <motion.div variants={itemVariants}>
                        <WarningNote>
                          מספר התלמידים ({students.length}) חורג מהקיבולת (
                          {values.capacity}).
                        </WarningNote>
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
          </div>
        </Tabs>

        <DialogFooter className="gap-2 sm:flex-row-reverse sm:justify-end">
          <Button
            type="button"
            disabled={!valid}
            onClick={onConfirm}
            className="rounded-xl"
          >
            {mode === "edit" ? "עדכון" : "אישור"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="rounded-xl"
          >
            ביטול
          </Button>
          {tab === "students" && (
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
        </DialogFooter>
      </DialogContent>

      <StudentPickerDialog
        open={studentPickerOpen}
        onOpenChange={onStudentPickerOpenChange}
        students={availableStudents}
        checkedIds={checkedStudentIds}
        onToggle={onToggleCheckedStudent}
        onConfirm={onConfirmStudents}
      />
    </Dialog>
  );
}
