"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LeaguesActions } from "@/components/leagues/LeaguesActions";
import { LeaguesTable } from "@/components/leagues/LeaguesTable";
import { leagueTeams, type LeagueCategory } from "@/lib/leagues-data";

const subtitles: Record<LeagueCategory, string> = {
  בוגרים: "קבוצות בוגרים מסודרות לפי דרגת ליגה",
  נוער: "קבוצות נוער מסודרות לפי דרגת ליגה",
  נשים: "קבוצות נשים מסודרות לפי דרגת ליגה",
};

export function LeaguesPanel({ category }: { category: LeagueCategory }) {
  const teams = leagueTeams.filter((t) => t.category === category);

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
          <LeaguesActions />
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
              <LeaguesTable teams={teams} />
            </motion.div>
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}
