import { useState } from "react";
import type { ActivePanel } from "@/components/dashboard/DashboardStats";

export function useDashboard() {
  const [activePanel, setActivePanel] = useState<ActivePanel>("players");

  function handlePanelSelect(panel: ActivePanel) {
    setActivePanel(panel);
  }

  return { activePanel, handlePanelSelect };
}
