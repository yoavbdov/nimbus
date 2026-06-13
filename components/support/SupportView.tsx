"use client";

import { motion } from "framer-motion";
import { FilePlus2, Inbox } from "lucide-react";
import { SupportNewTicket } from "@/components/support/SupportNewTicket";
import { SupportTicketsList } from "@/components/support/SupportTicketsList";
import { useTabView } from "@/hooks/shared/useTabView";
import { cn } from "@/lib/utils";

type View = "new" | "tickets";

const tabs: { key: View; label: string; icon: React.ElementType }[] = [
  { key: "new", label: "פתיחת פנייה", icon: FilePlus2 },
  { key: "tickets", label: "הפניות שלי", icon: Inbox },
];

export function SupportView() {
  const { view, setView } = useTabView<View>("new");

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
                active
                  ? "text-foreground"
                  : "text-foreground/60 hover:text-foreground",
              )}
            >
              {active && (
                <motion.span
                  layoutId="support-tab"
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

      {view === "new" ? <SupportNewTicket /> : <SupportTicketsList />}
    </div>
  );
}
