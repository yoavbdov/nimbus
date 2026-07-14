import type { Equipment } from "@/lib/rooms-data";

/** Shape of the "add equipment" form. Empty strings = not filled yet. */
export interface EquipmentFormValues {
  /** Set when editing an existing item (its doc id); empty for a new item. */
  id: string;
  name: string;
  quantity: string;
  notes: string;
}

export const EMPTY_EQUIPMENT_FORM: EquipmentFormValues = {
  id: "",
  name: "",
  quantity: "",
  notes: "",
};

/** Equipment name and a positive quantity are the starred fields required to submit. */
export function isEquipmentFormValid(values: EquipmentFormValues): boolean {
  return values.name.trim() !== "" && Number(values.quantity) > 0;
}

/** Build the modal's form values from an existing equipment item (for the "edit" flow). */
export function equipmentFormValuesFor(item: Equipment): EquipmentFormValues {
  return {
    id: item.id,
    name: item.name,
    quantity: String(item.quantity),
    // The placeholder "—" stands for "no note", so don't carry it into the field.
    notes: item.notes === "—" ? "" : item.notes,
  };
}

/** The scalar equipment fields to persist, derived from the form. */
function equipmentScalarsFromForm(values: EquipmentFormValues) {
  return {
    name: values.name.trim(),
    quantity: Number(values.quantity),
    // Keep the "—" placeholder convention the table renders for an empty note.
    notes: values.notes.trim() || "—",
  };
}

/** A full new-equipment document (id is assigned from the name by the data layer). */
export function equipmentRecordFromForm(
  values: EquipmentFormValues,
): Omit<Equipment, "id"> {
  return equipmentScalarsFromForm(values);
}

/** The patch applied when editing an existing equipment item. */
export function equipmentEditPatch(
  values: EquipmentFormValues,
): Partial<Equipment> {
  return equipmentScalarsFromForm(values);
}
