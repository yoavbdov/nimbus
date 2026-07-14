"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { SelectCheckbox } from "@/components/shared/SelectCheckbox";
import {
  usePeoplePicker,
  type PeopleSort,
  type PeopleSortKey,
} from "@/hooks/shared/usePeoplePicker";
import { cn } from "@/lib/utils";
import type { Player } from "@/lib/players-data";

const ease = [0.22, 1, 0.36, 1] as const;

const MotionTableRow = motion.create(TableRow);

const headClass =
  "px-3 py-2.5 text-center text-[0.7rem] font-medium uppercase tracking-[0.14em] text-foreground/70";

/** How the labels read for the two callers (players vs. students). */
export interface PeopleNoun {
  /** Plural, e.g. "שחקנים" / "תלמידים". */
  plural: string;
  /** Singular, e.g. "שחקן" / "תלמיד". */
  singular: string;
}

function SortIcon({
  sort,
  column,
}: {
  sort: PeopleSort;
  column: PeopleSortKey;
}) {
  if (!sort || sort.key !== column)
    return <ArrowUpDown className="size-3 text-foreground/40" />;
  return sort.dir === "asc" ? (
    <ArrowUp className="size-3 text-primary" />
  ) : (
    <ArrowDown className="size-3 text-primary" />
  );
}

/** A clickable column header that toggles sorting on its column. */
function SortableHead({
  column,
  label,
  className,
  sort,
  onToggle,
}: {
  column: PeopleSortKey;
  label: string;
  className?: string;
  sort: PeopleSort;
  onToggle: (key: PeopleSortKey) => void;
}) {
  return (
    <TableHead className={cn(headClass, className)}>
      <button
        type="button"
        onClick={() => onToggle(column)}
        className="mx-auto inline-flex items-center gap-1 transition-colors hover:text-foreground"
      >
        {label}
        <SortIcon sort={sort} column={column} />
      </button>
    </TableHead>
  );
}

interface PeoplePickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  people: Player[];
  checkedIds: string[];
  /** Already-enrolled people: shown greyed out and not selectable. */
  disabledIds: string[];
  onToggle: (id: string) => void;
  onConfirm: () => void;
  noun: PeopleNoun;
}

/**
 * A dialog table of available people (players/students) with checkboxes; confirm
 * adds all checked at once. Beyond name search it offers age/rating range
 * filters and click-to-sort on the גיל / מד כושר / שם columns, so a large roster
 * can be narrowed down before picking.
 */
