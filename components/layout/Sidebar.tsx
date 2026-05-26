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
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "לוח בקרה", icon: LayoutDashboard },
  { href: "/schedule", label: "לוח זמנים", icon: CalendarDays },
  { href: "/players", label: "שחקנים", icon: Users },
  { href: "/coaches", label: "מדריכים", icon: GraduationCap },
  { href: "/classes", label: "חוגים", icon: BookOpen },
  { href: "/tournaments", label: "תחרויות ואירועים", icon: Trophy },
  { href: "/rooms", label: "חדרים וציוד", icon: DoorOpen },
  { href: "/attendance", label: "נוכחות", icon: ClipboardCheck },
  { href: "/leagues", label: "קבוצות ליגה", icon: Swords },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 inset-s-0 z-40 w-56 flex flex-col bg-slate-900">
      {/* לוגו */}
      <div className="px-4 py-5 border-b border-slate-700/60">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <Swords className="size-4 text-white" />
          </div>
          <span className="text-white font-semibold text-sm leading-tight">
            Chess Nimbus
          </span>
        </div>
      </div>

      {/* ניווט */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-150",
                active
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* יציאה */}
      <div className="px-3 py-4 border-t border-slate-700/60">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 px-3 py-2.5 text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors duration-150"
        >
          <LogOut className="size-4 shrink-0" />
          <span>יציאה</span>
        </Button>
      </div>
    </aside>
  );
}
