"use client";

import { CourseFormModal } from "@/components/courses/CourseFormModal";
import { TournamentFormModal } from "@/components/tournaments/TournamentFormModal";
import { EventFormModal } from "@/components/events/EventFormModal";
import { EditLeagueTeamModal } from "@/components/leagues/EditLeagueTeamModal";
import { AddCoachModal } from "@/components/coaches/AddCoachModal";
import { PossibleEnrollmentsModal as CourseEnrollmentsModal } from "@/components/courses/PossibleEnrollmentsModal";
import { PossibleEnrollmentsModal as TournamentEnrollmentsModal } from "@/components/tournaments/PossibleEnrollmentsModal";
import { ArchiveConfirmDialog } from "@/components/shared/ArchiveConfirmDialog";
import type { useScheduleEventActions } from "@/hooks/schedule/useScheduleEventActions";

/**
 * The full modal suite a clicked schedule event can open — the same flows the
 * management modules use from their row dropdowns. Shared by the schedule panel
 * and the dashboard's "today" widget so both drive edits/archive identically.
 */
export function ScheduleActionModals({
  actions,
}: {
  actions: ReturnType<typeof useScheduleEventActions>;
}) {
  return (
    <>
      <CourseFormModal addCourse={actions.courseEdit} />
      <TournamentFormModal addTournament={actions.tournamentEdit} />
      <EventFormModal addEvent={actions.eventEdit} />
      <EditLeagueTeamModal
        open={actions.leagueDetails.open}
        tab={actions.leagueDetails.tab}
        onTabChange={actions.leagueDetails.setTab}
        onOpenChange={actions.leagueDetails.handleOpenChange}
        values={actions.leagueDetails.values}
        onFieldChange={actions.leagueDetails.updateField}
        members={actions.leagueDetails.members}
        onRemovePlayer={actions.leagueDetails.removePlayer}
        valid={actions.leagueDetails.valid}
        onConfirm={actions.leagueDetails.confirm}
        pickerOpen={actions.leagueDetails.pickerOpen}
        onOpenPicker={actions.leagueDetails.openPicker}
        onPickerOpenChange={actions.leagueDetails.handlePickerOpenChange}
        query={actions.leagueDetails.query}
        onQueryChange={actions.leagueDetails.setQuery}
        pickerRows={actions.leagueDetails.pickerRows}
        checkedCount={actions.leagueDetails.checkedCount}
        onToggleChecked={actions.leagueDetails.toggleChecked}
        onConfirmAddPlayers={actions.leagueDetails.confirmAddPlayers}
      />
      <AddCoachModal
        open={actions.coachEdit.open}
        mode={actions.coachEdit.mode}
        onOpenChange={actions.coachEdit.handleOpenChange}
        values={actions.coachEdit.values}
        onFieldChange={actions.coachEdit.updateField}
        valid={actions.coachEdit.valid}
        onConfirm={actions.coachEdit.confirm}
      />
      <CourseEnrollmentsModal
        open={actions.courseEnrollments.open}
        onOpenChange={actions.courseEnrollments.onOpenChange}
        course={actions.courseEnrollments.course}
        candidates={actions.courseEnrollments.candidates}
        onExport={() => {}}
      />
      <TournamentEnrollmentsModal
        open={actions.tournamentEnrollments.open}
        onOpenChange={actions.tournamentEnrollments.onOpenChange}
        tournament={actions.tournamentEnrollments.tournament}
        candidates={actions.tournamentEnrollments.candidates}
        onExport={() => {}}
      />
      <ArchiveConfirmDialog
        open={actions.archive.open}
        count={actions.archive.count}
        noun={actions.archiveNoun}
        onCancel={actions.archive.cancel}
        onConfirm={actions.archive.confirm}
      />
    </>
  );
}
