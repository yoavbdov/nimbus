"use client";

import { motion } from "framer-motion";
import { TriangleAlert } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ease = [0.22, 1, 0.36, 1] as const;

const bodyVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10, filter: "blur(4px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.3, ease },
  },
};

interface DeletePlayerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The player(s) to delete. One name → single mode, many → bulk mode. */
  playerNames: string[];
  /** The exact text the user must type to enable the delete button. */
  expectedPhrase: string;
  confirmText: string;
  onConfirmTextChange: (value: string) => void;
  valid: boolean;
  onConfirm: () => void;
}

export function DeletePlayerModal({
  open,
  onOpenChange,
  playerNames,
  expectedPhrase,
  confirmText,
  onConfirmTextChange,
  valid,
  onConfirm,
}: DeletePlayerModalProps) {
  const isBulk = playerNames.length > 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isBulk ? "מחיקת שחקנים" : "מחיקת שחקן"}</DialogTitle>
          <DialogDescription>
            {isBulk ? (
              "להלן השחקנים שימחקו לאחר לחיצה על אישור:"
            ) : (
              <>
                מחיקת השחקן{" "}
                <span className="font-semibold text-foreground">
                  {playerNames[0]}
                </span>{" "}
                מהמערכת.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <motion.div
          className="space-y-4"
          variants={bodyVariants}
          initial="hidden"
          animate="show"
        >
          {isBulk && (
            <motion.ul
              variants={itemVariants}
              className="players-scroll max-h-40 space-y-1 overflow-y-auto rounded-xl neu-inset bg-foreground/8 p-3 text-sm text-foreground/90"
            >
              {playerNames.map((name) => (
                <li key={name} className="text-start">
                  {name}
                </li>
              ))}
            </motion.ul>
          )}

          <motion.div variants={itemVariants}>
            <Alert
              variant="destructive"
              className="border-destructive/30 text-right"
            >
              <TriangleAlert />
              <AlertTitle>פעולה זו היא סופית</AlertTitle>
              <AlertDescription>
                {isBulk
                  ? "לא ניתן לשחזר את השחקנים לאחר המחיקה."
                  : "לא ניתן לשחזר את השחקן לאחר המחיקה."}
              </AlertDescription>
            </Alert>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-1.5">
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
                "הקלידו את השם המלא של השחקן כדי לאשר:"
              )}
            </Label>
            <Input
              id="delete-confirm"
              value={confirmText}
              onChange={(e) => onConfirmTextChange(e.target.value)}
              className="h-9 rounded-xl neu-inset border-0 bg-foreground/8! px-3 text-start"
            />
          </motion.div>
        </motion.div>

        <DialogFooter className="gap-2 sm:flex-row-reverse sm:justify-end">
          <Button
            type="button"
            variant="destructive"
            disabled={!valid}
            onClick={onConfirm}
            className="rounded-xl"
          >
            אישור
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
