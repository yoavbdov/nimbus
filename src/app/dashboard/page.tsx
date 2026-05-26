import { PageShell } from "@/components/layout/PageShell";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { RatingDistribution } from "@/components/dashboard/RatingDistribution";
import { TodaySessions } from "@/components/dashboard/TodaySessions";
import { RegistrationStatus } from "@/components/dashboard/RegistrationStatus";

export default function DashboardPage() {
  return (
    <PageShell title="לוח בקרה">
      <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300 space-y-6">
        <DashboardStats />

        <RatingDistribution />

        <TodaySessions />

        <RegistrationStatus />
      </div>
    </PageShell>
  );
}
