"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { IdCard, UserRound } from "lucide-react";
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  birthYearOptions,
  CHESS_TITLES,
  daysInMonth,
  GRADE_OPTIONS,
  HEBREW_MONTHS,
  type BirthDateParts,
  type PlayerFormValues,
} from "@/lib/player-form";

const YEAR_OPTIONS = birthYearOptions();

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

// Fields sit inset (darker than the lighter popover) so they read as distinct,
// pressed-in boxes against the modal background. RTL text by default.
const fieldClass =
  "h-9 rounded-xl neu-inset border-0 bg-foreground/8! px-3 text-start text-foreground placeholder:text-muted-foreground/70";
const triggerClass = `${fieldClass} w-full`;
// Dropdowns: center the chosen value in the box (chevron stays at the edge).
const selectTriggerClass = cn(
  triggerClass,
  "text-center [&_[data-slot=select-value]]:flex-1 [&_[data-slot=select-value]]:justify-center",
);
// Open list: match the box width and center every row.
const selectContentClass =
  "w-(--radix-select-trigger-width) min-w-(--radix-select-trigger-width) [&_[data-slot=select-item]]:justify-center [&_[data-slot=select-item]]:pl-8 [&_[data-slot=select-item]]:text-center";
// Gender boxes: same inset/gray field look; the chosen one fills with primary.
const genderItemClass =
  "h-9 flex-1 rounded-xl neu-inset border-0 bg-foreground/8! text-sm font-normal text-foreground/70 data-[state=on]:bg-primary! data-[state=on]:text-primary-foreground data-[state=on]:shadow-none";

