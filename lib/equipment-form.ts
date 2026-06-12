/** Shape of the "add equipment" form. Empty strings = not filled yet. */
export interface EquipmentFormValues {
  name: string;
  quantity: string;
  notes: string;
}

export const EMPTY_EQUIPMENT_FORM: EquipmentFormValues = {
  name: "",
  quantity: "",
  notes: "",
};

/** Equipment name and a positive quantity are the starred fields required to submit. */
export function isEquipmentFormValid(values: EquipmentFormValues): boolean {
  return values.name.trim() !== "" && Number(values.quantity) > 0;
}

/** Build the modal's form values from an existing equipment item (for the "edit" flow). */
export function equipmentFormValuesFor(item: {
  name: string;
  quantity: number;
  notes: string;
}): EquipmentFormValues {
  return {
    name: item.name,
    quantity: String(item.quantity),
    // The placeholder "—" stands for "no note", so don't carry it into the field.
    notes: item.notes === "—" ? "" : item.notes,
  };
}
