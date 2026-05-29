"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CoachesActions } from "@/components/coaches/CoachesActions";
import { FilterBar } from "@/components/coaches/filters/FilterBar";
import { CoachesTable } from "@/components/coaches/CoachesTable";
import { useCoachesPanel } from "@/hooks/coaches/useCoachesPanel";
import { coaches as allCoaches } from "@/lib/coaches-data";

export function CoachesPanel() {
  const {
    search,
    setSearch,
    filters,
    addFilter,
    updateFilter,
    removeFilter,
    clearAll,
    filtered,
    filterKey,
  } = useCoachesPanel();

  return (
    <Card className="tint-indigo glass shadow-depth-xl border-0 ring-0 rounded-3xl gap-0 py-0 overflow-hidden">
      <div className="h-1 tint-bar" />
      <CardContent className="p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1.5">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight tint-text leading-none">
              ניהול מדריכים
            </h1>
            <p className="text-xs text-muted-foreground/80 num">
              {filtered.length} מתוך {allCoaches.length} מדריכים
            </p>
          </div>
          <CoachesActions />
        </div>

        <Separator className="bg-foreground/8" />

        <FilterBar
          search={search}
          filters={filters}
          onSearchChange={setSearch}
          onAdd={addFilter}
          onUpdate={updateFilter}
          onRemove={removeFilter}
          onClearAll={clearAll}
        />

        <div className="neu-inset rounded-2xl p-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={filterKey}
              initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -4, filter: "blur(2px)" }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <CoachesTable coaches={filtered} />
            </motion.div>
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}
