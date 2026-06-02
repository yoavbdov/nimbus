"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatDayRange } from "@/lib/calendar";
import { MonthNav } from "@/components/schedule/MonthNav";
import { CategoryFilter } from "@/components/schedule/CategoryFilter";
import { ScheduleFilters } from "@/components/schedule/ScheduleFilters";
import { CalendarGrid } from "@/components/schedule/CalendarGrid";
import { TimeGridView } from "@/components/schedule/TimeGridView";
import { useScheduleCalendar } from "@/hooks/schedule/useScheduleCalendar";

export function SchedulePanel() {
  const calendar = useScheduleCalendar();

  return (
    <Card className="tint-indigo glass shadow-depth-xl border-0 ring-0 rounded-3xl gap-0 py-0 overflow-hidden">
      <div className="h-1 tint-bar" />
      <CardContent className="p-6 space-y-5">
        <div className="grid grid-cols-3 items-center gap-4">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight tint-text leading-none">
            לוח זמנים
          </h1>

          {/* Centered selected-range label. */}
          <p className="num text-center text-lg md:text-xl font-bold tracking-tight tint-text">
            {formatDayRange(calendar.rangeStart, calendar.rangeEnd)}
          </p>

          <p className="num text-end text-xs text-muted-foreground/80">
            {calendar.totalEvents} מפגשים · {calendar.rangeLength} ימים
          </p>
        </div>

        <Separator className="bg-foreground/8" />

        <div className="grid gap-5 xl:grid-cols-[12.5rem_minmax(0,1fr)]">
          {/* Picker column: month nav, calendar, then category filters below it
              so the time-grid column can use the full height. Nudged toward the
              right border. */}
          <div className="-ms-4 space-y-3">
            <div className="space-y-2">
              <MonthNav
                viewMonth={calendar.viewMonth}
                onPrevMonth={calendar.goToPrevMonth}
                onNextMonth={calendar.goToNextMonth}
                onToday={calendar.goToToday}
              />
              <CalendarGrid
                monthGrid={calendar.monthGrid}
                viewMonth={calendar.viewMonth}
                today={calendar.today}
                activeRange={calendar.activeRange}
                eventsByDay={calendar.eventsByDay}
                isSelected={calendar.isSelected}
                onSelectStart={calendar.beginSelection}
                onSelectEnter={calendar.extendSelection}
              />
            </div>
            <CategoryFilter
              categories={calendar.categories}
              hiddenCategories={calendar.hiddenCategories}
              onToggleCategory={calendar.toggleCategory}
            />
            <ScheduleFilters
              facets={calendar.facets}
              facetOptions={calendar.facetOptions}
              facetFilters={calendar.facetFilters}
              onToggleValue={calendar.toggleFacetValue}
              onClearFacet={calendar.clearFacet}
              onClearAll={calendar.clearAllFacets}
              activeCount={calendar.activeFacetCount}
            />
          </div>

          {/* View column: the time-grid now owns the full column height. */}
          <div>
            <TimeGridView days={calendar.selectedDays} today={calendar.today} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
