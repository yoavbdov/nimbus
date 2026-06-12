"use client";

import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { EquipmentFormValues } from "@/lib/equipment-form";

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
    <motion.div variants={itemVariants} className={cn("space-y-1.5", className)}>
      {children}
    </motion.div>
  );
}

interface AddEquipmentModalProps {
  open: boolean;
  /** "add" shows the empty add flow; "edit" reframes it for an existing item. */
  mode?: "add" | "edit";
  onOpenChange: (open: boolean) => void;
  values: EquipmentFormValues;
  onFieldChange: <K extends keyof EquipmentFormValues>(
    field: K,
    value: EquipmentFormValues[K],
  ) => void;
  valid: boolean;
  onConfirm: () => void;
}

export function AddEquipmentModal({
  open,
  mode = "add",
  onOpenChange,
  values,
  onFieldChange,
  valid,
  onConfirm,
}: AddEquipmentModalProps) {
  const isEdit = mode === "edit";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="top-[7vh] max-w-lg translate-y-0">
        <DialogHeader>
          <DialogTitle>{isEdit ? "עריכת ציוד" : "הוספת ציוד"}</DialogTitle>
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
                שם ציוד
              </FieldLabel>
              <Input
                id="name"
                value={values.name}
                onChange={(e) => onFieldChange("name", e.target.value)}
                className={fieldClass}
              />
            </Field>
            <Field className="shrink-0">
              <FieldLabel htmlFor="quantity" required className="mx-auto">
                כמות
              </FieldLabel>
              <Input
                id="quantity"
                inputMode="numeric"
                maxLength={4}
                value={values.quantity}
                onChange={(e) =>
                  onFieldChange(
                    "quantity",
                    e.target.value.replace(/\D/g, "").slice(0, 4),
                  )
                }
                className={cn(fieldClass, "num w-20 text-center")}
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
