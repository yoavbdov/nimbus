"use client";

import { PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { playerActions, type PlayerAction } from "@/lib/player-actions";
import { cn } from "@/lib/utils";

interface PlayerActionsMenuContentProps {
  onSelect: (action: PlayerAction) => void;
}

export function PlayerActionsMenuContent({
  onSelect,
}: PlayerActionsMenuContentProps) {
  const regular = playerActions.filter((a) => a.variant === "default");
  const destructive = playerActions.filter((a) => a.variant === "destructive");

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
      {regular.map((action) => (
        <Button
          key={action.id}
          variant="ghost"
          onClick={() => onSelect(action)}
          className={cn(
            "group w-full justify-start gap-2.5 rounded-lg px-2.5 py-2 h-auto",
            "text-sm font-normal text-foreground/85",
            "hover:bg-primary/15 hover:text-foreground hover:pe-1",
            "transition-all duration-150",
          )}
        >
          <action.icon className="size-4 text-primary/70 transition-colors group-hover:text-primary" />
          <span className="flex-1 text-start">{action.label}</span>
        </Button>
      ))}

      <Separator className="my-1 bg-linear-to-r from-transparent via-foreground/15 to-transparent" />

      {destructive.map((action) => (
        <Button
          key={action.id}
          variant="ghost"
          onClick={() => onSelect(action)}
          className={cn(
            "group w-full justify-start gap-2.5 rounded-lg px-2.5 py-2 h-auto",
            "text-sm font-normal text-destructive/90",
            "hover:bg-destructive/15 hover:text-destructive hover:pe-1",
            "transition-all duration-150",
          )}
        >
          <action.icon className="size-4 text-destructive/70 transition-colors group-hover:text-destructive" />
          <span className="flex-1 text-start">{action.label}</span>
        </Button>
      ))}
    </PopoverContent>
  );
}
