"use client";

import { AddEventModal } from "@/components/events/AddEventModal";
import type { useAddEvent } from "@/hooks/events/useAddEvent";

/**
 * Connects a {@link useAddEvent} instance to {@link AddEventModal} so the long
 * prop list lives in one place and both the "add" (panel) and "edit" (row
 * action) flows can reuse the same modal.
 */
export function EventFormModal({
  addEvent,
}: {
  addEvent: ReturnType<typeof useAddEvent>;
}) {
  return (
    <AddEventModal
      open={addEvent.open}
      mode={addEvent.mode}
      onOpenChange={addEvent.handleOpenChange}
      tab={addEvent.tab}
      onTabChange={addEvent.setTab}
      values={addEvent.values}
      onFieldChange={addEvent.updateField}
      valid={addEvent.valid}
      onConfirm={addEvent.confirm}
      onFormatChange={addEvent.setFormat}
      players={addEvent.enrolledPlayers}
      availablePlayers={addEvent.availablePlayers}
      onRemovePlayer={addEvent.removePlayer}
      playerPickerOpen={addEvent.playerPickerOpen}
      onPlayerPickerOpenChange={addEvent.setPlayerPickerOpen}
      onOpenPlayerPicker={addEvent.openPlayerPicker}
      checkedPlayerIds={addEvent.checkedPlayerIds}
      onToggleCheckedPlayer={addEvent.toggleCheckedPlayer}
      onConfirmPlayers={addEvent.confirmPlayers}
      onAddEquipment={addEvent.addEquipmentLine}
      onUpdateEquipment={addEvent.updateEquipmentLine}
      onRemoveEquipment={addEvent.removeEquipmentLine}
    />
  );
}
