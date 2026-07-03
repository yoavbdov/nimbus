"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * The single primary-action button used by every modal footer — "עדכון",
 * "אישור", "עריכה" etc. Keeps styling consistent across the app while letting
 * callers set the label via `children` and pass any other Button prop through
 * (e.g. `variant="destructive"` for delete dialogs, an icon inside `children`).
 */
export function ModalConfirmButton({
  className,
  children,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button type="button" className={cn("rounded-xl", className)} {...props}>
      {children}
    </Button>
  );
}
