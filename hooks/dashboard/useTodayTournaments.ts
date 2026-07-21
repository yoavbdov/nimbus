import { useMemo, useState, type MouseEvent } from "react";
import { useTournamentActionsMenu } from "@/hooks/useTournamentActionsMenu";
import { useAddTournament } from "@/hooks/tournaments/useAddTournament";
import { usePossibleTournamentEnrollments } from "@/hooks/tournaments/usePossibleTournamentEnrollments";
import { useAddCoach } from "@/hooks/coaches/useAddCoach";
import { useArchiveConfirm } from "@/hooks/useArchiveConfirm";
import { useCollection } from "@/lib/firebase/useCollection";
import { archiveTournament } from "@/lib/firebase/data/tournaments";
import { tournamentFormValuesFor } from "@/lib/tournament-details";
import { coaches } from "@/lib/coaches-data";
import { coachFormValuesFor } from "@/lib/coach-details";
import { todayHebrewDay } from "@/lib/courses-data";
import { toISODate } from "@/lib/calendar";
import { useScheduleEvents } from "@/hooks/schedule/useScheduleEvents";
import type { Tournament } from "@/lib/tournaments-data";
import type { TournamentAction } from "@/lib/tournament-actions";

export interface TodayTournament {
  id: string;
  time: string;
  name: string;
  judge: string;
  room: string;
  round: string;
  participants: number;
}

export const todayLabel = `יום ${todayHebrewDay()}`;

export function useTodayTournaments() {
  const menu = useTournamentActionsMenu();
  const tournamentEdit = useAddTournament();
  const enrollments = usePossibleTournamentEnrollments();
  const coachEdit = useAddCoach();
  const archive = useArchiveConfirm();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [archiveId, setArchiveId] = useState<string | null>(null);

  // Tournaments whose real session occurs TODAY (by date, not weekday). Each
  // today-event is paired with its live tournament record for the menu/columns.
  const [today] = useState(() => new Date());
  const events = useScheduleEvents(today);
  const { data } = useCollection<Tournament>("tournaments");
  const todayIso = toISODate(today);

  const todayList = useMemo(() => {
    const byId = new Map(data.map((t) => [t.id, t]));
    return events
      .filter((e) => e.category === "תחרות" && e.date === todayIso)
      .sort((a, b) => a.start.localeCompare(b.start))
      .map((e) => ({ event: e, record: byId.get(e.parentId) }))
      .filter(
        (row): row is { event: (typeof events)[number]; record: Tournament } =>
          row.record != null,
      );
  }, [events, data, todayIso]);

  const tournaments = useMemo<TodayTournament[]>(
    () =>
      todayList.map(({ event, record }) => ({
        id: record.id,
        time: `${event.start}–${event.end}`,
        name: record.name,
        judge: record.judge,
        room: event.location,
        round: `${record.rounds} סבבים`,
        participants: event.players.length,
      })),
    [todayList],
  );

  function onSelectAction(action: TournamentAction) {
    const tournament =
      activeIndex === null ? undefined : todayList[activeIndex]?.record;
    if (action.id === "details" && tournament) {
      tournamentEdit.openForEdit(tournamentFormValuesFor(tournament));
    } else if (action.id === "judge" && tournament) {
      const coach = coaches.find((c) => c.name === tournament.judge);
      if (coach) coachEdit.openForEdit(coachFormValuesFor(coach));
    } else if (action.id === "enrollments" && tournament) {
      enrollments.openFor(tournament);
    } else if (action.id === "archive" && tournament) {
      setArchiveId(tournament.id);
      archive.openFor(1);
    }
    menu.onSelect(action);
  }

  function confirmArchive() {
    if (archiveId) void archiveTournament(archiveId);
    setArchiveId(null);
    archive.cancel();
  }

  function handleRowClick(index: number, e: MouseEvent) {
    setActiveIndex(index);
    menu.openAt(e);
  }

  function handleMenuOpenChange(next: boolean) {
    menu.setOpen(next);
    if (!next) setActiveIndex(null);
  }

  return {
    tournaments,
    menuOpen: menu.open,
    virtualRef: menu.virtualRef,
    onSelectAction,
    tournamentEdit,
    enrollments,
    coachEdit,
    archive,
    confirmArchive,
    activeIndex,
    handleRowClick,
    handleMenuOpenChange,
  };
}
