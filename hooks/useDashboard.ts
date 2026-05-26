import { useState } from "react";
import type { ActivePanel } from "@/components/dashboard/DashboardStats";
import type { RatingTier } from "@/components/dashboard/RatingDistribution";

const initialTiers: RatingTier[] = [
  { label: "מתחילים", count: 2, filter: "מתחת ל-800" },
  { label: "בינוניים", count: 3, filter: "800 – 1200" },
  { label: "מתקדמים", count: 2, filter: "1200 – 1600" },
  { label: "אליטה", count: 3, filter: "1600+" },
];

export function useDashboard() {
  const [tiers, setTiers] = useState<RatingTier[]>(initialTiers);
  const [activePanel, setActivePanel] = useState<ActivePanel>("players");

  function handleTierChange(index: number, updated: Partial<RatingTier>) {
    setTiers((prev) => prev.map((t, i) => (i === index ? { ...t, ...updated } : t)));
  }

  function handlePanelSelect(panel: ActivePanel) {
    setActivePanel(panel);
  }

  return { tiers, activePanel, handleTierChange, handlePanelSelect };
}
