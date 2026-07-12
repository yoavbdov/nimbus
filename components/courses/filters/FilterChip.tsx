"use client";

import { X } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FilterBuilder } from "@/components/courses/filters/FilterBuilder";
import { useDisclosure } from "@/hooks/useDisclosure";
import {
  FIELD_BY_KEY,
  formatValue,
  getOperator,
  type CourseFilter,
  type FieldOptions,
} from "@/lib/courses-filters";

interface FilterChipProps {
  filter: CourseFilter;
  onUpdate: (filter: CourseFilter) => void;
  onRemove: () => void;
  options?: FieldOptions;
}

export function FilterChip({ filter, onUpdate, onRemove, options }: FilterChipProps) {
  const { open, setOpen, close } = useDisclosure();
  const cfg = FIELD_BY_KEY[filter.field];
  const opDef = getOperator(filter.field, filter.op);
  const isNumeric = typeof filter.value === "number";
  const valueText = formatValue(filter);
  const hasValue = valueText.length > 0;

  function handleSubmit(next: CourseFilter) {
    onUpdate(next);
    close();
  }

  function handleRemove(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    onRemove();
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Badge
          asChild
          variant="ghost"
          className="group/chip h-8 ps-3 pe-1 rounded-full tint-indigo neu-raised-xs neu-interactive gap-1.5 text-xs max-w-full border-0 cursor-pointer"
        >
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.92, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -2 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="text-foreground/60 font-medium shrink-0">{cfg.label}</span>
            <span className="tint-text font-semibold shrink-0">
              {opDef?.label ?? filter.op}
            </span>
            {hasValue && (
              <span
                className={`${isNumeric ? "num text-foreground" : "text-foreground font-medium"} truncate max-w-44`}
                title={valueText}
              >
                {valueText}
              </span>
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleRemove}
              onPointerDown={(e) => e.stopPropagation()}
              aria-label="הסר פילטור"
              className="size-6 rounded-full ms-0.5 text-foreground/50 hover:text-foreground hover:bg-foreground/8 shrink-0"
            >
              <X className="size-3" />
            </Button>
          </motion.div>
        </Badge>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="start"
        sideOffset={8}
        dir="rtl"
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="w-auto max-w-[min(95vw,1000px)] p-0 rounded-2xl bg-popover ring-1 ring-foreground/15 shadow-depth-xl overflow-x-auto"
      >
        <FilterBuilder
          initial={filter}
          onSubmit={handleSubmit}
          onCancel={close}
          options={options}
        />
      </PopoverContent>
    </Popover>
  );
}
