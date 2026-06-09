"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ActivitiesActions } from "@/components/activities/ActivitiesActions";
import { FilterBar } from "@/components/activities/filters/FilterBar";
import { ActivitiesTable } from "@/components/activities/ActivitiesTable";
import { AddActivityModal } from "@/components/activities/AddActivityModal";
import { useActivitiesPanel } from "@/hooks/activities/useActivitiesPanel";
import { useAddActivity } from "@/hooks/activities/useAddActivity";
import { activities as allActivities } from "@/lib/activities-data";

export function ActivitiesPanel() {
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
    filterKey,
  } = useActivitiesPanel();

  const addActivity = useAddActivity();

  return (
    <Card className="tint-indigo glass shadow-depth-xl border-0 ring-0 rounded-3xl gap-0 py-0 overflow-hidden">
      <div className="h-1 tint-bar" />
      <CardContent className="p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1.5">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight tint-text leading-none">
              ניהול חוגים
            </h1>
            <p className="text-xs text-muted-foreground/80 num">
              {filtered.length} מתוך {allActivities.length} חוגים
            </p>
          </div>
          <ActivitiesActions onAddActivity={addActivity.openModal} />
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
              <ActivitiesTable activities={filtered} />
            </motion.div>
          </AnimatePresence>
        </div>
      </CardContent>

      <AddActivityModal
        open={addActivity.open}
        onOpenChange={addActivity.handleOpenChange}
        tab={addActivity.tab}
        onTabChange={addActivity.setTab}
        values={addActivity.values}
        onFieldChange={addActivity.updateField}
        valid={addActivity.valid}
        onConfirm={addActivity.confirm}
        onAddMeeting={addActivity.addMeeting}
        onUpdateMeeting={addActivity.updateMeeting}
        onRemoveMeeting={addActivity.removeMeeting}
        students={addActivity.students}
        availableStudents={addActivity.availableStudents}
        onRemoveStudent={addActivity.removeStudent}
        studentPickerOpen={addActivity.studentPickerOpen}
        onStudentPickerOpenChange={addActivity.setStudentPickerOpen}
        onOpenStudentPicker={addActivity.openStudentPicker}
        checkedStudentIds={addActivity.checkedStudentIds}
        onToggleCheckedStudent={addActivity.toggleCheckedStudent}
        onConfirmStudents={addActivity.confirmStudents}
        onAddEquipment={addActivity.addEquipmentLine}
        onUpdateEquipment={addActivity.updateEquipmentLine}
        onRemoveEquipment={addActivity.removeEquipmentLine}
        coachWarning={addActivity.coachWarning}
        capacityWarning={addActivity.capacityWarning}
        criteriaMismatch={addActivity.criteriaMismatch}
      />
    </Card>
  );
}
