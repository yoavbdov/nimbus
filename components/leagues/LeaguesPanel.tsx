"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LeaguesActions } from "@/components/leagues/LeaguesActions";
import { LeaguesTable } from "@/components/leagues/LeaguesTable";
import { AddLeagueTeamModal } from "@/components/leagues/AddLeagueTeamModal";
import { EditLeagueTeamModal } from "@/components/leagues/EditLeagueTeamModal";
import { useAddLeagueTeam } from "@/hooks/leagues/useAddLeagueTeam";
import { useLeagueTeamDetails } from "@/hooks/leagues/useLeagueTeamDetails";
import { leagueTeams, type LeagueCategory } from "@/lib/leagues-data";

const subtitles: Record<LeagueCategory, string> = {
  בוגרים: "קבוצות בוגרים מסודרות לפי דרגת ליגה",
  נוער: "קבוצות נוער מסודרות לפי דרגת ליגה",
  נשים: "קבוצות נשים מסודרות לפי דרגת ליגה",
};

export function LeaguesPanel({ category }: { category: LeagueCategory }) {
  const teams = leagueTeams.filter((t) => t.category === category);
  const addTeam = useAddLeagueTeam();
  const details = useLeagueTeamDetails();

  function handleTeamAction(actionId: string, teamId: string) {
    const team = leagueTeams.find((t) => t.id === teamId);
    if (!team) return;
    // "פרטי קבוצה" lands on the details tab; "רשימת שחקנים" jumps to the players tab.
    if (actionId === "details") details.openFor(team, "details");
    else if (actionId === "players") details.openFor(team, "players");
  }

  return (
    <Card className="tint-indigo glass shadow-depth-xl border-0 ring-0 rounded-3xl gap-0 py-0 overflow-hidden">
      <div className="h-1 tint-bar" />
      <CardContent className="p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1.5">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight tint-text leading-none">
              קבוצות {category}
            </h1>
            <p className="text-xs text-muted-foreground/80 num">
              {teams.length} קבוצות · {subtitles[category]}
            </p>
          </div>
          <LeaguesActions onAddTeam={() => addTeam.openModal(category)} />
        </div>

        <Separator className="bg-foreground/8" />

        <div className="neu-inset rounded-2xl p-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={category}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <LeaguesTable teams={teams} onTeamAction={handleTeamAction} />
            </motion.div>
          </AnimatePresence>
        </div>
      </CardContent>

      <AddLeagueTeamModal
        open={addTeam.open}
        onOpenChange={addTeam.handleOpenChange}
        values={addTeam.values}
        onFieldChange={addTeam.updateField}
        valid={addTeam.valid}
        onConfirm={addTeam.confirm}
      />

      <EditLeagueTeamModal
        open={details.open}
        tab={details.tab}
        onTabChange={details.setTab}
        onOpenChange={details.handleOpenChange}
        values={details.values}
        onFieldChange={details.updateField}
        members={details.members}
        onRemovePlayer={details.removePlayer}
        valid={details.valid}
        onConfirm={details.confirm}
        pickerOpen={details.pickerOpen}
        onOpenPicker={details.openPicker}
        onPickerOpenChange={details.handlePickerOpenChange}
        query={details.query}
        onQueryChange={details.setQuery}
        pickerRows={details.pickerRows}
        checkedCount={details.checkedCount}
        onToggleChecked={details.toggleChecked}
        onConfirmAddPlayers={details.confirmAddPlayers}
      />
    </Card>
  );
}
