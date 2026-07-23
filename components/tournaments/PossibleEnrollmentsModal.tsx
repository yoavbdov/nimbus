"use client";

import { motion } from "framer-motion";
import { FileDown } from "lucide-react";
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
import { Alert, AlertTitle } from "@/components/ui/alert";
import { CriteriaSummary } from "@/components/shared/CriteriaSummary";
import { cn } from "@/lib/utils";
import type { EnrollmentCandidate } from "@/lib/possible-enrollments";
import type { Tournament } from "@/lib/tournaments-data";

const MotionTableRow = motion.create(TableRow);

const headClass =
  "px-4 py-3 text-center text-[0.7rem] font-medium uppercase tracking-[0.14em] text-foreground/70";

interface PossibleEnrollmentsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tournament: Tournament | null;
  candidates: EnrollmentCandidate[];
  onExport: () => void;
}

export function PossibleEnrollmentsModal({
  open,
  onOpenChange,
  tournament,
  candidates,
  onExport,
}: PossibleEnrollmentsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>רישומים אפשריים</DialogTitle>
          <DialogDescription>
            {tournament
              ? `שחקנים שפנויים ועומדים בקריטריונים של "${tournament.name}".`
              : "שחקנים פנויים שעומדים בקריטריונים של התחרות."}
          </DialogDescription>
        </DialogHeader>

        {tournament && (
          <CriteriaSummary
            ageMin={tournament.ageMin}
            ageMax={tournament.ageMax}
            noAgeLimit={tournament.noAgeLimit}
            ratingMin={tournament.ratingMin}
            ratingMax={tournament.ratingMax}
            noRatingLimit={tournament.noRatingLimit}
          />
        )}

        {candidates.length === 0 ? (
          <Alert className="border-0 bg-transparent py-10 [&>svg]:hidden">
            <AlertTitle className="text-center text-sm font-normal text-foreground/60">
              לא נמצאו שחקנים
            </AlertTitle>
          </Alert>
        ) : (
          <div className="neu-inset rounded-2xl p-3">
            <div
              dir="ltr"
              className="players-scroll max-h-[55vh] overflow-y-auto overflow-x-hidden"
            >
              <div dir="rtl">
                <Table>
                  <TableHeader className="sticky top-0 z-10 bg-background/40 backdrop-blur-md [&_tr]:border-b-2 [&_tr]:border-border">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className={headClass}>שם</TableHead>
                      <TableHead className={headClass}>גיל</TableHead>
                      <TableHead className={headClass}>כיתה</TableHead>
                      <TableHead className={headClass}>מד כושר</TableHead>
                      <TableHead className={headClass}>טלפון</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {candidates.map((c, i) => (
                      <MotionTableRow
                        key={c.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: Math.min(i * 0.015, 0.2),
                          duration: 0.3,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className={cn(
                          "border-b-2 border-foreground/10 transition-colors duration-150 hover:bg-primary/25",
                          i % 2 === 1 && "bg-primary/15",
                        )}
                      >
                        <TableCell className="px-4 py-3 text-center text-sm font-medium text-foreground">
                          {c.name}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-center text-sm text-foreground/85 num">
                          {c.age}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-center text-sm text-foreground/85">
                          {c.grade}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-center text-sm text-foreground/85 num">
                          {c.israeliRating}
                        </TableCell>
                        <TableCell
                          className="px-4 py-3 text-center text-sm text-foreground/85 num"
                          dir="ltr"
                        >
                          {c.phone}
                        </TableCell>
                      </MotionTableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className={cn(
              "group/btn relative overflow-hidden tint-indigo",
              "h-9 rounded-xl px-3.5 text-xs font-medium neu-raised-xs neu-interactive",
            )}
          >
            <span className="absolute inset-x-0 top-0 h-1 tint-bar origin-center scale-x-0 group-hover/btn:scale-x-100 transition-transform duration-700 ease-out" />
            סגירה
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={candidates.length === 0}
            onClick={onExport}
            className={cn(
              "group/btn relative overflow-hidden tint-indigo",
              "h-9 rounded-xl gap-1.5 px-3.5 text-xs font-medium neu-raised-xs neu-interactive",
            )}
          >
            <span className="absolute inset-x-0 top-0 h-1 tint-bar origin-center scale-x-0 group-hover/btn:scale-x-100 transition-transform duration-700 ease-out" />
            <FileDown className="size-4 text-[#217346]" />
            ייצוא לאקסל
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
