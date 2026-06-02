"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileSidebar } from "@/components/layout/MobileSidebar";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { useDisclosure } from "@/hooks/useDisclosure";

interface PageShellProps {
  title: string;
  children: React.ReactNode;
  /** When true the content fills the available width instead of capping at max-w-7xl. */
  wide?: boolean;
}

export function PageShell({ title: _title, children, wide = false }: PageShellProps) {
  const { open: mobileOpen, show: openMobile, close: closeMobile } = useDisclosure();

  return (
    <div className="min-h-screen flex bg-background">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col lg:ms-56 min-w-0">
        <main className="flex-1 px-5 py-6 bg-ambient">
          <div className={wide ? "w-full" : "max-w-7xl mx-auto"}>{children}</div>
        </main>
      </div>

      <div className="fixed top-3 inset-e-4 z-30 flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden size-9 rounded-xl neu-raised-xs neu-interactive"
          onClick={openMobile}
          aria-label="פתח תפריט"
        >
          <Menu className="size-4" />
        </Button>
        <div className="neu-raised-xs neu-interactive rounded-xl">
          <ThemeToggle />
        </div>
      </div>

      <MobileSidebar open={mobileOpen} onClose={closeMobile} />
    </div>
  );
}
