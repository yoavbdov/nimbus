"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, Check, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SingleEnumPicker,
  MultiEnumPicker,
} from "@/components/shared/filters/EnumValuePickers";
import { useFilterBuilder } from "@/hooks/activities/useFilterBuilder";
import {
  FIELD_BY_KEY,
  type FilterField,
  type ActivityFilter,
} from "@/lib/activities-filters";

const stepVariants = {
  initial: { opacity: 0, x: 8 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 8 },
};

const arrowVariants = {
  initial: { opacity: 0, x: 4 },
  animate: { opacity: 0.45, x: 0 },
  exit: { opacity: 0, x: 4 },
};

function StepLabel({ children }: { children: React.ReactNode }) {
  return (
    <Label className="text-[0.6rem] uppercase tracking-[0.14em] text-foreground/55 font-medium">
      {children}
    </Label>
  );
}

function StepShell({
  children,
  width = "w-fit",
  className = "",
}: {
  children: React.ReactNode;
  width?: string;
  className?: string;
}) {
  return (
    <motion.div
      variants={stepVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      <div className={`${width} shrink-0 space-y-1.5 px-1`}>{children}</div>
    </motion.div>
  );
}

function Arrow() {
  return (
    <motion.div
      variants={arrowVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="shrink-0 flex items-center text-foreground"
    >
      <ChevronLeft className="size-4" />
    </motion.div>
  );
}

const selectContentClass = "bg-popover ring-1 ring-foreground/15 shadow-depth-xl";

const triggerClass =
  "h-9 neu-inset border-0 rounded-lg text-xs min-w-36 w-fit whitespace-nowrap [&>span[data-slot=select-value]]:grow [&>span[data-slot=select-value]]:justify-center [&>span[data-slot=select-value]]:line-clamp-none [&>span[data-slot=select-value]]:overflow-visible";

const selectItemClass =
  "justify-center pl-8 pr-8 [&>span:last-child]:grow [&>span:last-child]:justify-center";

interface FilterBuilderProps {
  initial?: ActivityFilter;
  onSubmit: (filter: ActivityFilter) => void;
  onCancel: () => void;
}

export function FilterBuilder({ initial, onSubmit, onCancel }: FilterBuilderProps) {
  const {
    field,
    op,
    textValue,
    multiValue,
    visibleFields,
    showAdvanced,
    toggleAdvanced,
    fieldDef,
    opDef,
    mode,
    hasOpStep,
    showValueStep,
    showActions,
    canSubmit,
    handleFieldChange,
    handleOpChange,
    setTextValue,
    setMultiValue,
    submit,
    isEditing,
  } = useFilterBuilder({ initial, onSubmit });

  return (
    <motion.div
      layout
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      dir="rtl"
      className="flex items-center gap-1 p-3"
    >
      <StepShell>
        <StepLabel>שדה</StepLabel>
        <Select
          value={field || undefined}
          onValueChange={(v) => handleFieldChange(v as FilterField)}
        >
          <SelectTrigger className={triggerClass}>
            <SelectValue placeholder="בחר שדה" />
          </SelectTrigger>
          <SelectContent position="popper" className={selectContentClass}>
            {visibleFields.map((c) => (
              <SelectItem key={c.field} value={c.field} className={selectItemClass}>
                {c.label}
              </SelectItem>
            ))}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                toggleAdvanced();
              }}
              className="mt-1 flex w-full items-center justify-center gap-1.5 border-t border-foreground/10 px-2 pt-2 pb-1 text-[0.7rem] font-medium text-foreground/60 hover:text-foreground"
            >
              <SlidersHorizontal className="size-3" />
              {showAdvanced ? "פילטור בסיסי" : "פילטור מתקדם"}
            </button>
          </SelectContent>
        </Select>
      </StepShell>

      <AnimatePresence initial={false}>
        {hasOpStep && <Arrow key="arrow-1" />}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {hasOpStep && field && (
          <StepShell key="op">
            <StepLabel>תנאי</StepLabel>
            <Select value={op || undefined} onValueChange={handleOpChange}>
              <SelectTrigger className={triggerClass}>
                <SelectValue placeholder="בחר תנאי" />
              </SelectTrigger>
              <SelectContent position="popper" className={selectContentClass}>
                {FIELD_BY_KEY[field].operators.map((o) => (
                  <SelectItem key={o.op} value={o.op} className={selectItemClass}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </StepShell>
        )}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {showValueStep && <Arrow key="arrow-2" />}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {showValueStep && fieldDef && opDef && mode && (
          <StepShell
            key="value"
            width={
              mode === "single-enum" || mode === "multi-enum"
                ? "w-56"
                : "min-w-36 w-fit"
            }
          >
            <StepLabel>ערך</StepLabel>
            {mode === "text" && (
              <Input
                autoFocus
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                className="h-9 w-36 text-xs neu-inset border-0 rounded-sm text-center"
              />
            )}
            {mode === "number" && (
              <Input
                autoFocus
                inputMode="numeric"
                value={textValue}
                onChange={(e) => setTextValue(e.target.value.replace(/\D/g, ""))}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                className="h-9 w-36 text-xs neu-inset border-0 rounded-lg text-center num"
              />
            )}
            {mode === "single-enum" && (
              <SingleEnumPicker
                options={fieldDef.options ?? []}
                value={textValue}
                onChange={setTextValue}
              />
            )}
            {mode === "multi-enum" && (
              <MultiEnumPicker
                options={fieldDef.options ?? []}
                value={multiValue}
                onChange={setMultiValue}
              />
            )}
          </StepShell>
        )}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {showActions && <Arrow key="arrow-3" />}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {showActions && (
          <StepShell key="actions" width="w-auto">
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-9 rounded-lg text-xs px-2.5"
                onClick={onCancel}
              >
                ביטול
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={!canSubmit}
                onClick={submit}
                className="h-9 rounded-lg text-xs px-3 gap-1.5 neu-raised-xs neu-interactive bg-transparent text-foreground hover:bg-transparent tint-indigo disabled:opacity-40"
              >
                <Check className="size-3.5" />
                {isEditing ? "שמור" : "הוסף"}
              </Button>
            </div>
          </StepShell>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
