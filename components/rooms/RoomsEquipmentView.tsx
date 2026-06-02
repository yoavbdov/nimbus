"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { DoorOpen, Package } from "lucide-react";
import { Card } from "@/components/ui/card";
import { RoomsPanel } from "@/components/rooms/RoomsPanel";
import { EquipmentPanel } from "@/components/rooms/EquipmentPanel";
import { cn } from "@/lib/utils";

type View = "rooms" | "equipment";

const tabs: { key: View; label: string; icon: React.ElementType }[] = [
  { key: "rooms", label: "חדרים", icon: DoorOpen },
  { key: "equipment", label: "ציוד", icon: Package },
];

export function RoomsEquipmentView() {
  const [view, setView] = useState<View>("rooms");

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
                  layoutId="rooms-equipment-tab"
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

      {view === "rooms" ? (
        <RoomsPanel />
      ) : (
        <Card className="tint-indigo glass shadow-depth-xl border-0 ring-0 rounded-3xl gap-0 py-0 overflow-hidden">
          <div className="h-1 tint-bar" />
          <EquipmentPanel />
        </Card>
      )}
    </div>
  );
}
