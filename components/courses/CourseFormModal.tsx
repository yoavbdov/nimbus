"use client";

import { AddCourseModal } from "@/components/courses/AddCourseModal";
import type { useAddCourse } from "@/hooks/courses/useAddCourse";

/**
 * Connects a {@link useAddCourse} instance to {@link AddCourseModal} so the
 * long prop list lives in one place and both the "add" (panel) and "edit"
 * (row action) flows can reuse the same modal.
 */
export function CourseFormModal({
  addCourse,
}: {
  addCourse: ReturnType<typeof useAddCourse>;
}) {
  return (
    <AddCourseModal
      open={addCourse.open}
      mode={addCourse.mode}
      onOpenChange={addCourse.handleOpenChange}
      confirmingClose={addCourse.confirmingClose}
      closeNudge={addCourse.closeNudge}
      onConfirmClose={addCourse.confirmClose}
      onCancelClose={addCourse.cancelClose}
      tab={addCourse.tab}
      onTabChange={addCourse.setTab}
      values={addCourse.values}
      onFieldChange={addCourse.updateField}
      valid={addCourse.valid}
      onConfirm={addCourse.confirm}
      onAddMeeting={addCourse.addMeeting}
      onUpdateMeeting={addCourse.updateMeeting}
      onRemoveMeeting={addCourse.removeMeeting}
      students={addCourse.students}
      availableStudents={addCourse.pickerStudents}
      onRemoveStudent={addCourse.removeStudent}
      studentPickerOpen={addCourse.studentPickerOpen}
      onStudentPickerOpenChange={addCourse.setStudentPickerOpen}
      onOpenStudentPicker={addCourse.openStudentPicker}
      sourceChoiceOpen={addCourse.sourceChoiceOpen}
      onSourceChoiceOpenChange={addCourse.setSourceChoiceOpen}
      rosterChoiceOpen={addCourse.rosterChoiceOpen}
      onRosterChoiceOpenChange={addCourse.setRosterChoiceOpen}
      studentRosters={addCourse.studentRosters}
      onChooseStudentsFromAll={addCourse.chooseStudentsFromAll}
      onChooseStudentsFromRoster={addCourse.chooseStudentsFromRoster}
      onBackToSourceChoice={addCourse.backToSourceChoice}
      onSelectStudentRoster={addCourse.selectStudentRoster}
      pickerDisabledIds={addCourse.pickerDisabledIds}
      checkedStudentIds={addCourse.checkedStudentIds}
      onToggleCheckedStudent={addCourse.toggleCheckedStudent}
      onConfirmStudents={addCourse.confirmStudents}
      onAddEquipment={addCourse.addEquipmentLine}
      onUpdateEquipment={addCourse.updateEquipmentLine}
      onRemoveEquipment={addCourse.removeEquipmentLine}
      coachWarning={addCourse.coachWarning}
      capacityWarning={addCourse.capacityWarning}
      criteriaMismatch={addCourse.criteriaMismatch}
    />
  );
}
