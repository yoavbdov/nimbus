"use client";

import { AnimatePresence, motion } from "framer-motion";
import { PageShell } from "@/components/layout/PageShell";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { RatingDistribution } from "@/components/dashboard/RatingDistribution";
import { TodaySessions } from "@/components/dashboard/TodaySessions";
import { TodayTournaments } from "@/components/dashboard/TodayTournaments";
import { RegistrationStatus } from "@/components/dashboard/RegistrationStatus";
import { useDashboard } from "@/hooks/useDashboard";

const panelVariants = {
  initial: { opacity: 0, y: 14, filter: "blur(6px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -8, filter: "blur(4px)" },
};

export default function DashboardPage() {
  const { tiers, activePanel, handleTierChange, handlePanelSelect } =
    useDashboard();

  return (
    <PageShell title="לוח בקרה">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="space-y-6"
      >
        <DashboardStats onSelect={handlePanelSelect} activePanel={activePanel} />

        <AnimatePresence mode="wait">
          {activePanel && (
            <motion.div
              key={activePanel}
              variants={panelVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              {activePanel === "players" && (
                <div className="bloom bloom-indigo rounded-3xl">
                  <RatingDistribution
                    tiers={tiers}
                    onTierChange={handleTierChange}
                  />
                </div>
              )}
              {activePanel === "clubs" && (
                <div className="bloom bloom-indigo rounded-3xl">
                  <RegistrationStatus />
                </div>
              )}
              {activePanel === "sessions" && (
                <div className="bloom bloom-indigo rounded-3xl">
                  <TodaySessions />
                </div>
              )}
              {activePanel === "tournaments" && (
                <div className="bloom bloom-indigo rounded-3xl">
                  <TodayTournaments />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </PageShell>
  );
}
