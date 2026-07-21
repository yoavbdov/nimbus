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
      confirmingClose={addTournament.confirmingClose}
      closeNudge={addTournament.closeNudge}
      onConfirmClose={addTournament.confirmClose}
      onCancelClose={addTournament.cancelClose}
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
      onAddFixedMeeting={addTournament.addFixedMeeting}
      onUpdateFixedMeeting={addTournament.updateFixedMeeting}
      onRemoveFixedMeeting={addTournament.removeFixedMeeting}
      players={addTournament.enrolledPlayers}
      availablePlayers={addTournament.pickerPlayers}
      onRemovePlayer={addTournament.removePlayer}
      playerPickerOpen={addTournament.playerPickerOpen}
      onPlayerPickerOpenChange={addTournament.setPlayerPickerOpen}
      onOpenPlayerPicker={addTournament.openPlayerPicker}
      sourceChoiceOpen={addTournament.sourceChoiceOpen}
      onSourceChoiceOpenChange={addTournament.setSourceChoiceOpen}
      rosterChoiceOpen={addTournament.rosterChoiceOpen}
      onRosterChoiceOpenChange={addTournament.setRosterChoiceOpen}
      playerRosters={addTournament.playerRosters}
      onChoosePlayersFromAll={addTournament.choosePlayersFromAll}
      onChoosePlayersFromRoster={addTournament.choosePlayersFromRoster}
      onBackToSourceChoice={addTournament.backToSourceChoice}
      onSelectPlayerRoster={addTournament.selectPlayerRoster}
      pickerDisabledIds={addTournament.pickerDisabledIds}
      checkedPlayerIds={addTournament.checkedPlayerIds}
      onToggleCheckedPlayer={addTournament.toggleCheckedPlayer}
      onConfirmPlayers={addTournament.confirmPlayers}
      onAddEquipment={addTournament.addEquipmentLine}
      onUpdateEquipment={addTournament.updateEquipmentLine}
      onRemoveEquipment={addTournament.removeEquipmentLine}
      equipmentItems={addTournament.equipmentItems}
      judgeWarning={addTournament.judgeWarning}
      conflicts={addTournament.conflicts}
      ageRangeInvalid={addTournament.ageRangeInvalid}
      ratingRangeInvalid={addTournament.ratingRangeInvalid}
      mismatchReasons={addTournament.mismatchReasons}
    />
  );
}
