import { useCallback, useState } from "react";
import {
  EMPTY_ROOM_FORM,
  isRoomFormValid,
  roomEditPatch,
  roomRecordFromForm,
  type RoomFormValues,
} from "@/lib/room-form";
import { addRoom, updateRoom } from "@/lib/firebase/data/rooms";

/** "add" shows the empty add-room flow; "edit" prefills an existing room. */
export type RoomModalMode = "add" | "edit";

/**
 * Owns all state for the "add room" modal. The modal stays presentational and
 * receives everything from here.
 */
export function useAddRoom() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<RoomModalMode>("add");
  const [values, setValues] = useState<RoomFormValues>(EMPTY_ROOM_FORM);

  const valid = isRoomFormValid(values);

  const updateField = useCallback(
    <K extends keyof RoomFormValues>(field: K, value: RoomFormValues[K]) => {
      setValues((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const openModal = useCallback(() => {
    setMode("add");
    setValues(EMPTY_ROOM_FORM);
    setOpen(true);
  }, []);

  // Opens the modal in edit mode prefilled with an existing room.
  const openForEdit = useCallback((next: RoomFormValues) => {
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
      void updateRoom(values.id, roomEditPatch(values));
    } else {
      void addRoom(roomRecordFromForm(values));
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
