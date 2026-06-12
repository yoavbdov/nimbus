import { useCallback, useState } from "react";
import {
  EMPTY_EQUIPMENT_FORM,
  isEquipmentFormValid,
  type EquipmentFormValues,
} from "@/lib/equipment-form";

/** "add" shows the empty add-equipment flow; "edit" prefills an existing item. */
export type EquipmentModalMode = "add" | "edit";

/**
 * Owns all state for the "add equipment" modal. The modal stays presentational
 * and receives everything from here.
 */
export function useAddEquipment() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<EquipmentModalMode>("add");
  const [values, setValues] = useState<EquipmentFormValues>(EMPTY_EQUIPMENT_FORM);

  const valid = isEquipmentFormValid(values);

  const updateField = useCallback(
    <K extends keyof EquipmentFormValues>(
      field: K,
      value: EquipmentFormValues[K],
    ) => {
      setValues((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const openModal = useCallback(() => {
    setMode("add");
    setValues(EMPTY_EQUIPMENT_FORM);
    setOpen(true);
  }, []);

  // Opens the modal in edit mode prefilled with an existing equipment item.
  const openForEdit = useCallback((next: EquipmentFormValues) => {
    setMode("edit");
    setValues(next);
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
