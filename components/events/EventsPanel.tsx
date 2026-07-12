"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { EventsActions } from "@/components/events/EventsActions";
import { FilterBar } from "@/components/events/filters/FilterBar";
import { EventsTable } from "@/components/events/EventsTable";
import { EventFormModal } from "@/components/events/EventFormModal";
import { useEventsPanel } from "@/hooks/events/useEventsPanel";
import { useAddEvent } from "@/hooks/events/useAddEvent";

export function EventsPanel() {
  const {
    search,
    setSearch,
    filters,
    addFilter,
    updateFilter,
    removeFilter,
    todayOnly,
    toggleToday,
    clearAll,
    filtered,
    total,
    filterKey,
    filterOptions,
  } = useEventsPanel();

  const addEvent = useAddEvent();

  return (
    <CardContent className="p-6 space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1.5">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight tint-text leading-none">
            ניהול אירועים
          </h1>
          <p className="text-xs text-muted-foreground/80 num">
            {filtered.length} מתוך {total} אירועים
          </p>
        </div>
        <EventsActions onAddEvent={addEvent.openModal} />
      </div>

      <Separator className="bg-foreground/8" />

      <FilterBar
        search={search}
        filters={filters}
        todayOnly={todayOnly}
        onSearchChange={setSearch}
        onAdd={addFilter}
        onUpdate={updateFilter}
        onRemove={removeFilter}
        onToggleToday={toggleToday}
        onClearAll={clearAll}
        options={filterOptions}
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
            <EventsTable events={filtered} />
          </motion.div>
        </AnimatePresence>
      </div>

      <EventFormModal addEvent={addEvent} />
    </CardContent>
  );
}
