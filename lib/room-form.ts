/** Shape of the "add room" form. Empty strings / empty array = not filled yet. */
export interface RoomFormValues {
  name: string;
  capacity: string;
  equipment: string[];
  notes: string;
}

export const EMPTY_ROOM_FORM: RoomFormValues = {
  name: "",
  capacity: "",
  equipment: [],
  notes: "",
};

/** Room name and a positive max capacity are the starred fields required to submit. */
export function isRoomFormValid(values: RoomFormValues): boolean {
  return values.name.trim() !== "" && Number(values.capacity) > 0;
}

/** Build the modal's form values from an existing room (for the "edit" flow). */
export function roomFormValuesFor(room: {
  name: string;
  capacity: number;
  equipment: string[];
}): RoomFormValues {
  return {
    name: room.name,
    capacity: String(room.capacity),
    equipment: room.equipment,
    notes: "",
  };
}
