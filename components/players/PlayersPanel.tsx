"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PlayersActions } from "@/components/players/PlayersActions";
import { FilterBar } from "@/components/players/filters/FilterBar";
import { PlayersTable } from "@/components/players/PlayersTable";
import { AvailabilityModal } from "@/components/players/AvailabilityModal";
import { AddPlayerModal } from "@/components/players/AddPlayerModal";
import { DeletePlayerModal } from "@/components/players/DeletePlayerModal";
import { ClubsModal } from "@/components/players/ClubsModal";
import { TournamentsModal } from "@/components/players/TournamentsModal";
import { LeagueModal } from "@/components/players/LeagueModal";
import { usePlayersPanel } from "@/hooks/players/usePlayersPanel";
import { useAvailabilityCheck } from "@/hooks/players/useAvailabilityCheck";
import { useAddPlayer } from "@/hooks/players/useAddPlayer";
import { useDeletePlayer } from "@/hooks/players/useDeletePlayer";
import { useClubRegistration } from "@/hooks/players/useClubRegistration";
import { useTournamentRegistration } from "@/hooks/players/useTournamentRegistration";
import { useLeagueRegistration } from "@/hooks/players/useLeagueRegistration";
import { players as allPlayers } from "@/lib/players-data";
import { playerFormValuesFor } from "@/lib/player-details";

export function PlayersPanel() {
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
  } = usePlayersPanel();

  const availability = useAvailabilityCheck(allPlayers);
  const addPlayer = useAddPlayer();
  const deletePlayer = useDeletePlayer();
  const clubRegistration = useClubRegistration();
  const tournamentRegistration = useTournamentRegistration();
  const leagueRegistration = useLeagueRegistration();

  function handlePlayerAction(actionId: string, playerId: string | null) {
    if (actionId === "details") {
      const player = allPlayers.find((p) => p.id === playerId);
      if (player) addPlayer.openForEdit(playerFormValuesFor(player));
    } else if (actionId === "clubs") {
      const player = allPlayers.find((p) => p.id === playerId);
      if (player) clubRegistration.openFor({ name: player.name, clubs: player.clubs });
    } else if (actionId === "tournaments") {
      const player = allPlayers.find((p) => p.id === playerId);
      if (player)
        tournamentRegistration.openFor({
          name: player.name,
          tournaments: player.tournaments,
        });
    } else if (actionId === "league") {
      const player = allPlayers.find((p) => p.id === playerId);
      if (player)
        leagueRegistration.openFor({
          name: player.name,
          leagueTeam: player.leagueTeam,
        });
    } else if (actionId === "availability") {
      availability.openWith(playerId ? [playerId] : []);
    } else if (actionId === "delete") {
      const player = allPlayers.find((p) => p.id === playerId);
      if (player) deletePlayer.openFor([player.name]);
    }
  }

  function handleBulkAction(actionId: string, playerIds: string[]) {
    if (actionId === "availability") {
      availability.openWith(playerIds);
    } else if (actionId === "delete") {
      const names = playerIds
        .map((id) => allPlayers.find((p) => p.id === id)?.name)
        .filter((name): name is string => name != null);
      deletePlayer.openFor(names);
    }
  }

  return (
    <Card className="tint-indigo glass shadow-depth-xl border-0 ring-0 rounded-3xl gap-0 py-0 overflow-hidden">
      <div className="h-1 tint-bar" />
      <CardContent className="p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1.5">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight tint-text leading-none">
              ניהול שחקנים
            </h1>
            <p className="text-xs text-muted-foreground/80 num">
              {filtered.length} מתוך {allPlayers.length} שחקנים
            </p>
          </div>
          <PlayersActions
            onAddPlayer={addPlayer.openModal}
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
              <PlayersTable
                players={filtered}
                onAction={handlePlayerAction}
                onBulkAction={handleBulkAction}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </CardContent>

      <AvailabilityModal
        open={availability.open}
        onOpenChange={availability.handleOpenChange}
        players={allPlayers}
        selectedIds={availability.selectedIds}
        onTogglePlayer={availability.togglePlayer}
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

      <AddPlayerModal
        open={addPlayer.open}
        mode={addPlayer.mode}
        onOpenChange={addPlayer.handleOpenChange}
        values={addPlayer.values}
        onFieldChange={addPlayer.updateField}
        birthParts={addPlayer.birthParts}
        onBirthPartChange={addPlayer.setBirthPart}
        onGradeChange={addPlayer.setGrade}
        valid={addPlayer.valid}
        onConfirm={addPlayer.confirm}
      />

      <DeletePlayerModal
        open={deletePlayer.open}
        onOpenChange={deletePlayer.handleOpenChange}
        playerNames={deletePlayer.names}
        expectedPhrase={deletePlayer.expectedPhrase}
        confirmText={deletePlayer.confirmText}
        onConfirmTextChange={deletePlayer.setConfirmText}
        valid={deletePlayer.valid}
        onConfirm={deletePlayer.confirm}
      />

      <ClubsModal
        open={clubRegistration.open}
        onOpenChange={clubRegistration.handleOpenChange}
        playerName={clubRegistration.playerName}
        editing={clubRegistration.editing}
        registered={clubRegistration.registered}
        available={clubRegistration.available}
        pendingRemoval={clubRegistration.pendingRemoval}
        selectedClub={clubRegistration.selectedClub}
        onSelectedClubChange={clubRegistration.setSelectedClub}
        onStartEditing={clubRegistration.startEditing}
        onStopEditing={clubRegistration.stopEditing}
        onRequestRemove={clubRegistration.requestRemove}
        onCancelRemove={clubRegistration.cancelRemove}
        onConfirmRemove={clubRegistration.confirmRemove}
        onAddClub={clubRegistration.addClub}
      />

      <TournamentsModal
        open={tournamentRegistration.open}
        onOpenChange={tournamentRegistration.handleOpenChange}
        playerName={tournamentRegistration.playerName}
        editing={tournamentRegistration.editing}
        registered={tournamentRegistration.registered}
        available={tournamentRegistration.available}
        pendingRemoval={tournamentRegistration.pendingRemoval}
        selectedTournament={tournamentRegistration.selectedTournament}
        onSelectedTournamentChange={tournamentRegistration.setSelectedTournament}
        onStartEditing={tournamentRegistration.startEditing}
        onStopEditing={tournamentRegistration.stopEditing}
        onRequestRemove={tournamentRegistration.requestRemove}
        onCancelRemove={tournamentRegistration.cancelRemove}
        onConfirmRemove={tournamentRegistration.confirmRemove}
        onAddTournament={tournamentRegistration.addTournament}
      />

      <LeagueModal
        open={leagueRegistration.open}
        onOpenChange={leagueRegistration.handleOpenChange}
        playerName={leagueRegistration.playerName}
        registered={leagueRegistration.registered}
        available={leagueRegistration.available}
        confirmingRemoval={leagueRegistration.confirmingRemoval}
        categoryFilter={leagueRegistration.categoryFilter}
        onCategoryFilterChange={leagueRegistration.setCategoryFilter}
        query={leagueRegistration.query}
        onQueryChange={leagueRegistration.setQuery}
        onRequestRemove={leagueRegistration.requestRemove}
        onCancelRemove={leagueRegistration.cancelRemove}
        onConfirmRemove={leagueRegistration.confirmRemove}
        onRegister={leagueRegistration.register}
      />
    </Card>
  );
}
