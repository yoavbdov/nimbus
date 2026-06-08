"use client";

import * as React from "react";
import { CheckCheck, FileDown, FileUp, ListChecks, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { AttendanceClass } from "@/lib/attendance-data";

interface ActionButtonProps {
  icon: React.ElementType;
  label: string;
  variant?: "default" | "ghost";
  onClick?: () => void;
  iconClassName?: string;
}

function ActionButton({
  icon: Icon,
  label,
  variant = "ghost",
  onClick,
  iconClassName,
}: ActionButtonProps) {
  return (
    <Button
      type="button"
      variant={variant}
      onClick={onClick}
      className={cn(
        "group/btn relative overflow-hidden tint-indigo",
        "h-9 rounded-xl gap-1.5 px-3.5 text-xs font-medium neu-raised-xs neu-interactive",
        "transition-transform duration-200 hover:-translate-y-0.5 hover:scale-[1.03] active:scale-95",
        variant === "default" && "bg-transparent text-foreground hover:bg-transparent",
      )}
    >
      <span className="absolute inset-x-0 top-0 h-1 tint-bar origin-center scale-x-0 group-hover/btn:scale-x-100 transition-transform duration-700 ease-out" />
      <Icon className={cn("size-4", iconClassName)} />
      {label}
    </Button>
  );
}

interface AttendanceActionsProps {
  classes: AttendanceClass[];
}

export function AttendanceActions({ classes }: AttendanceActionsProps) {
  const [open, setOpen] = React.useState(false);
  const [picking, setPicking] = React.useState(false);
  const [selected, setSelected] = React.useState<Record<string, boolean>>({});

  const selectedCount = Object.values(selected).filter(Boolean).length;

  function reset() {
    setPicking(false);
    setSelected({});
  }

  function close() {
    setOpen(false);
    reset();
  }

  function toggle(id: string) {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) reset();
        }}
      >
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            className={cn(
              "group/btn relative overflow-hidden tint-indigo",
              "h-9 rounded-xl gap-1.5 px-3.5 text-xs font-medium neu-raised-xs neu-interactive",
              "transition-transform duration-200 hover:-translate-y-0.5 hover:scale-[1.03] active:scale-95",
            )}
          >
            <span className="absolute inset-x-0 top-0 h-1 tint-bar origin-center scale-x-0 group-hover/btn:scale-x-100 transition-transform duration-700 ease-out" />
            <FileDown className="size-4 text-[#217346]" />
            ייצוא לאקסל
          </Button>
        </PopoverTrigger>
        <PopoverContent dir="rtl" align="end" className="w-72">
          {!picking ? (
            <div className="flex flex-col gap-1.5">
              <p className="px-1 pb-1 text-xs text-foreground/60">
                מה לייצא?
              </p>
              <button
                type="button"
                onClick={close}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-start text-sm transition-colors hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                <Layers className="size-4 shrink-0" />
                <span>
                  <span className="block font-medium">ייצוא כל החוגים</span>
                  <span className="block text-xs text-foreground/50">
                    {classes.length} חוגים
                  </span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => setPicking(true)}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-start text-sm transition-colors hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                <ListChecks className="size-4 shrink-0" />
                <span>
                  <span className="block font-medium">בחר מהרשימה</span>
                  <span className="block text-xs text-foreground/50">
                    בחר אילו חוגים לייצא
                  </span>
                </span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between px-1">
                <p className="text-xs text-foreground/60">בחר חוגים לייצוא</p>
                <span className="text-xs text-foreground/50 num">
                  {selectedCount}/{classes.length}
                </span>
              </div>
              <ScrollArea className="h-56 -mx-1 px-1">
                <div className="flex flex-col gap-0.5">
                  {classes.map((cls) => (
                    <Label
                      key={cls.id}
                      className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-indigo-500/10"
                    >
                      <Checkbox
                        checked={!!selected[cls.id]}
                        onCheckedChange={() => toggle(cls.id)}
                      />
                      <span className="min-w-0">
                        <span className="block truncate font-medium">
                          {cls.name}
                        </span>
                        <span className="block truncate text-xs text-foreground/50">
                          {cls.coach}
                        </span>
                      </span>
                    </Label>
                  ))}
                </div>
              </ScrollArea>
              <Separator className="bg-foreground/8" />
              <div className="flex items-center justify-between gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setPicking(false)}
                  className="h-8 rounded-lg px-3 text-xs"
                >
                  חזרה
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={selectedCount === 0}
                  onClick={close}
                  className="h-8 gap-1.5 rounded-lg px-3 text-xs font-medium bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-500/30 hover:bg-indigo-500/25"
                >
                  <CheckCheck className="size-4" />
                  ייצא {selectedCount > 0 ? selectedCount : ""}
                </Button>
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>

      <ActionButton icon={FileUp} label="משיכה מאקסל" iconClassName="text-[#217346]" />
    </div>
  );
}
