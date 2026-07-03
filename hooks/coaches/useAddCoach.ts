import { useCallback, useState } from "react";
import {
  EMPTY_COACH_FORM,
  isCoachFormValid,
  type CoachFormValues,
} from "@/lib/coach-form";
import { updateCoach } from "@/lib/firebase/data/coaches";

/** "add" shows the empty add-coach flow; "edit" prefills an existing coach. */
export type CoachModalMode = "add" | "edit";

/**
 * Owns all state for the "add coach" modal. Mirrors the add-player flow but
 * with the smaller coach field set. The modal stays presentational and
 * receives everything from here.
 */
export function useAddCoach() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<CoachModalMode>("add");
  const [values, setValues] = useState<CoachFormValues>(EMPTY_COACH_FORM);

  const valid = isCoachFormValid(values);

  const updateField = useCallback(
    <K extends keyof CoachFormValues>(field: K, value: CoachFormValues[K]) => {
      setValues((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const openModal = useCallback(() => {
    setMode("add");
    setValues(EMPTY_COACH_FORM);
    setOpen(true);
  }, []);

  // Opens the modal in edit mode prefilled with an existing coach.
  const openForEdit = useCallback((next: CoachFormValues) => {
    setMode("edit");
    setValues(next);
    setOpen(true);
  }, []);

  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next);
  }, []);

  const confirm = useCallback(() => {
    if (!valid) return;
    // Persist edited fields to Firestore (merge patch); add-mode comes later.
    if (values.id) {
      void updateCoach(values.id, {
        name: `${values.firstName.trim()} ${values.lastName.trim()}`.trim(),
        phone: values.phone,
        notes: values.notes,
      });
    }
    setOpen(false);
  }, [valid, values]);

  return {
    open,
    mode,
    openModal,
    openForEdit,
    handleOpenChange,
    values,
    updateField,
    valid,
    confirm,
  };
}
