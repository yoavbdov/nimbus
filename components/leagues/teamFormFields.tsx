"use client";

import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const ease = [0.22, 1, 0.36, 1] as const;

export const bodyVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.04 } },
};

export const itemVariants = {
  hidden: { opacity: 0, y: 10, filter: "blur(4px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.3, ease },
  },
};

// Fields sit inset (darker than the lighter popover) so they read as distinct,
// pressed-in boxes against the modal background.
export const fieldClass =
  "h-9 rounded-xl neu-inset border-0 bg-foreground/8! px-3 text-start text-foreground placeholder:text-muted-foreground/70";

// Dropdowns: center the chosen value in the box (chevron stays at the edge).
export const selectTriggerClass = cn(
  fieldClass,
  "w-full text-center [&_[data-slot=select-value]]:flex-1 [&_[data-slot=select-value]]:justify-center",
);
// Open list: match the box width and center every row (the check sits absolute
// so it never pushes the centered label sideways).
export const selectContentClass =
  "w-(--radix-select-trigger-width) min-w-(--radix-select-trigger-width) [&_[data-slot=select-item]]:justify-center [&_[data-slot=select-item]]:pl-8 [&_[data-slot=select-item]]:text-center";

/** A field label; pass `required` to render the red asterisk marking a חובה field. */
export function FieldLabel({
  required,
  className,
  children,
}: {
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Label className={cn("w-fit cursor-default gap-1 text-foreground/80", className)}>
      {children}
      {required && (
        <span className="text-destructive" aria-hidden>
          *
        </span>
      )}
    </Label>
  );
}

export function Field({
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

/** A single-select dropdown styled to match the inset modal fields. */
export function SelectField({
  value,
  options,
  placeholder,
  disabled,
  onChange,
}: {
  value: string;
  options: string[];
  placeholder: string;
  disabled?: boolean;
  onChange: (next: string) => void;
}) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className={selectTriggerClass}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent dir="rtl" position="popper" className={selectContentClass}>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
