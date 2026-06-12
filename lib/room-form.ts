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
