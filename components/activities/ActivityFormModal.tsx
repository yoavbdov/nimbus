"use client";

import { AddActivityModal } from "@/components/activities/AddActivityModal";
import type { useAddActivity } from "@/hooks/activities/useAddActivity";

/**
 * Connects a {@link useAddActivity} instance to {@link AddActivityModal} so the
 * long prop list lives in one place and both the "add" (panel) and "edit"
 * (row action) flows can reuse the same modal.
 */
export function ActivityFormModal({
  addActivity,
}: {
  addActivity: ReturnType<typeof useAddActivity>;
}) {
  return (
    <AddActivityModal
      open={addActivity.open}
      mode={addActivity.mode}
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
      availableStudents={addActivity.pickerStudents}
      onRemoveStudent={addActivity.removeStudent}
      studentPickerOpen={addActivity.studentPickerOpen}
      onStudentPickerOpenChange={addActivity.setStudentPickerOpen}
      onOpenStudentPicker={addActivity.openStudentPicker}
      sourceChoiceOpen={addActivity.sourceChoiceOpen}
      onSourceChoiceOpenChange={addActivity.setSourceChoiceOpen}
      rosterChoiceOpen={addActivity.rosterChoiceOpen}
      onRosterChoiceOpenChange={addActivity.setRosterChoiceOpen}
      studentRosters={addActivity.studentRosters}
      onChooseStudentsFromAll={addActivity.chooseStudentsFromAll}
      onChooseStudentsFromRoster={addActivity.chooseStudentsFromRoster}
      onBackToSourceChoice={addActivity.backToSourceChoice}
      onSelectStudentRoster={addActivity.selectStudentRoster}
      pickerDisabledIds={addActivity.pickerDisabledIds}
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
  );
}
