"use client";

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
import type { RosterNameDialogMode } from "@/hooks/tools/useRosters";

interface RosterNameDialogProps {
  mode: RosterNameDialogMode | null;
  value: string;
  onValueChange: (value: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}

export function RosterNameDialog({
  mode,
  value,
  onValueChange,
  onConfirm,
  onClose,
}: RosterNameDialogProps) {
  const creating = mode === "create";

  return (
    <Dialog open={mode !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent dir="rtl" className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{creating ? "רשימה חדשה" : "שינוי שם הרשימה"}</DialogTitle>
          <DialogDescription>
            {creating
              ? "תנו שם לרשימה, ובשלב הבא הוסיפו אליה שחקנים מהמועדון."
              : "הזינו שם חדש לרשימה."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">שם הרשימה</Label>
          <Input
            autoFocus
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && value.trim()) onConfirm();
            }}
            placeholder="לדוגמה: קבוצת מתחילים"
            className="h-9 rounded-xl neu-inset border-0 bg-foreground/8!"
          />
        </div>

        <DialogFooter className="gap-2 sm:flex-row-reverse sm:justify-end">
          <Button
            type="button"
            disabled={!value.trim()}
            onClick={onConfirm}
            className="rounded-xl"
          >
            {creating ? "המשך" : "שמירה"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="rounded-xl"
          >
            ביטול
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
