"use client";

import { Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DeleteConfirmDialogProps {
  open: boolean;
  count: number;
  /** Plural noun for the deleted items, e.g. "חדרים" / "פריטי ציוד". */
  noun: string;
  /** Singular label with the definite article, e.g. "החדר" / "הציוד". */
  singularLabel: string;
  /** Names of the rows being deleted — listed in the dialog when provided. */
  names?: string[];
  /** The exact text the user must type to enable the delete button. */
  expectedPhrase: string;
  confirmText: string;
  onConfirmTextChange: (value: string) => void;
  valid: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

/**
 * Mirrors {@link ArchiveConfirmDialog}'s design, reframed for a permanent
 * delete: same layout and footer, a destructive confirm button, plus a
 * type-to-confirm field so the user must retype the name (or a phrase, in bulk).
 */
export function DeleteConfirmDialog({
  open,
  count,
  noun,
  singularLabel,
  names,
  expectedPhrase,
  confirmText,
  onConfirmTextChange,
  valid,
  onCancel,
  onConfirm,
}: DeleteConfirmDialogProps) {
  const isBulk = count > 1;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent dir="rtl" className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            אישור מחיקת אובייקט
          </DialogTitle>
          <DialogDescription>
            {names && names.length > 0 ? (
              <>
                {isBulk
                  ? `${count} ${noun} יימחקו לצמיתות:`
                  : `"${names[0]}" יימחק לצמיתות`}
                <br />
                {isBulk && (
                  <span className="font-medium text-foreground">
                    {names.join(", ")}
                  </span>
                )}
                <br />
              </>
            ) : (
              <>
                {isBulk
                  ? `${count} ${noun} יימחקו לצמיתות.`
                  : `${singularLabel} יימחק לצמיתות.`}
                <br />
              </>
            )}
            <span className="font-medium text-destructive">
              פעולה זו היא סופית ולא ניתנת להחזרה.
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5">
          <Label
            htmlFor="delete-confirm"
            onClick={(e) => e.preventDefault()}
            className="w-fit cursor-default text-foreground/80"
          >
            {isBulk ? (
              <>
                הקלידו{" "}
                <span className="font-semibold text-foreground">
                  {expectedPhrase}
                </span>{" "}
                כדי לאשר:
              </>
            ) : (
              `הקלידו את שם ${singularLabel} כדי לאשר:`
            )}
          </Label>
          <Input
            id="delete-confirm"
            value={confirmText}
            onChange={(e) => onConfirmTextChange(e.target.value)}
            placeholder={expectedPhrase}
            className="h-9 rounded-xl neu-inset border-0 bg-foreground/8! px-3 text-start placeholder:text-muted-foreground/40"
          />
        </div>

        <DialogFooter className="gap-2 sm:flex-row-reverse sm:justify-end">
          <Button
            type="button"
            onClick={onConfirm}
            disabled={!valid}
            className="gap-1.5 rounded-xl bg-destructive text-white hover:bg-destructive/90"
          >
            <Trash2 className="size-4" />
            כן, מחק
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
