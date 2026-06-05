import { useState } from "react";
import type { ActivePanel } from "@/components/dashboard/DashboardStats";
import type { RatingTier } from "@/components/dashboard/RatingDistribution";

const initialTiers: RatingTier[] = [
  { label: "מתחילים", count: 2, min: 0, max: 800 },
  { label: "בינוניים", count: 3, min: 800, max: 1200 },
  { label: "מתקדמים", count: 2, min: 1200, max: 1600 },
  { label: "אליטה", count: 3, min: 1600, max: 3000 },
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
