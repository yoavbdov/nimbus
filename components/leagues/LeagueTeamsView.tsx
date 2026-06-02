"use client";

import { motion } from "framer-motion";
import { Users, Sparkles, Venus } from "lucide-react";
import { LeaguesPanel } from "@/components/leagues/LeaguesPanel";
import { useTabView } from "@/hooks/shared/useTabView";
import type { LeagueCategory } from "@/lib/leagues-data";
import { cn } from "@/lib/utils";

const tabs: { key: LeagueCategory; label: string; icon: React.ElementType }[] = [
  { key: "בוגרים", label: "בוגרים", icon: Users },
  { key: "נוער", label: "נוער", icon: Sparkles },
  { key: "נשים", label: "נשים", icon: Venus },
];

export function LeagueTeamsView() {
  const { view, setView } = useTabView<LeagueCategory>("בוגרים");

  return (
    <div className="space-y-4">
      <div className="tint-indigo inline-flex items-center gap-1 p-1 rounded-2xl neu-inset w-fit">
        {tabs.map(({ key, label, icon: Icon }) => {
          const active = view === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setView(key)}
              aria-pressed={active}
              className={cn(
                "relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200",
                active ? "text-foreground" : "text-foreground/60 hover:text-foreground",
              )}
            >
              {active && (
                <motion.span
                  layoutId="league-category-tab"
                  className="absolute inset-0 rounded-xl neu-raised-xs bg-(--tint-soft)"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <Icon className={cn("relative z-10 size-4", active && "tint-text")} />
              <span className="relative z-10">{label}</span>
            </button>
          );
        })}
      </div>

      <LeaguesPanel category={view} />
    </div>
  );
}
