"use client";

import { useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/** A small yes/no dialog used to confirm destructive roster actions. */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  // Keep the last text shown so it doesn't reflow while the dialog animates out
  // (the parent clears its state on close, blanking title/description).
  const shown = useRef({ title, description, confirmLabel });
  useEffect(() => {
    if (open) shown.current = { title, description, confirmLabel };
  }, [open, title, description, confirmLabel]);
  const content = open ? { title, description, confirmLabel } : shown.current;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent dir="rtl" className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{content.title}</DialogTitle>
          <DialogDescription>{content.description}</DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:flex-row-reverse sm:justify-end">
          <Button
            type="button"
            onClick={onConfirm}
            className="rounded-xl bg-destructive text-white hover:bg-destructive/90"
          >
            {content.confirmLabel}
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
