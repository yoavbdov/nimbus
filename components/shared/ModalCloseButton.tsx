"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * The single close/cancel button used by every modal footer. Keeps the label,
 * styling and default `ghost` variant consistent across the app. Pass a custom
 * label via `children` (e.g. "ביטול"/"סגירה") and any other Button prop through.
 */
export function ModalCloseButton({
  className,
  variant = "ghost",
  children = "סגור",
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      type="button"
      variant={variant}
      className={cn("rounded-xl", className)}
      {...props}
    >
      {children}
    </Button>
  );
}
