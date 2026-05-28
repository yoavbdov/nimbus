"use client";

import { motion } from "framer-motion";
import { StatCard } from "@/components/shared/StatCard";

export type ActivePanel =
  | "players"
  | "clubs"
  | "sessions"
  | "tournaments"
  | null;

interface DashboardStatsProps {
  onSelect: (panel: ActivePanel) => void;
  activePanel?: ActivePanel;
}

const stats: Array<{
  key: NonNullable<ActivePanel>;
  label: string;
  value: number;
  subtext?: string;
  icon: string;
  color: "indigo" | "sky";
}> = [
  {
    key: "players",
    label: "שחקנים פעילים",
    value: 10,
    icon: "/icons/people icon.png",
    color: "indigo",
  },
  {
    key: "clubs",
    label: "חוגים פעילים",
    value: 5,
    icon: "/icons/teacher2 icon.png",
    color: "indigo",
  },
  {
    key: "sessions",
    label: "חוגים היום",
    value: 1,
    icon: "/icons/calendar icon.png",
    color: "indigo",
  },
  {
    key: "tournaments",
    label: "תחרויות היום",
    value: 0,
    icon: "/icons/trophy icon.png",
    color: "indigo",
  },
];

const containerVariants = {
  animate: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const itemVariants = {
  initial: { opacity: 0, y: 18 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function DashboardStats({ onSelect, activePanel }: DashboardStatsProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch"
    >
      {stats.map((s) => {
        const isActive = activePanel === s.key;
        return (
          <motion.div
            key={s.key}
            variants={itemVariants}
            animate={{ scale: isActive ? 1.09 : 1 }}
            transition={{ type: "spring", stiffness: 320, damping: 24 }}
            className="h-full"
          >
            <StatCard
              label={s.label}
              value={s.value}
              icon={s.icon}
              color={s.color}
              active={isActive}
              onClick={() => onSelect(s.key)}
            />
          </motion.div>
        );
      })}
    </motion.div>
  );
}
