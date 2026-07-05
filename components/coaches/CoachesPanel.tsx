"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CoachesActions } from "@/components/coaches/CoachesActions";
import { FilterBar } from "@/components/coaches/filters/FilterBar";
import { CoachesTable } from "@/components/coaches/CoachesTable";
import { DeleteCoachModal } from "@/components/coaches/DeleteCoachModal";
import { AvailabilityModal } from "@/components/coaches/AvailabilityModal";
import { AddCoachModal } from "@/components/coaches/AddCoachModal";
import { ClubsModal } from "@/components/coaches/ClubsModal";
import { TournamentsModal } from "@/components/coaches/TournamentsModal";
import { useCoachesPanel } from "@/hooks/coaches/useCoachesPanel";
import { useDeleteCoach } from "@/hooks/coaches/useDeleteCoach";
import { useAddCoach } from "@/hooks/coaches/useAddCoach";
import { useCoachClubRegistration } from "@/hooks/coaches/useCoachClubRegistration";
import { useCoachTournamentRegistration } from "@/hooks/coaches/useCoachTournamentRegistration";
import { coachFormValuesFor } from "@/lib/coach-details";
import { useCoachAvailabilityCheck } from "@/hooks/coaches/useCoachAvailabilityCheck";

export function CoachesPanel() {
  const {
    search,
    setSearch,
    filters,
    addFilter,
    updateFilter,
    removeFilter,
    clearAll,
    filtered,
    filterKey,
    coaches,
    toggleStatus,
    filterOptions,
  } = useCoachesPanel();

  const deleteCoach = useDeleteCoach();
  const availability = useCoachAvailabilityCheck(coaches);
  const addCoach = useAddCoach();
  const clubRegistration = useCoachClubRegistration();
  const tournamentRegistration = useCoachTournamentRegistration();

  function handleCoachAction(actionId: string, coachId: string | null) {
    if (actionId === "details") {
      const coach = coaches.find((c) => c.id === coachId);
      if (coach) addCoach.openForEdit(coachFormValuesFor(coach));
    } else if (actionId === "clubs") {
      const coach = coaches.find((c) => c.id === coachId);
      if (coach)
        clubRegistration.openFor({
          id: coach.id,
          name: coach.name,
          clubs: coach.courses,
        });
    } else if (actionId === "competitions") {
      const coach = coaches.find((c) => c.id === coachId);
      if (coach)
        tournamentRegistration.openFor({
          id: coach.id,
          name: coach.name,
          tournaments: coach.tournaments,
        });
    } else if (actionId === "availability") {
      availability.openWith(coachId ? [coachId] : []);
    } else if (actionId === "delete") {
      const coach = coaches.find((c) => c.id === coachId);
      if (coach) deleteCoach.openFor([{ id: coach.id, name: coach.name }]);
    }
  }

  function handleBulkAction(actionId: string, coachIds: string[]) {
    if (actionId === "availability") {
      availability.openWith(coachIds);
    } else if (actionId === "delete") {
      const targets = coachIds
        .map((id) => coaches.find((c) => c.id === id))
        .filter((c): c is (typeof coaches)[number] => c != null)
        .map((c) => ({ id: c.id, name: c.name }));
      deleteCoach.openFor(targets);
    }
  }

  return (
    <Card className="tint-indigo glass shadow-depth-xl border-0 ring-0 rounded-3xl gap-0 py-0 overflow-hidden">
      <div className="h-1 tint-bar" />
      <CardContent className="p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1.5">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight tint-text leading-none">
              ניהול מדריכים
            </h1>
            <p className="text-xs text-muted-foreground/80 num">
              {filtered.length} מתוך {coaches.length} מדריכים
            </p>
          </div>
          <CoachesActions
            onAddCoach={addCoach.openModal}
            onCheckAvailability={() => availability.openWith([])}
          />
        </div>

        <Separator className="bg-foreground/8" />

        <FilterBar
          search={search}
          filters={filters}
          onSearchChange={setSearch}
          onAdd={addFilter}
          onUpdate={updateFilter}
          onRemove={removeFilter}
          onClearAll={clearAll}
          options={filterOptions}
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
              <CoachesTable
                coaches={filtered}
                onAction={handleCoachAction}
                onBulkAction={handleBulkAction}
                onToggleStatus={toggleStatus}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </CardContent>

      <AvailabilityModal
        open={availability.open}
        onOpenChange={availability.handleOpenChange}
        coaches={coaches}
        selectedIds={availability.selectedIds}
        onToggleCoach={availability.toggleCoach}
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

      <AddCoachModal
        open={addCoach.open}
        mode={addCoach.mode}
        onOpenChange={addCoach.handleOpenChange}
        values={addCoach.values}
        onFieldChange={addCoach.updateField}
        valid={addCoach.valid}
        onConfirm={addCoach.confirm}
      />

      <ClubsModal
        open={clubRegistration.open}
        onOpenChange={clubRegistration.handleOpenChange}
        coachName={clubRegistration.coachName}
        editing={clubRegistration.editing}
        registered={clubRegistration.registered}
        available={clubRegistration.available}
        pendingRemoval={clubRegistration.pendingRemoval}
        selectedClub={clubRegistration.selectedClub}
        onSelectedClubChange={clubRegistration.setSelectedClub}
        dirty={clubRegistration.dirty}
        confirmingClose={clubRegistration.confirmingClose}
        closeNudge={clubRegistration.closeNudge}
        onStartEditing={clubRegistration.startEditing}
        onCommit={clubRegistration.commit}
        onConfirmClose={clubRegistration.confirmClose}
        onCancelClose={clubRegistration.cancelClose}
        onRequestRemove={clubRegistration.requestRemove}
        onCancelRemove={clubRegistration.cancelRemove}
        onConfirmRemove={clubRegistration.confirmRemove}
        onAddClub={clubRegistration.addClub}
      />

      <TournamentsModal
        open={tournamentRegistration.open}
        onOpenChange={tournamentRegistration.handleOpenChange}
        coachName={tournamentRegistration.coachName}
        editing={tournamentRegistration.editing}
        registered={tournamentRegistration.registered}
        available={tournamentRegistration.available}
        pendingRemoval={tournamentRegistration.pendingRemoval}
        selectedTournament={tournamentRegistration.selectedTournament}
        onSelectedTournamentChange={tournamentRegistration.setSelectedTournament}
        dirty={tournamentRegistration.dirty}
        confirmingClose={tournamentRegistration.confirmingClose}
        closeNudge={tournamentRegistration.closeNudge}
        onStartEditing={tournamentRegistration.startEditing}
        onCommit={tournamentRegistration.commit}
        onConfirmClose={tournamentRegistration.confirmClose}
        onCancelClose={tournamentRegistration.cancelClose}
        onRequestRemove={tournamentRegistration.requestRemove}
        onCancelRemove={tournamentRegistration.cancelRemove}
        onConfirmRemove={tournamentRegistration.confirmRemove}
        onAddTournament={tournamentRegistration.addTournament}
      />

      <DeleteCoachModal
        open={deleteCoach.open}
        onOpenChange={deleteCoach.handleOpenChange}
        coachNames={deleteCoach.names}
        expectedPhrase={deleteCoach.expectedPhrase}
        confirmText={deleteCoach.confirmText}
        onConfirmTextChange={deleteCoach.setConfirmText}
        valid={deleteCoach.valid}
        onConfirm={deleteCoach.confirm}
      />
    </Card>
  );
}
