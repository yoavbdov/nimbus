"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { MobileSidebar } from "@/components/layout/MobileSidebar";
import { useState } from "react";

interface TopBarProps {
  title: string;
}

export function TopBar({ title }: TopBarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 h-14 flex items-center px-4 sm:px-6 gap-3 bg-background border-b border-border">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="פתח תפריט"
        >
          <Menu className="size-5" />
        </Button>

        <h1 className="text-lg sm:text-xl font-semibold text-foreground flex-1">
          {title}
        </h1>

        <ThemeToggle />
      </header>

      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
