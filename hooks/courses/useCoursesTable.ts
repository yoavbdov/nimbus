import { useState, type MouseEvent } from "react";
import { useCoursesSort } from "@/hooks/courses/useCoursesSort";
import { useCourseActionsMenu } from "@/hooks/useCourseActionsMenu";
import { usePossibleEnrollments } from "@/hooks/courses/usePossibleEnrollments";
import { useAddCoach } from "@/hooks/coaches/useAddCoach";
import { useAddCourse } from "@/hooks/courses/useAddCourse";
import { useArchiveConfirm } from "@/hooks/useArchiveConfirm";
import { coaches } from "@/lib/coaches-data";
import { coachFormValuesFor } from "@/lib/coach-details";
import { courseFormValuesFor } from "@/lib/course-details";
import type { CourseAction } from "@/lib/course-actions";
import type { Course } from "@/lib/courses-data";

export function useCoursesTable(courses: Course[]) {
  const sort = useCoursesSort(courses);
  const menu = useCourseActionsMenu();
  const enrollments = usePossibleEnrollments();
  const coachEdit = useAddCoach();
  const courseEdit = useAddCourse();
  const archive = useArchiveConfirm();
  const [activeId, setActiveId] = useState<string | null>(null);

  function handleRowClick(id: string, e: MouseEvent) {
    setActiveId(id);
    menu.openAt(e);
  }

  function handleMenuOpenChange(next: boolean) {
    menu.setOpen(next);
    if (!next) setActiveId(null);
  }

  function handleRowAction(action: CourseAction) {
    const course = courses.find((a) => a.id === activeId);
    if (action.id === "enrollments") {
      if (course) enrollments.openFor(course);
    } else if (action.id === "coach") {
      const coach = course && coaches.find((c) => c.name === course.coach);
      if (coach) coachEdit.openForEdit(coachFormValuesFor(coach));
    } else if (action.id === "details") {
      if (course) courseEdit.openForEdit(courseFormValuesFor(course));
    } else if (action.id === "archive") {
      archive.openFor(1);
    }
    menu.onSelect(action);
  }

  function handleSelectAction(action: CourseAction, selectedIds: string[]) {
    if (action.id === "archive") archive.openFor(selectedIds.length);
    menu.onSelect(action);
  }

  return {
    ...sort,
    menuOpen: menu.open,
    virtualRef: menu.virtualRef,
    onSelectAction: handleSelectAction,
    onRowAction: handleRowAction,
    archive,
    enrollments,
    coachEdit,
    courseEdit,
    activeId,
    handleRowClick,
    handleMenuOpenChange,
  };
}
