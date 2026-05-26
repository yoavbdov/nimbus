import { Users, BookOpen, Trophy, CalendarCheck } from "lucide-react";
import { StatCard } from "@/components/shared/StatCard";

export function DashboardStats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="שחקנים פעילים"
        value={10}
        subtext="10 חדשים החודש"
        icon={Users}
        accent="blue"
      />
      <StatCard
        label="חוגים פעילים"
        value={5}
        icon={BookOpen}
        accent="emerald"
      />
      <StatCard
        label="חוגים היום"
        value={1}
        icon={CalendarCheck}
        accent="amber"
      />
      <StatCard
        label="תחרויות היום"
        value={0}
        icon={Trophy}
        accent="red"
      />
    </div>
  );
}
