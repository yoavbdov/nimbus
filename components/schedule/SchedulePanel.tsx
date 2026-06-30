"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatDayRange } from "@/lib/calendar";
import { MonthNav } from "@/components/schedule/MonthNav";
import { CategoryFilter } from "@/components/schedule/CategoryFilter";
import { ScheduleFilters } from "@/components/schedule/ScheduleFilters";
import { CalendarGrid } from "@/components/schedule/CalendarGrid";
import { ScheduleAgenda } from "@/components/schedule/ScheduleAgenda";
import { TimeGridView } from "@/components/schedule/TimeGridView";
import { ScheduleEventMenu } from "@/components/schedule/ScheduleEventMenu";
import { ActivityFormModal } from "@/components/activities/ActivityFormModal";
import { TournamentFormModal } from "@/components/tournaments/TournamentFormModal";
import { EventFormModal } from "@/components/events/EventFormModal";
import { EditLeagueTeamModal } from "@/components/leagues/EditLeagueTeamModal";
import { AddCoachModal } from "@/components/coaches/AddCoachModal";
import { PossibleEnrollmentsModal as ActivityEnrollmentsModal } from "@/components/activities/PossibleEnrollmentsModal";
import { PossibleEnrollmentsModal as TournamentEnrollmentsModal } from "@/components/tournaments/PossibleEnrollmentsModal";
import { ArchiveConfirmDialog } from "@/components/shared/ArchiveConfirmDialog";
import { useScheduleCalendar } from "@/hooks/schedule/useScheduleCalendar";
import { useScheduleEventMenu } from "@/hooks/schedule/useScheduleEventMenu";
import { useScheduleEventActions } from "@/hooks/schedule/useScheduleEventActions";

export function SchedulePanel() {
  const calendar = useScheduleCalendar();
  const menu = useScheduleEventMenu();
  const actions = useScheduleEventActions();

  function handleSelect(action: { id: string }) {
    if (menu.activeEvent) actions.dispatch(menu.activeEvent, action.id);
    menu.onSelect();
  }

  return (
    <Card className="tint-indigo glass shadow-depth-xl border-0 ring-0 rounded-3xl gap-0 py-0 overflow-hidden">
      <div className="h-1 tint-bar" />
      <CardContent className="p-6 space-y-5">
        <div className="grid grid-cols-3 items-center gap-4">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight tint-text leading-none">
            לוח זמנים
          </h1>

          {/* Centered selected-range label. */}
          <p className="num text-center text-lg md:text-xl font-bold tracking-tight tint-text">
            {formatDayRange(calendar.rangeStart, calendar.rangeEnd)}
          </p>

          <p className="num text-end text-xs text-muted-foreground/80">
            {calendar.totalEvents} מפגשים · {calendar.rangeLength} ימים
          </p>
        </div>

        <Separator className="bg-foreground/8" />

        <div className="grid gap-5 xl:h-[calc(100vh-12rem)] xl:min-h-0 xl:grid-cols-[12.5rem_minmax(0,1fr)]">
          {/* Picker column: month nav + mini calendar, with the agenda growing
              to fill the rest of the column down to the time-grid's bottom.
              Nudged toward the right border. */}
          <div className="-ms-4 flex min-h-0 flex-col">
            <div className="space-y-2">
              <MonthNav
                viewMonth={calendar.viewMonth}
                onPrevMonth={calendar.goToPrevMonth}
                onNextMonth={calendar.goToNextMonth}
                onToday={calendar.goToToday}
              />
              <CalendarGrid
                monthGrid={calendar.monthGrid}
                viewMonth={calendar.viewMonth}
                today={calendar.today}
                activeRange={calendar.activeRange}
                eventsByDay={calendar.eventsByDay}
                isSelected={calendar.isSelected}
                onSelectStart={calendar.beginSelection}
                onSelectEnter={calendar.extendSelection}
              />
            </div>
            <ScheduleAgenda
              events={calendar.eventsInRange}
              today={calendar.today}
              rangeStart={calendar.rangeStart}
              rangeEnd={calendar.rangeEnd}
            />
          </div>

          {/* View column: a horizontal filter toolbar above the time-grid, which
              fills the rest of the column height. */}
          <div className="flex min-h-0 flex-col gap-3">
            <div className="space-y-2">
              {/* Category legend on its own row, above the facet filters. */}
              <CategoryFilter
                categories={calendar.categories}
                hiddenCategories={calendar.hiddenCategories}
                onToggleCategory={calendar.toggleCategory}
              />
              <ScheduleFilters
                facets={calendar.facets}
                facetOptions={calendar.facetOptions}
                facetFilters={calendar.facetFilters}
                onToggleValue={calendar.toggleFacetValue}
                onClearFacet={calendar.clearFacet}
                onClearAll={calendar.clearAllFilters}
                activeCount={calendar.activeFilterCount}
              />
            </div>
            <div className="min-h-0 flex-1">
              <TimeGridView
                days={calendar.selectedDays}
                today={calendar.today}
                onEventClick={menu.openAt}
              />
            </div>
          </div>
        </div>
      </CardContent>

      <ScheduleEventMenu
        open={menu.open}
        onOpenChange={menu.handleOpenChange}
        virtualRef={menu.virtualRef}
        category={menu.activeEvent?.category}
        onSelect={handleSelect}
      />

      {/* The same modals the management modules open from their row dropdowns. */}
      <ActivityFormModal addActivity={actions.activityEdit} />
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
      <ActivityEnrollmentsModal
        open={actions.activityEnrollments.open}
        onOpenChange={actions.activityEnrollments.onOpenChange}
        activity={actions.activityEnrollments.activity}
        candidates={actions.activityEnrollments.candidates}
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
    </Card>
  );
}
