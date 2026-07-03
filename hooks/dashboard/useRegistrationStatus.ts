import { useMemo, useState, type MouseEvent } from "react";
import { useCourseActionsMenu } from "@/hooks/useCourseActionsMenu";
import { useAddCourse } from "@/hooks/courses/useAddCourse";
import { useAddCoach } from "@/hooks/coaches/useAddCoach";
import { usePossibleEnrollments } from "@/hooks/courses/usePossibleEnrollments";
import { useArchiveConfirm } from "@/hooks/useArchiveConfirm";
import { useCollection } from "@/lib/firebase/useCollection";
import { archiveCourse } from "@/lib/firebase/data/courses";
import { courseFormValuesFor } from "@/lib/course-details";
import { coaches } from "@/lib/coaches-data";
import { coachFormValuesFor } from "@/lib/coach-details";
import type { CourseAction } from "@/lib/course-actions";
import type { Course } from "@/lib/courses-data";

export interface RegistrationClass {
  name: string;
  enrolled: number;
  capacity: number;
}

export function useRegistrationStatus() {
  const menu = useCourseActionsMenu();
  const courseEdit = useAddCourse();
  const coachEdit = useAddCoach();
  const enrollments = usePossibleEnrollments();
  const archive = useArchiveConfirm();
  const [activeName, setActiveName] = useState<string | null>(null);
  // The course pending archive once the confirm dialog is accepted.
  const [archiveId, setArchiveId] = useState<string | null>(null);

  // The registration bars show the live enrolment of every active course.
  const { data } = useCollection<Course>("courses");
  const classes = useMemo<RegistrationClass[]>(
    () =>
      data
        .filter((c) => c.status === "פעיל")
        .map((c) => ({
          name: c.name,
          enrolled: c.enrolled,
          capacity: c.capacity,
        })),
    [data],
  );

  // Each dropdown action opens the same modal the courses table uses.
  function onSelectAction(action: CourseAction) {
    const course = data.find((c) => c.name === activeName);
    if (action.id === "details" && course) {
      courseEdit.openForEdit(courseFormValuesFor(course));
    } else if (action.id === "coach" && course) {
      const coach = coaches.find((c) => c.name === course.coach);
      if (coach) coachEdit.openForEdit(coachFormValuesFor(coach));
    } else if (action.id === "enrollments" && course) {
      enrollments.openFor(course);
    } else if (action.id === "archive" && course) {
      setArchiveId(course.id);
      archive.openFor(1);
    }
    menu.onSelect(action);
  }

  function confirmArchive() {
    if (archiveId) void archiveCourse(archiveId);
    setArchiveId(null);
    archive.cancel();
  }

  function handleRowClick(name: string, e: MouseEvent) {
    setActiveName(name);
    menu.openAt(e);
  }

  function handleMenuOpenChange(next: boolean) {
    menu.setOpen(next);
    if (!next) setActiveName(null);
  }

  return {
    classes,
    menuOpen: menu.open,
    virtualRef: menu.virtualRef,
    onSelectAction,
    courseEdit,
    coachEdit,
    enrollments,
    archive,
    confirmArchive,
    activeName,
    handleRowClick,
    handleMenuOpenChange,
  };
}
