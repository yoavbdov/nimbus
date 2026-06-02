"use client";

import { motion } from "framer-motion";
import { PageShell } from "@/components/layout/PageShell";
import { LeagueTeamsView } from "@/components/leagues/LeagueTeamsView";

export default function LeaguesPage() {
  return (
    <PageShell title="קבוצות ליגה">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="bloom bloom-indigo rounded-3xl"
      >
        <LeagueTeamsView />
      </motion.div>
    </PageShell>
  );
}
