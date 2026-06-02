"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RoomsActions } from "@/components/rooms/RoomsActions";
import { RoomsFilterBar } from "@/components/rooms/RoomsFilterBar";
import { RoomsTable } from "@/components/rooms/RoomsTable";
import { rooms as allRooms, filterRooms } from "@/lib/rooms-data";

export function RoomsPanel() {
  const [search, setSearch] = useState("");
  const filtered = filterRooms(search);

  return (
    <Card className="tint-indigo glass shadow-depth-xl border-0 ring-0 rounded-3xl gap-0 py-0 overflow-hidden">
      <div className="h-1 tint-bar" />
      <CardContent className="p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1.5">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight tint-text leading-none">
              ניהול חדרים
            </h1>
            <p className="text-xs text-muted-foreground/80 num">
              {filtered.length} מתוך {allRooms.length} חדרים
            </p>
          </div>
          <RoomsActions />
        </div>

        <Separator className="bg-foreground/8" />

        <RoomsFilterBar
          search={search}
          placeholder="חיפוש לפי שם חדר או ציוד…"
          onSearchChange={setSearch}
        />

        <div className="neu-inset rounded-2xl p-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={search}
              initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -4, filter: "blur(2px)" }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <RoomsTable rooms={filtered} />
            </motion.div>
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}
