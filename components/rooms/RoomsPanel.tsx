"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RoomsActions } from "@/components/rooms/RoomsActions";
import { RoomsFilterBar } from "@/components/rooms/RoomsFilterBar";
import { RoomsTable } from "@/components/rooms/RoomsTable";
import { RoomAvailabilityModal } from "@/components/rooms/RoomAvailabilityModal";
import { AddRoomModal } from "@/components/rooms/AddRoomModal";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { useRoomsPanel } from "@/hooks/rooms/useRoomsPanel";
import { useRoomAvailabilityCheck } from "@/hooks/rooms/useRoomAvailabilityCheck";
import { useAddRoom } from "@/hooks/rooms/useAddRoom";
import { useDeleteConfirm } from "@/hooks/shared/useDeleteConfirm";
import { deleteRoom } from "@/lib/firebase/data/rooms";
import { roomsFilterSchema } from "@/lib/rooms-filters";
import { roomFormValuesFor } from "@/lib/room-form";

export function RoomsPanel() {
  const {
    search,
    setSearch,
    filters,
    addFilter,
    updateFilter,
    removeFilter,
    clearAll,
    filtered,
    rooms,
    total,
    filterKey,
  } = useRoomsPanel();
  const availability = useRoomAvailabilityCheck(rooms);
  const addRoom = useAddRoom();
  const del = useDeleteConfirm(deleteRoom, "חדרים");

  /** The id+name targets for a set of room ids (for the delete dialog). */
  function deletableRooms(roomIds: string[]) {
    return rooms
      .filter((r) => roomIds.includes(r.id))
      .map((r) => ({ id: r.id, name: r.name }));
  }

  function handleRoomAction(actionId: string, roomId: string | null) {
    if (actionId === "details") {
      const room = rooms.find((r) => r.id === roomId);
      if (room) addRoom.openForEdit(roomFormValuesFor(room));
    } else if (actionId === "availability") {
      availability.openWith(roomId ? [roomId] : []);
    } else if (actionId === "delete") {
      del.openFor(roomId ? deletableRooms([roomId]) : []);
    }
  }

  function handleBulkAction(actionId: string, roomIds: string[]) {
    if (actionId === "availability") {
      availability.openWith(roomIds);
    } else if (actionId === "delete") {
      del.openFor(deletableRooms(roomIds));
    }
  }

  return (
    <Card className="tint-indigo glass shadow-depth-xl border-0 ring-0 rounded-3xl gap-0 py-0 overflow-hidden">
      <div className="h-1 tint-bar" />
      <CardContent className="p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1.5">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight tint-text leading-none">
              ניהול חדרים
            </h1>
            <p className="text-xs text-muted-foreground/80 num">
              {filtered.length} מתוך {total} חדרים
            </p>
          </div>
          <RoomsActions
            onAddRoom={addRoom.openModal}
            onCheckAvailability={() => availability.openWith([])}
          />
        </div>

        <Separator className="bg-foreground/8" />

        <RoomsFilterBar
          search={search}
          placeholder="חיפוש לפי שם חדר…"
          schema={roomsFilterSchema}
          filters={filters}
          onSearchChange={setSearch}
          onAdd={addFilter}
          onUpdate={updateFilter}
          onRemove={removeFilter}
          onClearAll={clearAll}
        />

        <div className="neu-inset rounded-2xl p-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={filterKey}
              initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -4, filter: "blur(2px)" }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <RoomsTable
                rooms={filtered}
                onAction={handleRoomAction}
                onBulkAction={handleBulkAction}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </CardContent>

      <AddRoomModal
        open={addRoom.open}
        mode={addRoom.mode}
        onOpenChange={addRoom.handleOpenChange}
        values={addRoom.values}
        onFieldChange={addRoom.updateField}
        valid={addRoom.valid}
        onConfirm={addRoom.confirm}
      />

      <RoomAvailabilityModal
        open={availability.open}
        onOpenChange={availability.handleOpenChange}
        rooms={rooms}
        selectedIds={availability.selectedIds}
        onToggleRoom={availability.toggleRoom}
        slot={availability.slot}
        onSlotChange={availability.updateSlot}
        slotValid={availability.slotValid}
        result={availability.result}
        onConfirm={availability.confirm}
        checkingAll={availability.checkingAll}
        pickerOpen={availability.pickerOpen}
        onPickerOpenChange={availability.setPickerOpen}
        pickerQuery={availability.pickerQuery}
        onPickerQueryChange={availability.setPickerQuery}
        pickerMatches={availability.pickerMatches}
        container={availability.container}
        onContainerChange={availability.setContainer}
      />

      <DeleteConfirmDialog
        open={del.open}
        count={del.count}
        noun="חדרים"
        singularLabel="החדר"
        names={del.names}
        expectedPhrase={del.expectedPhrase}
        confirmText={del.confirmText}
        onConfirmTextChange={del.setConfirmText}
        valid={del.valid}
        onCancel={del.cancel}
        onConfirm={del.confirm}
      />
    </Card>
  );
}
