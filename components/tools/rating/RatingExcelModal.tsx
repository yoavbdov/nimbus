"use client";

import { FileDown, FileSpreadsheet } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RatingExcelDropZone } from "@/components/tools/rating/RatingExcelDropZone";

interface RatingExcelModalProps {
  open: boolean;
  fileName: string | null;
  onOpenChange: (open: boolean) => void;
  onExport: () => void;
  onFileDrop: (file: File) => void;
  onClearFile: () => void;
  onConfirm: () => void;
}

/** Small round step number badge. */
function StepBadge({ n }: { n: number }) {
  return (
    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground num">
      {n}
    </span>
  );
}

/**
 * Two-step Excel flow shown side by side: step 1 (export) on the right, a dashed
 * divider, then step 2 (fill & drop back) on the left with an indigo background.
 */
export function RatingExcelModal({
  open,
  fileName,
  onOpenChange,
  onExport,
  onFileDrop,
  onClearFile,
  onConfirm,
}: RatingExcelModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="max-w-2xl" showCloseButton>
        <DialogHeader className="items-center gap-2.5">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/15 text-primary shadow-depth-sm">
            <FileSpreadsheet className="size-5.5" />
          </span>
          <DialogTitle className="text-2xl font-bold tracking-tight tint-text">
            עדכון לפי טבלת אקסל
          </DialogTitle>
          <DialogDescription>
            ייצאו את הרשימה, מלאו את מדי הכושר בקובץ, וגררו אותו חזרה.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch sm:gap-0">
          {/* ── Step 1 — export (right) ──────────────────────────── */}
          <div className="flex-1 space-y-3 sm:pe-5">
            <div className="flex items-center gap-2">
              <StepBadge n={1} />
              <p className="text-sm font-medium text-foreground">
                ייצוא הרשימה הנוכחית
              </p>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              ייצאו את רשימת השחקנים לקובץ אקסל ומלאו בו את מדי הכושר החדשים.
            </p>
            <Button
              type="button"
              onClick={onExport}
              className="group/btn relative h-10 w-full justify-center gap-2 overflow-hidden rounded-xl neu-raised-xs neu-interactive bg-transparent text-foreground hover:bg-transparent"
            >
              <span className="absolute inset-x-0 top-0 h-1 tint-bar origin-center scale-x-0 transition-transform duration-700 ease-out group-hover/btn:scale-x-100" />
              <FileDown className="size-4 text-[#217346]" />
              ייצוא לאקסל
            </Button>
          </div>

          {/* ── Dashed divider ───────────────────────────────────── */}
          <div className="border-t border-dashed border-foreground/20 sm:border-l sm:border-t-0" />

          {/* ── Step 2 — fill & drop back (left, indigo) ─────────── */}
          <div className="flex-1 space-y-3 rounded-2xl bg-primary/10 p-4 sm:ms-5">
            <div className="flex items-center gap-2">
              <StepBadge n={2} />
              <p className="text-sm font-medium text-foreground">
                עדכון וטעינה חזרה
              </p>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              נא לגרור את הקובץ המעודכן לאזור המסומן.
            </p>
            <RatingExcelDropZone
              fileName={fileName}
              onFileDrop={onFileDrop}
              onClear={onClearFile}
            />
          </div>
        </div>

        <DialogFooter className="flex-row justify-start gap-2 sm:justify-start">
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-xl bg-foreground/10 text-foreground hover:bg-foreground/15"
          >
            ביטול
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={!fileName}
            className="rounded-xl bg-primary text-primary-foreground shadow-depth-md transition-transform duration-150 hover:-translate-y-0.5 hover:bg-primary/90 disabled:translate-y-0 disabled:opacity-50"
          >
            עדכון
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
