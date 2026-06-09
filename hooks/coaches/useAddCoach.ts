import { useCallback, useState } from "react";
import {
  EMPTY_COACH_FORM,
  isCoachFormValid,
  type CoachFormValues,
} from "@/lib/coach-form";

/**
 * Owns all state for the "add coach" modal. Mirrors the add-player flow but
 * with the smaller coach field set. The modal stays presentational and
 * receives everything from here.
 */
export function useAddCoach() {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<CoachFormValues>(EMPTY_COACH_FORM);

  const valid = isCoachFormValid(values);

  const updateField = useCallback(
    <K extends keyof CoachFormValues>(field: K, value: CoachFormValues[K]) => {
      setValues((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const openModal = useCallback(() => {
    setValues(EMPTY_COACH_FORM);
    setOpen(true);
  }, []);

  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next);
  }, []);

  const confirm = useCallback(() => {
    if (!valid) return;
    // UI only for now — submitting is wired up elsewhere later.
  }, [valid]);

  return {
    open,
    openModal,
    handleOpenChange,
    values,
    updateField,
    valid,
    confirm,
  };
}
