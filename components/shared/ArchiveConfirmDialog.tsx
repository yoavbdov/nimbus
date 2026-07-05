"use client";

import { Archive } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ArchiveConfirmDialogProps {
  open: boolean;
  count: number;
  /** Plural noun for the archived items, e.g. "חוגים" / "תחרויות" / "אירועים". */
  noun: string;
  /** Names of the rows being archived — listed in the dialog when provided. */
  names?: string[];
  /** Show the "final, irreversible" warning. */
  warnFinal?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ArchiveConfirmDialog({
  open,
  count,
  noun,
  names,
  warnFinal,
  onCancel,
  onConfirm,
}: ArchiveConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent dir="rtl" className="max-w-sm">
        <DialogHeader>
          <DialogTitle>העברה לארכיון?</DialogTitle>
          <DialogDescription>
            {names && names.length > 0 ? (
              <>
                {count === 1 ? `"${names[0]}" יועבר` : `${count} ${noun} יועברו`}{" "}
                לארכיון:
                <br />
                <span className="font-medium text-foreground">
                  {names.join(", ")}
                </span>
                <br />
              </>
            ) : (
              <>
                {count} {noun} יועברו לארכיון.
                <br />
              </>
            )}
            כל האלמנטים המשוייכים ישתחררו בשעות שהתפנו(מדריכים, תלמידים, חדרים,
            ציוד פיזי וכו')
            {warnFinal && (
              <>
                <br />
                <span className="font-medium text-destructive">
                  פעולה זו היא סופית ולא ניתנת להחזרה.
                </span>
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:flex-row-reverse sm:justify-end">
          <Button
            type="button"
            onClick={onConfirm}
            disabled={count === 0}
            className="gap-1.5 rounded-xl"
          >
            <Archive className="size-4" />
            כן, העבר לארכיון
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            className="rounded-xl"
          >
            ביטול
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
