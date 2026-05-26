import { StatCard } from "@/components/shared/StatCard";

export type ActivePanel = "players" | "clubs" | "sessions" | "tournaments" | null;

interface DashboardStatsProps {
  onSelect: (panel: ActivePanel) => void;
}

export function DashboardStats({ onSelect }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCard
        label="שחקנים פעילים"
        value={10}
        subtext="10 חדשים החודש"
        icon="/icons/people icon6.png"
        color="indigo"
        onClick={() => onSelect("players")}
      />
      <StatCard
        label="חוגים פעילים"
        value={5}
        icon="/icons/teacher icon.png"
        color="emerald"
        onClick={() => onSelect("clubs")}
      />
      <StatCard
        label="חוגים היום"
        value={1}
        icon="/icons/schedual icon.png"
        color="rose"
        onClick={() => onSelect("sessions")}
      />
      <StatCard
        label="תחרויות היום"
        value={0}
        icon="/icons/trophy icon.png"
        color="amber"
        onClick={() => onSelect("tournaments")}
      />
    </div>
  );
}
