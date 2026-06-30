"use client";

import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { leagueCategories } from "@/lib/leagues-data";
import {
  ranksForCategory,
  type LeagueTeamFormValues,
} from "@/lib/league-team-form";
import {
  bodyVariants,
  Field,
  FieldLabel,
  fieldClass,
  SelectField,
} from "@/components/leagues/teamFormFields";

interface AddLeagueTeamModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  values: LeagueTeamFormValues;
  onFieldChange: <K extends keyof LeagueTeamFormValues>(
    field: K,
    value: LeagueTeamFormValues[K],
  ) => void;
  valid: boolean;
  onConfirm: () => void;
}

export function AddLeagueTeamModal({
  open,
  onOpenChange,
  values,
  onFieldChange,
  valid,
  onConfirm,
}: AddLeagueTeamModalProps) {
  const rankOptions = ranksForCategory(values.category);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="top-[7vh] max-w-lg translate-y-0">
        <DialogHeader>
          <DialogTitle>הוספת קבוצה</DialogTitle>
          <DialogDescription>
            שדות המסומנים ב־
            <span className="text-destructive">*</span> הם שדות חובה.
          </DialogDescription>
        </DialogHeader>

        <motion.div
          className="space-y-4"
          variants={bodyVariants}
          initial="hidden"
          animate="show"
        >
          <div className="flex justify-center gap-3">
            <Field className="w-40 flex flex-col items-center">
              <FieldLabel required>קטגוריה</FieldLabel>
              <SelectField
                value={values.category}
                options={leagueCategories}
                placeholder="בחרו קטגוריה"
                onChange={(next) =>
                  onFieldChange(
                    "category",
                    next as LeagueTeamFormValues["category"],
                  )
                }
              />
            </Field>

            <Field className="w-40 flex flex-col items-center">
              <FieldLabel required>דרגת ליגה</FieldLabel>
              <SelectField
                value={values.rank}
                options={rankOptions}
                placeholder={values.category ? "בחרו דרגה" : "בחרו קטגוריה"}
                disabled={!values.category}
                onChange={(next) => onFieldChange("rank", next)}
              />
            </Field>
          </div>

          <Field>
            <FieldLabel>הערות</FieldLabel>
            <Textarea
              value={values.notes}
              onChange={(e) => onFieldChange("notes", e.target.value)}
              className={cn(fieldClass, "h-auto min-h-20 py-2")}
            />
          </Field>
        </motion.div>

        <DialogFooter className="gap-2 sm:flex-row-reverse sm:justify-end">
          <Button
            type="button"
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
