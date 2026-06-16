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
  Wrench,
  ChevronDown,
  LogOut,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useDisclosure } from "@/hooks/useDisclosure";
import { toolNavItems } from "@/lib/tools-data";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
    label: "פעילויות",
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
      { href: "/support", label: "תמיכה ויצירת קשר", icon: LifeBuoy },
    ],
  },
];

interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
}

/** Expandable "כלים" item for the mobile sheet. */
function ToolsNav({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname();
  const onToolsRoute = pathname.startsWith("/tools");
  const { open, setOpen } = useDisclosure(onToolsRoute);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className={cn(
          "flex w-full items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-all duration-150",
          onToolsRoute
            ? "text-sidebar-primary font-medium"
            : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground",
        )}
      >
        <Wrench
          className={cn(
            "size-4 shrink-0",
            onToolsRoute && "text-sidebar-primary",
          )}
        />
        <span>כלים</span>
        <ChevronDown
          className={cn(
            "ms-auto size-4 shrink-0 transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-0.5 ms-3 ps-2 border-s border-sidebar-border space-y-0.5">
              {toolNavItems.map(({ href, label, icon: Icon }) => {
                const active =
                  pathname === href || pathname.startsWith(href + "/");
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-all duration-150",
                      active
                        ? "bg-sidebar-primary/20 text-sidebar-primary font-medium"
                        : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-4 shrink-0",
                        active ? "text-sidebar-primary" : "",
                      )}
                    />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function MobileSidebar({ open, onClose }: MobileSidebarProps) {
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="right"
        className="w-52 p-0 bg-sidebar border-s border-sidebar-border"
      >
        <SheetHeader className="px-3 py-4 border-b border-sidebar-border">
          <SheetTitle className="flex items-center gap-2">
            <div className="size-7 rounded-md bg-sidebar-primary flex items-center justify-center shrink-0 shadow-sm">
              <Swords className="size-3.5 text-sidebar-primary-foreground" />
            </div>
            <span className="text-sm font-semibold text-sidebar-foreground">
              Chess Nimbus
            </span>
          </SheetTitle>
        </SheetHeader>

        <nav className="px-2 py-3 space-y-4 overflow-y-auto">
          {navSections.map((section, i) => (
            <div key={i}>
              {section.label && (
                <p className="text-xs text-sidebar-foreground/40 uppercase tracking-widest px-2 mb-1">
                  {section.label}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map(({ href, label, icon: Icon }) => {
                  const active =
                    pathname === href || pathname.startsWith(href + "/");
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-all duration-150",
                        active
                          ? "bg-sidebar-primary/20 text-sidebar-primary font-medium border-s-2 border-sidebar-primary"
                          : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                      )}
                    >
                      <Icon
                        className={cn(
                          "size-4 shrink-0",
                          active ? "text-sidebar-primary" : "",
                        )}
                      />
                      <span>{label}</span>
                    </Link>
                  );
                })}
                {section.label === "תפעול" && <ToolsNav onNavigate={onClose} />}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-sidebar-border px-2 py-3">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 px-2 py-1.5 text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-150"
          >
            <LogOut className="size-4 shrink-0" />
            <span>יציאה</span>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
