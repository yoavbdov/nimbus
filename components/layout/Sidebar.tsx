"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  GraduationCap,
  BookOpen,
  Trophy,
  DoorOpen,
  ClipboardCheck,
  Swords,
  Settings,
  LifeBuoy,
  LogOut,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navSections = [
  {
    items: [{ href: "/dashboard", label: "לוח בקרה", icon: LayoutDashboard }],
  },
  {
    label: "נתונים",
    items: [
      { href: "/players", label: "שחקנים", icon: Users },
      { href: "/coaches", label: "מדריכים", icon: GraduationCap },
    ],
  },
  {
    label: "אירועים",
    items: [
      { href: "/classes", label: "חוגים", icon: BookOpen },
      { href: "/tournaments", label: "תחרויות ואירועים", icon: Trophy },
      { href: "/schedule", label: "לוח זמנים", icon: CalendarDays },
    ],
  },
  {
    label: "תפעול",
    items: [
      { href: "/rooms", label: "חדרים וציוד", icon: DoorOpen },
      { href: "/attendance", label: "נוכחות", icon: ClipboardCheck },
      { href: "/leagues", label: "קבוצות ליגה", icon: Swords },
    ],
  },
  {
    label: "מערכת",
    items: [
      { href: "/settings", label: "הגדרות", icon: Settings },
      { href: "/support", label: "תמיכה", icon: LifeBuoy },
    ],
  },
];

function NavItem({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
}) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      className={cn(
        "relative flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-200",
        active
          ? "neu-pressed text-foreground font-medium"
          : "text-foreground/70 hover:text-foreground hover:neu-raised-xs",
      )}
    >
      {active && (
        <motion.span
          layoutId="sidebar-active-indicator"
          className="absolute inset-y-2 inset-s-1 w-0.5 rounded-full bg-primary"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
      <Icon
        className={cn(
          "size-4 shrink-0 transition-colors duration-200",
          active && "text-primary",
        )}
      />
      <span>{label}</span>
    </Link>
  );
}

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 inset-s-0 z-40 w-56 flex flex-col glass border-none! ring-0 rounded-none shadow-none! bg-primary/12!">
      <div className="px-4 py-5">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl neu-raised-sm bloom bloom-indigo flex items-center justify-center shrink-0">
            <Swords className="size-4 text-primary" />
          </div>
          <span className="text-base font-semibold tracking-tight text-foreground">
            Chess Nimbus
          </span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-2 overflow-y-auto space-y-5">
        {navSections.map((section, i) => (
          <div key={i}>
            {section.label && (
              <p className="text-[0.65rem] text-foreground/50 uppercase tracking-[0.18em] px-3 mb-2">
                {section.label}
              </p>
            )}
            <div className="space-y-1">
              {section.items.map((item) => (
                <NavItem key={item.href} {...item} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-3 py-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 px-3 py-2 h-auto rounded-xl text-sm text-foreground/70 hover:text-foreground hover:neu-raised-xs transition-all duration-200"
        >
          <LogOut className="size-4 shrink-0" />
          <span>יציאה</span>
        </Button>
      </div>
    </aside>
  );
}
