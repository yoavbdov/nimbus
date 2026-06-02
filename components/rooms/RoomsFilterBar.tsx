"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface RoomsFilterBarProps {
  search: string;
  placeholder: string;
  onSearchChange: (v: string) => void;
}

export function RoomsFilterBar({
  search,
  placeholder,
  onSearchChange,
}: RoomsFilterBarProps) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute top-1/2 -translate-y-1/2 inset-s-3 size-4 text-foreground/50 pointer-events-none" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="h-11 ps-10 pe-3 text-sm neu-inset border-0 rounded-2xl"
        />
        {search.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onSearchChange("")}
            className="absolute top-1/2 -translate-y-1/2 inset-e-2 h-7 rounded-lg text-xs gap-1.5 px-2 text-foreground/60 hover:text-foreground"
          >
            <X className="size-3.5" />
            נקה
          </Button>
        )}
      </div>
    </div>
  );
}
