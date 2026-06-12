"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, ChevronDown, X } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { equipment } from "@/lib/rooms-data";
import type { RoomFormValues } from "@/lib/room-form";

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

/** Equipment options come from the physical equipment inventory. */
const equipmentOptions = equipment.map((e) => e.name);

/** A field label; pass `required` to render the red asterisk marking a חובה field. */
function FieldLabel({
  htmlFor,
  required,
  className,
  children,
}: {
  htmlFor?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    // Keep the htmlFor link for screen readers, but cancel the click's default
    // so clicking the label text doesn't focus the input — only the box itself does.
    <Label
      htmlFor={htmlFor}
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

/** Multi-select of equipment, driven by props for its value. */
function EquipmentSelect({
  value,
  onChange,
  container,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  container: HTMLElement | null;
}) {
  function toggle(name: string) {
    onChange(
      value.includes(name) ? value.filter((v) => v !== name) : [...value, name],
    );
  }

  return (
    <div className="w-44 space-y-1.5">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            className={cn(
              fieldClass,
              "w-full justify-center gap-1.5 px-2 text-center font-normal text-muted-foreground/70 neu-interactive",
              value.length > 0 && "text-foreground",
            )}
          >
            {value.length > 0 ? `${value.length} נבחרו` : "בחרו ציוד"}
            <ChevronDown className="size-4 opacity-60" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          dir="rtl"
          container={container}
          className="w-(--radix-popover-trigger-width) p-1.5 bg-popover ring-1 ring-foreground/15 shadow-depth-xl"
        >
          {/* dir=ltr keeps the scrollbar on the right while each row stays RTL. */}
          <div
            dir="ltr"
            className="players-scroll max-h-60 overflow-y-auto flex flex-col gap-0.5 pe-1"
          >
            {equipmentOptions.map((name) => {
              const checked = value.includes(name);
              return (
                <Button
                  key={name}
                  type="button"
                  variant="ghost"
                  dir="rtl"
                  onClick={() => toggle(name)}
                  className={cn(
                    "h-auto w-full justify-center gap-2 rounded-lg px-2.5 py-1.5 text-center text-sm font-normal",
                    checked
                      ? "bg-primary/20 font-medium text-primary hover:bg-primary/30 hover:text-primary"
                      : "text-foreground/80 hover:bg-primary/15 hover:text-foreground",
                  )}
                >
                  <span className="flex-1 text-center">{name}</span>
                  {checked && (
                    <Check className="size-4 shrink-0 text-primary" />
                  )}
                </Button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((name) => (
            <Badge
              key={name}
              variant="secondary"
              className="gap-1 rounded-full bg-primary/15 py-1 ps-2.5 pe-1 text-foreground"
            >
              <span>{name}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => toggle(name)}
                aria-label={`הסר ${name}`}
                className="size-auto rounded-full p-0.5 hover:bg-foreground/10"
              >
                <X className="size-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

interface AddRoomModalProps {
  open: boolean;
  /** "add" shows the empty add flow; "edit" reframes it for an existing room. */
  mode?: "add" | "edit";
  onOpenChange: (open: boolean) => void;
  values: RoomFormValues;
  onFieldChange: <K extends keyof RoomFormValues>(
    field: K,
    value: RoomFormValues[K],
  ) => void;
  valid: boolean;
  onConfirm: () => void;
}

export function AddRoomModal({
  open,
  mode = "add",
  onOpenChange,
  values,
  onFieldChange,
  valid,
  onConfirm,
}: AddRoomModalProps) {
  const isEdit = mode === "edit";
  // Portal target so the equipment dropdown's wheel-scroll isn't swallowed by
  // the dialog's scroll lock (which only allows scrolling inside the dialog).
  const [container, setContainer] = useState<HTMLElement | null>(null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        ref={setContainer}
        dir="rtl"
        className="top-[7vh] max-w-lg translate-y-0"
      >
        <DialogHeader>
          <DialogTitle>{isEdit ? "עריכת חדר" : "הוספת חדר"}</DialogTitle>
          <DialogDescription>
            שדות המסומנים ב־
            <span className="text-destructive">*</span> הם שדות חובה.
          </DialogDescription>
        </DialogHeader>

        <motion.div
          className="space-y-4"
          variants={bodyVariants}
          initial="hidden"
          animate="show"
        >
          <div className="flex items-start gap-3">
            <Field className="flex-1 min-w-0">
              <FieldLabel htmlFor="name" required className="mx-auto">
                שם חדר
              </FieldLabel>
              <Input
                id="name"
                value={values.name}
                onChange={(e) => onFieldChange("name", e.target.value)}
                className={fieldClass}
              />
            </Field>
            <Field className="shrink-0">
              <FieldLabel htmlFor="capacity" required className="mx-auto">
                קיבולת
              </FieldLabel>
              <Input
                id="capacity"
                inputMode="numeric"
                maxLength={4}
                value={values.capacity}
                onChange={(e) =>
                  onFieldChange(
                    "capacity",
                    e.target.value.replace(/\D/g, "").slice(0, 4),
                  )
                }
                className={cn(fieldClass, "num w-20 text-center")}
              />
            </Field>
            <Field className="shrink-0">
              <FieldLabel className="mx-auto">תכולה</FieldLabel>
              <EquipmentSelect
                value={values.equipment}
                onChange={(next) => onFieldChange("equipment", next)}
                container={container}
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

        <DialogFooter className="gap-2 sm:flex-row-reverse sm:justify-end">
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
