"use client";

import { motion } from "framer-motion";
import { Gauge } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const ease = [0.22, 1, 0.36, 1] as const;

interface RatingConfirmDialogProps {
  open: boolean;
  count: number;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Animated confirm dialog for applying the bulk rating update. */
export function RatingConfirmDialog({
  open,
  count,
  onConfirm,
  onCancel,
}: RatingConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent dir="rtl" className="max-w-sm" showCloseButton={false}>
        <DialogHeader className="gap-3">
          <motion.div
            initial={{ scale: 0.6, opacity: 0, rotate: -12 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ duration: 0.4, ease, delay: 0.05 }}
            className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-primary"
          >
            <Gauge className="size-6" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease, delay: 0.12 }}
            className="space-y-1"
          >
            <DialogTitle>אישור עדכון מד כושר</DialogTitle>
            <DialogDescription>
              לעדכן מד כושר ל-<span className="num font-medium">{count}</span>{" "}
              שחקנים?
            </DialogDescription>
          </motion.div>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease, delay: 0.18 }}
        >
          <DialogFooter className="flex-row justify-start gap-2 sm:justify-start">
            <Button
              type="button"
              onClick={onCancel}
              className="rounded-xl bg-foreground/10 text-foreground hover:bg-foreground/15"
            >
              ביטול
            </Button>
            <Button
              type="button"
              onClick={onConfirm}
              className="rounded-xl bg-primary text-primary-foreground shadow-depth-md transition-transform duration-150 hover:-translate-y-0.5 hover:bg-primary/90"
            >
              עדכון
            </Button>
          </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
