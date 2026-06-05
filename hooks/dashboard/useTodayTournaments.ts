import { useState, type MouseEvent } from "react";
import { useTournamentActionsMenu } from "@/hooks/useTournamentActionsMenu";

export interface TodayTournament {
  time: string;
  name: string;
  judge: string;
  room: string;
  round: string;
  participants: number;
}

const tournaments: TodayTournament[] = [
  {
    time: "17:00–20:00",
    name: "טורניר בזק מהיר",
    judge: "רון פרידמן",
    room: "אולם תחרויות",
    round: "סבב 3 מתוך 9",
    participants: 48,
  },
  {
    time: "18:30–21:00",
    name: "אליפות הבזק",
    judge: "רון פרידמן",
    room: "אולם תחרויות",
    round: "סבב 5 מתוך 13",
    participants: 56,
  },
];

export const todayLabel = "יום חמישי, 21 במאי";

export function useTodayTournaments() {
  const menu = useTournamentActionsMenu();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

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
    onSelectAction: menu.onSelect,
    activeIndex,
    handleRowClick,
    handleMenuOpenChange,
  };
}
