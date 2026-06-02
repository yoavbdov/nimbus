"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { MobileSidebar } from "@/components/layout/MobileSidebar";
import { useDisclosure } from "@/hooks/useDisclosure";

interface TopBarProps {
  title: string;
}

export function TopBar({ title }: TopBarProps) {
  const { open: mobileOpen, show: openMobile, close: closeMobile } = useDisclosure();

  return (
    <>
      <header className="sticky top-0 z-30 h-12 flex items-center px-4 sm:px-5 gap-3 glass-sm border-0 ring-0 rounded-none shadow-none">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden size-7"
          onClick={openMobile}
          aria-label="פתח תפריט"
        >
          <Menu className="size-4" />
        </Button>

        <h1 className="text-sm font-medium text-foreground flex-1">{title}</h1>

        <Separator orientation="vertical" className="h-4 opacity-40 hidden sm:block" />

        <ThemeToggle />
      </header>

      <MobileSidebar open={mobileOpen} onClose={closeMobile} />
    </>
  );
}