export function PeoplePickerDialog({
  open,
  onOpenChange,
  people,
  checkedIds,
  disabledIds,
  onToggle,
  onConfirm,
  noun,
}: PeoplePickerDialogProps) {
  const {
    query,
    setQuery,
    ageMin,
    setAgeMin,
    ageMax,
    setAgeMax,
    ratingMin,
    setRatingMin,
    ratingMax,
    setRatingMax,
    sort,
    toggleSort,
    visible,
    filtersOpen,
    toggleFilters,
  } = usePeoplePicker(people, open);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="max-w-lg">
        <DialogHeader>
          <DialogTitle>הוספת {noun.plural}</DialogTitle>
          <DialogDescription>
            סמנו את ה{noun.plural} שברצונכם להוסיף בריבוע משמאל, ובסיום לחצו
            הוסף.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 inset-s-3 size-4 -translate-y-1/2 text-foreground/50" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`חיפוש ${noun.singular}…`}
              className="h-10 ps-9 rounded-xl neu-inset border-0 bg-foreground/5"
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            onClick={toggleFilters}
            className={cn(
              "h-10 shrink-0 gap-2 rounded-xl px-3.5 neu-raised-xs neu-interactive",
              filtersOpen && "tint-indigo tint-text",
            )}
          >
            <SlidersHorizontal className="size-4" />
            <span className="text-sm font-medium">סינון</span>
          </Button>
        </div>

        {/* Age + rating range filters. Blank bounds mean "no limit". */}
        <AnimatePresence initial={false}>
          {filtersOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, filter: "blur(4px)" }}
              animate={{ opacity: 1, height: "auto", filter: "blur(0px)" }}
              exit={{ opacity: 0, height: 0, filter: "blur(4px)" }}
              transition={{ duration: 0.28, ease }}
              className="overflow-hidden"
            >
              <div className="neu-inset space-y-3 rounded-2xl bg-foreground/5 p-3.5">
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground/55">
                  סינון לפי טווח
                </span>
                <RangeFilter
                  label="מד כושר"
                  min={ratingMin}
                  max={ratingMax}
                  onMinChange={setRatingMin}
                  onMaxChange={setRatingMax}
                />
                <RangeFilter
                  label="גיל"
                  min={ageMin}
                  max={ageMax}
                  onMinChange={setAgeMin}
                  onMaxChange={setAgeMax}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {visible.length === 0 ? (
          <Alert className="border-0 bg-transparent py-10 [&>svg]:hidden">
            <AlertTitle className="text-center text-sm font-normal text-foreground/60">
              לא נמצאו {noun.plural}
            </AlertTitle>
          </Alert>
        ) : (
          <div className="neu-inset rounded-2xl p-3">
            <div
              dir="ltr"
              className="players-scroll max-h-[50vh] overflow-y-auto overflow-x-hidden"
            >
              <div dir="rtl">
                <Table>
                  <TableHeader className="sticky top-0 z-10 bg-background/40 backdrop-blur-md [&_tr]:border-b-2 [&_tr]:border-border">
                    <TableRow className="hover:bg-transparent">
                      <SortableHead
                        column="name"
                        label={`שם ${noun.singular}`}
                        sort={sort}
                        onToggle={toggleSort}
                      />
                      <SortableHead
                        column="age"
                        label="גיל"
                        sort={sort}
                        onToggle={toggleSort}
                      />
                      <SortableHead
                        column="rating"
                        label="מד כושר"
                        sort={sort}
                        onToggle={toggleSort}
                      />
                      <TableHead className={cn(headClass, "w-12")} />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence initial={false}>
                    {visible.map((p, i) => {
                      const disabled = disabledIds.includes(p.id);
                      const checked = disabled || checkedIds.includes(p.id);
                      return (
                        <MotionTableRow
                          key={p.id}
                          layout
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.22, ease }}
                          onClick={() => !disabled && onToggle(p.id)}
                          className={cn(
                            "border-b-2 border-foreground/10 transition-colors duration-150",
                            i % 2 === 1 && "bg-primary/15",
                            disabled
                              ? "cursor-default opacity-45"
                              : cn(
                                  "cursor-pointer hover:bg-primary/25",
                                  checked && "bg-primary/20",
                                ),
                          )}
                        >
                          <TableCell className="px-3 py-2.5 text-center text-sm font-medium text-foreground">
                            <span className="inline-flex items-center gap-1.5">
                              {p.name}
                              {disabled && (
                                <span className="text-[0.7rem] font-normal text-muted-foreground">
                                  (כבר נוסף)
                                </span>
                              )}
                            </span>
                          </TableCell>
                          <TableCell className="px-3 py-2.5 text-center text-sm text-foreground/85 num">
                            {p.age}
                          </TableCell>
                          <TableCell className="px-3 py-2.5 text-center text-sm text-foreground/85 num">
                            {p.israeliRating}
                          </TableCell>
                          <TableCell className="px-3 py-2.5 text-center">
                            <div className="flex justify-center">
                              <SelectCheckbox
                                checked={checked}
                                disabled={disabled}
                                onCheckedChange={() =>
                                  !disabled && onToggle(p.id)
                                }
                                ariaLabel={`בחר ${p.name}`}
                              />
                            </div>
                          </TableCell>
                        </MotionTableRow>
                      );
                    })}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:flex-row-reverse sm:justify-end">
          <Button
            type="button"
            disabled={checkedIds.length === 0}
            onClick={onConfirm}
            className="rounded-xl"
          >
            הוסף{checkedIds.length > 0 ? ` (${checkedIds.length})` : ""}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="rounded-xl"
          >
            ביטול
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** A labelled "מ- / עד" pair of numeric inputs for one range filter. */
function RangeFilter({
  label,
  min,
  max,
  onMinChange,
  onMaxChange,
}: {
  label: string;
  min: string;
  max: string;
  onMinChange: (v: string) => void;
  onMaxChange: (v: string) => void;
}) {
  const onlyDigits = (v: string) => v.replace(/\D/g, "");
  return (
    <div className="flex items-center gap-3">
      <span className="flex w-24 shrink-0 items-center text-sm font-medium text-foreground/80">
        {label}
      </span>
      <div className="flex flex-1 items-center gap-2">
        <Input
          inputMode="numeric"
          value={min}
          onChange={(e) => onMinChange(onlyDigits(e.target.value))}
          placeholder="מ-"
          className="h-9 flex-1 rounded-xl border-0 bg-background/60 px-3 text-center text-sm num neu-inset placeholder:text-foreground/35"
        />
        <span className="text-foreground/30">–</span>
        <Input
          inputMode="numeric"
          value={max}
          onChange={(e) => onMaxChange(onlyDigits(e.target.value))}
          placeholder="עד"
          className="h-9 flex-1 rounded-xl border-0 bg-background/60 px-3 text-center text-sm num neu-inset placeholder:text-foreground/35"
        />
      </div>
    </div>
  );
}
