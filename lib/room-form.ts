import type { Room } from "@/lib/rooms-data";

/** Shape of the "add room" form. Empty strings = not filled yet. */
export interface RoomFormValues {
  /** Set when editing an existing room (its doc id); empty for a new room. */
  id: string;
  name: string;
  capacity: string;
  notes: string;
}

export const EMPTY_ROOM_FORM: RoomFormValues = {
  id: "",
  name: "",
  capacity: "",
  notes: "",
};

/** The room name is the only required field; capacity may be left blank. */
export function isRoomFormValid(values: RoomFormValues): boolean {
  return values.name.trim() !== "";
}

/** Build the modal's form values from an existing room (for the "edit" flow). */
export function roomFormValuesFor(room: Room): RoomFormValues {
  return {
    id: room.id,
    name: room.name,
    capacity: room.capacity == null ? "" : String(room.capacity),
    notes: room.notes ?? "",
  };
}

/** The scalar room fields to persist, derived from the form. */
function roomScalarsFromForm(values: RoomFormValues) {
  return {
    name: values.name.trim(),
    // A blank capacity is stored as null — the room simply has no stated limit.
    capacity: values.capacity.trim() === "" ? null : Number(values.capacity),
    notes: values.notes.trim(),
  };
}

/** A full new-room document (id is assigned by the data layer from the name). */
export function roomRecordFromForm(values: RoomFormValues): Omit<Room, "id"> {
  return roomScalarsFromForm(values);
}

/** The patch applied when editing an existing room. */
export function roomEditPatch(values: RoomFormValues): Partial<Room> {
  return roomScalarsFromForm(values);
}
