"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FilterBuilder } from "@/components/coaches/filters/FilterBuilder";
import { useDisclosure } from "@/hooks/useDisclosure";
import type { CoachFilter } from "@/lib/coaches-filters";

interface AddFilterPopoverProps {
  onAdd: (filter: CoachFilter) => void;
}

export function AddFilterPopover({ onAdd }: AddFilterPopoverProps) {
  const { open, setOpen, close } = useDisclosure();

  function handleSubmit(filter: CoachFilter) {
    onAdd(filter);
    close();
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="group/btn relative overflow-hidden tint-indigo h-9 rounded-xl gap-1.5 px-3.5 text-xs font-medium neu-raised-xs neu-interactive"
        >
          <span className="absolute inset-x-0 top-0 h-1 tint-bar origin-center scale-x-0 group-hover/btn:scale-x-100 transition-transform duration-700 ease-out" />
          <Plus className="size-4" />
          הוסף פילטור
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="start"
        sideOffset={8}
        dir="rtl"
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="w-auto max-w-[min(95vw,1000px)] p-0 rounded-2xl bg-popover ring-1 ring-foreground/15 shadow-depth-xl overflow-x-auto"
      >
        <FilterBuilder onSubmit={handleSubmit} onCancel={close} />
      </PopoverContent>
    </Popover>
  );
}
