"use client";

import { AddTournamentModal } from "@/components/tournaments/AddTournamentModal";
import type { useAddTournament } from "@/hooks/tournaments/useAddTournament";

/**
 * Connects a {@link useAddTournament} instance to {@link AddTournamentModal} so
 * the long prop list lives in one place and both the "add" (panel) and "edit"
 * (row action) flows can reuse the same modal.
 */
export function TournamentFormModal({
  addTournament,
}: {
  addTournament: ReturnType<typeof useAddTournament>;
}) {
  return (
    <AddTournamentModal
      open={addTournament.open}
      mode={addTournament.mode}
      onOpenChange={addTournament.handleOpenChange}
      tab={addTournament.tab}
      onTabChange={addTournament.setTab}
      values={addTournament.values}
      onFieldChange={addTournament.updateField}
      valid={addTournament.valid}
      onConfirm={addTournament.confirm}
      onFormatChange={addTournament.setFormat}
      onRoundsCountChange={addTournament.setRoundsCount}
      onUpdateRound={addTournament.updateRound}
      onCompleteFromRound={addTournament.completeFromRound}
      players={addTournament.enrolledPlayers}
      availablePlayers={addTournament.availablePlayers}
      onRemovePlayer={addTournament.removePlayer}
      playerPickerOpen={addTournament.playerPickerOpen}
      onPlayerPickerOpenChange={addTournament.setPlayerPickerOpen}
      onOpenPlayerPicker={addTournament.openPlayerPicker}
      checkedPlayerIds={addTournament.checkedPlayerIds}
      onToggleCheckedPlayer={addTournament.toggleCheckedPlayer}
      onConfirmPlayers={addTournament.confirmPlayers}
      onAddEquipment={addTournament.addEquipmentLine}
      onUpdateEquipment={addTournament.updateEquipmentLine}
      onRemoveEquipment={addTournament.removeEquipmentLine}
      judgeWarning={addTournament.judgeWarning}
      criteriaMismatch={addTournament.criteriaMismatch}
    />
  );
}
