import { useCallback, useState } from "react";
import {
  EMPTY_BIRTH_PARTS,
  EMPTY_PLAYER_FORM,
  gradeForBirthDate,
  isoFromBirthParts,
  isPlayerFormValid,
  type BirthDateParts,
  type PlayerFormValues,
} from "@/lib/player-form";
import { birthPartsFromIso } from "@/lib/player-details";
import { updatePlayer } from "@/lib/firebase/data/players";

/** "add" shows the empty add-player flow; "edit" prefills an existing player. */
export type PlayerModalMode = "add" | "edit";

/**
 * Owns all state for the "add player" modal. The birth date is collected as
 * three dropdowns (year/month/day); once all three are set it derives the ISO
 * `birthDate`, which in turn auto-fills the grade until the user edits it by
 * hand. The modal stays presentational and receives everything from here.
 */
export function useAddPlayer() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<PlayerModalMode>("add");
  const [values, setValues] = useState<PlayerFormValues>(EMPTY_PLAYER_FORM);
  const [birthParts, setBirthParts] = useState<BirthDateParts>(EMPTY_BIRTH_PARTS);
  const [gradeManual, setGradeManual] = useState(false);

  const valid = isPlayerFormValid(values);

  const updateField = useCallback(
    <K extends keyof PlayerFormValues>(field: K, value: PlayerFormValues[K]) => {
      setValues((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  // Changing any part re-derives the ISO birth date and (unless pinned) the grade.
  const setBirthPart = useCallback(
    (part: keyof BirthDateParts, value: string) => {
      const nextParts = { ...birthParts, [part]: value };
      setBirthParts(nextParts);
      const birthDate = isoFromBirthParts(nextParts);
      setValues((prev) => ({
        ...prev,
        birthDate,
        grade: gradeManual ? prev.grade : gradeForBirthDate(birthDate),
      }));
    },
    [birthParts, gradeManual],
  );

  // A manual grade choice pins the field so the auto-fill stops overriding it.
  const setGrade = useCallback((grade: string) => {
    setGradeManual(true);
    setValues((prev) => ({ ...prev, grade }));
  }, []);

  const openModal = useCallback(() => {
    setMode("add");
    setValues(EMPTY_PLAYER_FORM);
    setBirthParts(EMPTY_BIRTH_PARTS);
    setGradeManual(false);
    setOpen(true);
  }, []);

  // Opens the modal in edit mode prefilled with an existing player. The grade
  // is pinned so the birth-date-driven auto-fill doesn't overwrite it.
  const openForEdit = useCallback((next: PlayerFormValues) => {
    setMode("edit");
    setValues(next);
    setBirthParts(birthPartsFromIso(next.birthDate));
    setGradeManual(true);
    setOpen(true);
  }, []);

  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next);
  }, []);

  const confirm = useCallback(() => {
    if (!valid) return;
    // Persist edited fields to Firestore (merge patch); add-mode comes later.
    if (values.id) {
      void updatePlayer(values.id, {
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        name: `${values.firstName.trim()} ${values.lastName.trim()}`.trim(),
        notes: values.notes,
        phone: values.phone,
        grade: values.grade,
        email: values.email,
        address: values.address,
        idNumber: values.idNumber,
        israeliPlayerId: values.israeliPlayerId,
        fidePlayerId: values.fidePlayerId,
        israeliRating: Number(values.israeliRating) || 0,
      });
    }
  }, [valid, values]);

  return {
    open,
    mode,
    openModal,
    openForEdit,
    handleOpenChange,
    values,
    updateField,
    birthParts,
    setBirthPart,
    setGrade,
    valid,
    confirm,
  };
}
