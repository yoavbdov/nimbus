"use client";

import type { LucideIcon } from "lucide-react";
import { PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

/** Common shape of every entity's action — kept structurally compatible. */
export interface BulkAction {
  id: string;
  label: string;
  icon: LucideIcon;
  variant: "default" | "destructive";
}

interface BulkActionsMenuContentProps {
  /** The full action list of the entity; only the bulk-capable ones are shown. */
  actions: BulkAction[];
  /** How many rows are currently selected. */
  count: number;
  onSelect: (action: BulkAction) => void;
}

/**
 * Action menu shown when clicking one of several selected rows. It exposes only
 * the actions that make sense for a whole selection: "בדוק זמינות" (when the
 * entity supports it) and the entity's delete action.
 */
export function BulkActionsMenuContent({
  actions,
  count,
  onSelect,
}: BulkActionsMenuContentProps) {
  const availability = actions.find((a) => a.id === "availability");
  const archive = actions.find((a) => a.id === "archive");
  const remove = actions.find((a) => a.id === "delete");

  return (
    <PopoverContent
      align="center"
      sideOffset={6}
      dir="rtl"
      className={cn(
        "w-56 p-1.5 gap-0.5 rounded-xl",
        "border-0 ring-1 ring-primary/25",
        "bg-background/70 backdrop-blur-2xl backdrop-saturate-150",
        "shadow-[0_10px_40px_-12px_oklch(0.58_0.19_278/0.55),0_0_0_1px_oklch(0.58_0.19_278/0.15)_inset]",
      )}
    >
      <p className="px-2.5 py-1.5 text-[0.7rem] font-medium text-foreground/50">
        {count} שורות נבחרו
      </p>

      {availability && (
        <Button
          variant="ghost"
          onClick={() => onSelect(availability)}
          className={cn(
            "group w-full justify-start gap-2.5 rounded-lg px-2.5 py-2 h-auto",
            "text-sm font-normal text-foreground/85",
            "hover:bg-primary/20 dark:hover:bg-primary/40 hover:text-foreground hover:pe-1",
            "transition-all duration-150",
          )}
        >
          <availability.icon className="size-4 text-primary/70 transition-colors group-hover:text-primary" />
          <span className="flex-1 text-start">{availability.label}</span>
        </Button>
      )}

      {archive && (
        <Button
          variant="ghost"
          onClick={() => onSelect(archive)}
          className={cn(
            "group w-full justify-start gap-2.5 rounded-lg px-2.5 py-2 h-auto",
            "text-sm font-normal text-foreground/85",
            "hover:bg-primary/20 dark:hover:bg-primary/40 hover:text-foreground hover:pe-1",
            "transition-all duration-150",
          )}
        >
          <archive.icon className="size-4 text-primary/70 transition-colors group-hover:text-primary" />
          <span className="flex-1 text-start">{archive.label}</span>
        </Button>
      )}

      {(availability || archive) && remove && (
        <Separator className="my-1 bg-linear-to-r from-transparent via-foreground/15 to-transparent" />
      )}

      {remove && (
        <Button
          variant="ghost"
          onClick={() => onSelect(remove)}
          className={cn(
            "group w-full justify-start gap-2.5 rounded-lg px-2.5 py-2 h-auto",
            "text-sm font-normal text-destructive/90",
            "hover:bg-destructive/20 dark:hover:bg-destructive/40 hover:text-destructive hover:pe-1",
            "transition-all duration-150",
          )}
        >
          <remove.icon className="size-4 text-destructive/70 transition-colors group-hover:text-destructive" />
          <span className="flex-1 text-start">{remove.label}</span>
        </Button>
      )}
    </PopoverContent>
  );
}
