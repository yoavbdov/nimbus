"use client";

import { motion } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

type CheckedState = boolean | "indeterminate";

interface SelectCheckboxProps {
  checked: CheckedState;
  onCheckedChange: (checked: boolean) => void;
  ariaLabel: string;
  className?: string;
  disabled?: boolean;
}

/**
 * Animated selection checkbox for tables. Presentational only — the parent
 * owns the checked state. Stops click propagation so toggling a row's
 * checkbox never triggers the row's own click handler.
 */
export function SelectCheckbox({
  checked,
  onCheckedChange,
  ariaLabel,
  className,
  disabled,
}: SelectCheckboxProps) {
  const isChecked = checked === true;

  return (
    <motion.span
      className="inline-flex"
      onClick={(e) => e.stopPropagation()}
      whileTap={{ scale: 0.8 }}
      animate={{ scale: isChecked ? [1, 1.25, 1] : 1 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
    >
      <Checkbox
        checked={checked}
        disabled={disabled}
        onCheckedChange={(value) => onCheckedChange(value === true)}
        aria-label={ariaLabel}
        className={cn(
          "size-4 rounded-[5px] border-0 neu-raised-xs shadow-none transition-colors",
          className,
        )}
      />
    </motion.span>
  );
}
