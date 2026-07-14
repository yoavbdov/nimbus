"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NoLimitToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
}

/**
 * A compact "no limit" toggle button placed beside a min/max range, styled like
 * the tournament form's toggle buttons. Presentational — the parent owns the
 * checked state. When on, the matching range is treated as unbounded.
 */
export function NoLimitToggle({
  checked,
  onCheckedChange,
  label,
}: NoLimitToggleProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      onClick={() => onCheckedChange(!checked)}
      aria-pressed={checked}
      className={cn(
        "group/btn relative h-9 shrink-0 overflow-hidden rounded-xl px-3 text-xs font-medium neu-raised-xs neu-interactive tint-indigo",
        checked
          ? "bg-primary/20! text-primary ring-1 ring-primary/40"
          : "text-foreground/70",
      )}
    >
      <span className="absolute inset-x-0 top-0 h-1 tint-bar origin-center scale-x-0 transition-transform duration-700 ease-out group-hover/btn:scale-x-100" />
      {label}
    </Button>
  );
}