/** A field label; pass `required` to render the red asterisk marking a חובה field. */
function FieldLabel({
  htmlFor,
  required,
  children,
}: {
  htmlFor?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    // Keep the htmlFor link for screen readers, but cancel the click's default
    // so clicking the label text doesn't focus the input — only the box itself does.
    <Label
      htmlFor={htmlFor}
      onClick={(e) => e.preventDefault()}
      className="w-fit cursor-default gap-1 text-foreground/80"
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

interface AddPlayerModalProps {
  open: boolean;
  /** "add" shows the empty add flow; "edit" reframes it for an existing player. */
  mode?: "add" | "edit";
  onOpenChange: (open: boolean) => void;
  values: PlayerFormValues;
  onFieldChange: <K extends keyof PlayerFormValues>(
    field: K,
    value: PlayerFormValues[K],
  ) => void;
  birthParts: BirthDateParts;
  onBirthPartChange: (part: keyof BirthDateParts, value: string) => void;
  onGradeChange: (grade: string) => void;
  valid: boolean;
  onConfirm: () => void;
}

export function AddPlayerModal({
  open,
  mode = "add",
  onOpenChange,
  values,
  onFieldChange,
  birthParts,
  onBirthPartChange,
  onGradeChange,
  valid,
  onConfirm,
}: AddPlayerModalProps) {
  const [tab, setTab] = useState("personal");
  const dayCount = daysInMonth(birthParts.year, birthParts.month);
  const isEdit = mode === "edit";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="top-[7vh] max-w-lg translate-y-0">
        <DialogHeader>
          <DialogTitle>{isEdit ? "עריכת שחקן" : "הוספת שחקן"}</DialogTitle>
          <DialogDescription>
            מלאו את הפרטים. שדות המסומנים ב־
            <span className="text-destructive">*</span> הם שדות חובה.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab} dir="rtl" className="gap-4">
          <TabsList>
            <TabsTrigger value="personal" className="relative">
              {tab === "personal" && (
                <motion.span
                  layoutId="add-player-tab-highlight"
                  className="absolute inset-0 rounded-lg border-2 border-primary bg-primary/5"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <UserRound />
                מידע אישי
              </span>
            </TabsTrigger>
            <TabsTrigger value="player" className="relative">
              {tab === "player" && (
                <motion.span
                  layoutId="add-player-tab-highlight"
                  className="absolute inset-0 rounded-lg border-2 border-primary bg-primary/5"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <IdCard />
                פרטי שחקן
              </span>
            </TabsTrigger>
          </TabsList>

          {/* The active panel sits in flow so the content area (and the footer
              below it) sizes to it; the inactive panel is taken out of flow so
              it doesn't add height. The dialog is top-anchored, so the top stays
              put while the footer rises on the shorter tab. */}
          <div className="relative">
            <motion.div
              className={cn(
                tab === "personal" ? "relative" : "absolute inset-x-0 top-0",
              )}
              initial={false}
              animate={
                tab === "personal"
                  ? { opacity: 1, x: 0, filter: "blur(0px)" }
                  : { opacity: 0, x: 24, filter: "blur(4px)" }
              }
              transition={{ duration: 0.3, ease }}
              style={{ pointerEvents: tab === "personal" ? "auto" : "none" }}
              aria-hidden={tab !== "personal"}
            >
              <motion.div
                className="space-y-4"
                variants={bodyVariants}
                initial="hidden"
                animate="show"
              >
                <div className="grid grid-cols-3 gap-3">
                  <Field>
                    <FieldLabel htmlFor="firstName" required>
                      שם פרטי
                    </FieldLabel>
                    <Input
                      id="firstName"
                      value={values.firstName}
                      onChange={(e) =>
                        onFieldChange("firstName", e.target.value)
                      }
                      className={fieldClass}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="lastName" required>
                      שם משפחה
                    </FieldLabel>
                    <Input
                      id="lastName"
                      value={values.lastName}
                      onChange={(e) =>
                        onFieldChange("lastName", e.target.value)
                      }
                      className={fieldClass}
                    />
                  </Field>
                  <Field>
                    <FieldLabel required>מין</FieldLabel>
                    <ToggleGroup
                      type="single"
                      value={values.gender}
                      onValueChange={(v) =>
                        v &&
                        onFieldChange("gender", v as PlayerFormValues["gender"])
                      }
                      className="w-full gap-2"
                    >
                      <ToggleGroupItem value="זכר" className={genderItemClass}>
                        זכר
                      </ToggleGroupItem>
                      <ToggleGroupItem value="נקבה" className={genderItemClass}>
                        נקבה
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </Field>
                </div>

                <div className="grid grid-cols-[1.15fr_0.95fr_0.7fr_1.4fr] gap-2">
                  <Field>
                    <FieldLabel required>שנה</FieldLabel>
                    <Select
                      value={birthParts.year}
                      onValueChange={(v) => onBirthPartChange("year", v)}
                    >
                      <SelectTrigger className={cn(selectTriggerClass, "px-2")}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent
                        dir="rtl"
                        position="popper"
                        className={selectContentClass}
                      >
                        {YEAR_OPTIONS.map((year) => (
                          <SelectItem key={year} value={String(year)}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field>
                    <FieldLabel required>חודש</FieldLabel>
                    <Select
                      value={birthParts.month}
                      onValueChange={(v) => onBirthPartChange("month", v)}
                    >
                      <SelectTrigger className={cn(selectTriggerClass, "px-2")}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent
                        dir="rtl"
                        position="popper"
                        className={selectContentClass}
                      >
                        {HEBREW_MONTHS.map((name, i) => (
                          <SelectItem key={name} value={String(i + 1)}>
                            {name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field>
                    <FieldLabel required>יום</FieldLabel>
                    <Select
                      value={birthParts.day}
                      onValueChange={(v) => onBirthPartChange("day", v)}
                    >
                      <SelectTrigger className={cn(selectTriggerClass, "px-2")}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent
                        dir="rtl"
                        position="popper"
                        className={selectContentClass}
                      >
                        {Array.from({ length: dayCount }, (_, i) => i + 1).map(
                          (day) => (
                            <SelectItem key={day} value={String(day)}>
                              {day}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field className="ms-3">
                    <FieldLabel>כיתה</FieldLabel>
                    <Select value={values.grade} onValueChange={onGradeChange}>
                      <SelectTrigger className={selectTriggerClass}>
                        <SelectValue placeholder="—" />
                      </SelectTrigger>
                      <SelectContent
                        dir="rtl"
                        position="popper"
                        className={selectContentClass}
                      >
                        {GRADE_OPTIONS.map((grade) => (
                          <SelectItem key={grade} value={grade}>
                            {grade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Field>
                    <FieldLabel htmlFor="idNumber">ת״ז</FieldLabel>
                    <Input
                      id="idNumber"
                      inputMode="numeric"
                      value={values.idNumber}
                      onChange={(e) =>
                        onFieldChange("idNumber", e.target.value)
                      }
                      className={fieldClass}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="phone">טלפון</FieldLabel>
                    <Input
                      id="phone"
                      inputMode="tel"
                      value={values.phone}
                      onChange={(e) => onFieldChange("phone", e.target.value)}
                      className={fieldClass}
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Field>
                    <FieldLabel htmlFor="email">אימייל</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      dir="ltr"
                      value={values.email}
                      onChange={(e) => onFieldChange("email", e.target.value)}
                      className={fieldClass}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="address">כתובת</FieldLabel>
                    <Input
                      id="address"
                      value={values.address}
                      onChange={(e) => onFieldChange("address", e.target.value)}
                      className={fieldClass}
                    />
                  </Field>
                </div>

                <Field>
                  <FieldLabel htmlFor="notes">הערות</FieldLabel>
                  <Textarea
                    id="notes"
                    value={values.notes}
                    onChange={(e) => onFieldChange("notes", e.target.value)}
                    className={cn(fieldClass, "h-auto min-h-20 py-2")}
                  />
                </Field>
              </motion.div>
            </motion.div>

            <motion.div
              className={cn(
                tab === "player" ? "relative" : "absolute inset-x-0 top-0",
              )}
              initial={false}
              animate={
                tab === "player"
                  ? { opacity: 1, x: 0, filter: "blur(0px)" }
                  : { opacity: 0, x: -24, filter: "blur(4px)" }
              }
              transition={{ duration: 0.3, ease }}
              style={{ pointerEvents: tab === "player" ? "auto" : "none" }}
              aria-hidden={tab !== "player"}
            >
              <motion.div
                className="space-y-4"
                variants={bodyVariants}
                initial="hidden"
                animate="show"
              >
                <div className="grid grid-cols-2 gap-3">
                  <Field>
                    <FieldLabel htmlFor="israeliPlayerId">
                      מס׳ שחקן באיגוד הישראלי
                    </FieldLabel>
                    <Input
                      id="israeliPlayerId"
                      inputMode="numeric"
                      value={values.israeliPlayerId}
                      onChange={(e) =>
                        onFieldChange("israeliPlayerId", e.target.value)
                      }
                      className={fieldClass}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="israeliRating">
                      מד כושר ישראלי
                    </FieldLabel>
                    <Input
                      id="israeliRating"
                      inputMode="numeric"
                      value={values.israeliRating}
                      onChange={(e) =>
                        onFieldChange("israeliRating", e.target.value)
                      }
                      className={fieldClass}
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Field>
                    <FieldLabel htmlFor="fidePlayerId">
                      מס׳ שחקן בפיד״ה
                    </FieldLabel>
                    <Input
                      id="fidePlayerId"
                      inputMode="numeric"
                      value={values.fidePlayerId}
                      onChange={(e) =>
                        onFieldChange("fidePlayerId", e.target.value)
                      }
                      className={fieldClass}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="fideRating">מד כושר בפיד״ה</FieldLabel>
                    <Input
                      id="fideRating"
                      inputMode="numeric"
                      value={values.fideRating}
                      onChange={(e) =>
                        onFieldChange("fideRating", e.target.value)
                      }
                      className={fieldClass}
                    />
                  </Field>
                </div>

                <Field className="mx-auto flex w-28 flex-col items-center">
                  <FieldLabel>תואר שחמטאי</FieldLabel>
                  <Select
                    value={values.title}
                    onValueChange={(v) =>
                      onFieldChange("title", v as PlayerFormValues["title"])
                    }
                  >
                    <SelectTrigger className={selectTriggerClass}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent
                      dir="rtl"
                      position="popper"
                      className={selectContentClass}
                    >
                      {CHESS_TITLES.map((title) => (
                        <SelectItem key={title} value={title}>
                          {title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </motion.div>
            </motion.div>
          </div>
        </Tabs>

        <DialogFooter className="gap-2 sm:justify-start">
          <Button
            type="button"
            disabled={!valid}
            onClick={onConfirm}
            className="rounded-xl"
          >
            {isEdit ? "עדכון" : "אישור"}
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
