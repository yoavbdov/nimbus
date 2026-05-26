"use client";

import { PageShell } from "@/components/layout/PageShell";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { RatingDistribution } from "@/components/dashboard/RatingDistribution";
import { TodaySessions } from "@/components/dashboard/TodaySessions";
import { RegistrationStatus } from "@/components/dashboard/RegistrationStatus";
import { useDashboard } from "@/hooks/useDashboard";

export default function DashboardPage() {
  const { tiers, activePanel, handleTierChange, handlePanelSelect } =
    useDashboard();

  return (
    <PageShell title="לוח בקרה">
      <div className="animate-in fade-in-0 duration-200 space-y-4">
        <DashboardStats onSelect={handlePanelSelect} />

        {activePanel && (
          <div
            key={activePanel}
            className="animate-in fade-in-0 slide-in-from-bottom-2 duration-500"
          >
            {activePanel === "players" && (
              <RatingDistribution
                tiers={tiers}
                onTierChange={handleTierChange}
              />
            )}
            {activePanel === "clubs" && <RegistrationStatus />}
            {activePanel === "sessions" && <TodaySessions />}
            {activePanel === "tournaments" && (
              <p className="text-center text-rose-500 font-medium py-6">
                פה צריך להופיע רק תחרויות היום - להוסיף
              </p>
            )}
          </div>
        )}
      </div>
    </PageShell>
  );
}
