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
import type { CoachFormValues } from "@/lib/coach-form";

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

interface AddCoachModalProps {
  open: boolean;
  /** "add" shows the empty add flow; "edit" reframes it for an existing coach. */
  mode?: "add" | "edit";
  onOpenChange: (open: boolean) => void;
  values: CoachFormValues;
  onFieldChange: <K extends keyof CoachFormValues>(
    field: K,
    value: CoachFormValues[K],
  ) => void;
  valid: boolean;
  onConfirm: () => void;
}

export function AddCoachModal({
  open,
  mode = "add",
  onOpenChange,
  values,
  onFieldChange,
  valid,
  onConfirm,
}: AddCoachModalProps) {
  const isEdit = mode === "edit";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="top-[7vh] max-w-lg translate-y-0">
        <DialogHeader>
          <DialogTitle>{isEdit ? "עריכת מדריך" : "הוספת מדריך"}</DialogTitle>
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
          <div className="grid grid-cols-2 gap-3">
            <Field>
              <FieldLabel htmlFor="firstName" required>
                שם פרטי
              </FieldLabel>
              <Input
                id="firstName"
                value={values.firstName}
                onChange={(e) => onFieldChange("firstName", e.target.value)}
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
                onChange={(e) => onFieldChange("lastName", e.target.value)}
                className={fieldClass}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
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
