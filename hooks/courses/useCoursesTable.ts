import { useState, type MouseEvent } from "react";
import { useCoursesSort } from "@/hooks/courses/useCoursesSort";
import { useCourseActionsMenu } from "@/hooks/useCourseActionsMenu";
import { usePossibleEnrollments } from "@/hooks/courses/usePossibleEnrollments";
import { useAddCoach } from "@/hooks/coaches/useAddCoach";
import { useAddCourse } from "@/hooks/courses/useAddCourse";
import { useDeleteCourse } from "@/hooks/courses/useDeleteCourse";
import { archiveCourse } from "@/lib/firebase/data/courses";
import { useArchiveConfirm } from "@/hooks/useArchiveConfirm";
import { useCollection } from "@/lib/firebase/useCollection";
import { coaches } from "@/lib/coaches-data";
import { coachFormValuesFor } from "@/lib/coach-details";
import { courseFormValuesFromLive } from "@/lib/course-details";
import type { CourseAction } from "@/lib/course-actions";
import type { Course } from "@/lib/courses-data";
import type { SessionDoc } from "@/lib/sessions-data";
import type { RelationDoc } from "@/lib/relations-data";

export function useCoursesTable(courses: Course[]) {
  const sort = useCoursesSort(courses);
  const menu = useCourseActionsMenu();
  const enrollments = usePossibleEnrollments();
  const coachEdit = useAddCoach();
  const courseEdit = useAddCourse();
  const deleteCourse = useDeleteCourse();
  const archive = useArchiveConfirm();
  // Read live so opening "פרטי חוג" prefills meetings/students/equipment from
  // the real sessions + relations, not the legacy mock.
  const { data: sessions } = useCollection<SessionDoc>("sessions");
  const { data: relations } = useCollection<RelationDoc>("relations");
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
      if (course) {
        courseEdit.openForEdit(
          courseFormValuesFromLive(course, sessions, relations),
        );
      }
    } else if (action.id === "archive") {
      if (course)
        archive.openFor(1, {
          names: [course.name],
          onConfirm: () => void archiveCourse(course.id),
        });
    } else if (action.id === "delete") {
      if (course) deleteCourse.openFor([{ id: course.id, name: course.name }]);
    }
    menu.onSelect(action);
    setActiveId(null);
  }

  function handleSelectAction(action: CourseAction, selectedIds: string[]) {
    if (action.id === "archive")
      archive.openFor(selectedIds.length, {
        names: selectedIds.map(
          (id) => courses.find((c) => c.id === id)?.name ?? id,
        ),
        onConfirm: () => {
          for (const id of selectedIds) void archiveCourse(id);
        },
      });
    else if (action.id === "delete") {
      deleteCourse.openFor(
        selectedIds.map((id) => ({
          id,
          name: courses.find((c) => c.id === id)?.name ?? id,
        })),
      );
    }
    menu.onSelect(action);
  }

  return {
    ...sort,
    menuOpen: menu.open,
    virtualRef: menu.virtualRef,
    onSelectAction: handleSelectAction,
    onRowAction: handleRowAction,
    archive,
    deleteCourse,
    enrollments,
    coachEdit,
    courseEdit,
    activeId,
    handleRowClick,
    handleMenuOpenChange,
  };
}
