import { useCallback, useState } from "react";
import {
  EMPTY_EQUIPMENT_FORM,
  equipmentEditPatch,
  equipmentRecordFromForm,
  isEquipmentFormValid,
  type EquipmentFormValues,
} from "@/lib/equipment-form";
import { addEquipment, updateEquipment } from "@/lib/firebase/data/equipment";

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
    // Edit → patch the existing doc; add → create a new one. The live table
    // re-renders from Firestore automatically via its onSnapshot subscription.
    if (values.id) {
      void updateEquipment(values.id, equipmentEditPatch(values));
    } else {
      void addEquipment(equipmentRecordFromForm(values));
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
