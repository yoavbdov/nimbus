"use client";

import { Search } from "lucide-react";
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
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectCheckbox } from "@/components/shared/SelectCheckbox";
import { cn } from "@/lib/utils";
import type { RosterPlayer } from "@/lib/rosters-data";

const headClass =
  "px-3 py-2.5 text-center text-[0.7rem] font-medium uppercase tracking-[0.14em] text-foreground/70";

interface MemberPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Candidates already narrowed by the search query (owned by the hook). */
  filteredMembers: RosterPlayer[];
  /** All candidates regardless of the query — used to tell apart empty states. */
  availableCount: number;
  query: string;
  onQueryChange: (query: string) => void;
  checkedIds: string[];
  onToggle: (id: string) => void;
  onConfirm: () => void;
}

/** A dialog table of club members with checkboxes; confirm adds all checked. */
export function MemberPickerDialog({
  open,
  onOpenChange,
  filteredMembers,
  availableCount,
  query,
  onQueryChange,
  checkedIds,
  onToggle,
  onConfirm,
}: MemberPickerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="max-w-lg">
        <DialogHeader>
          <DialogTitle>הוספת שחקנים מהמועדון</DialogTitle>
          <DialogDescription>
            סמנו את השחקנים שברצונכם להוסיף לרשימה, ובסיום לחצו הוסף.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 inset-s-2.5 size-4 -translate-y-1/2 text-foreground/50" />
          <Input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="חיפוש שחקן…"
            className="h-9 ps-9 rounded-xl"
          />
        </div>

        {filteredMembers.length === 0 ? (
          <Alert className="border-0 bg-transparent py-10 [&>svg]:hidden">
            <AlertTitle className="text-center text-sm font-normal text-foreground/60">
              {availableCount === 0
                ? "כל חברי המועדון כבר נמצאים ברשימה"
                : "לא נמצאו שחקנים"}
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
                      <TableHead className={headClass}>שם שחקן</TableHead>
                      <TableHead className={headClass}>מד כושר</TableHead>
                      <TableHead className={cn(headClass, "w-12")} />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.map((p, i) => {
                      const checked = checkedIds.includes(p.id);
                      return (
                        <TableRow
                          key={p.id}
                          onClick={() => onToggle(p.id)}
                          className={cn(
                            "cursor-pointer border-b-2 border-foreground/10 transition-colors duration-150 hover:bg-primary/25",
                            i % 2 === 1 && "bg-primary/15",
                            checked && "bg-primary/20",
                          )}
                        >
                          <TableCell className="px-3 py-2.5 text-center text-sm font-medium text-foreground">
                            {p.name}
                          </TableCell>
                          <TableCell className="px-3 py-2.5 text-center text-sm text-foreground/85 num">
                            {p.rating}
                          </TableCell>
                          <TableCell className="px-3 py-2.5 text-center">
                            <div className="flex justify-center">
                              <SelectCheckbox
                                checked={checked}
                                onCheckedChange={() => onToggle(p.id)}
                                ariaLabel={`בחר ${p.name}`}
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
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
