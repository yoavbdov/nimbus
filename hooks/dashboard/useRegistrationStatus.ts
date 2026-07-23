import { useMemo, useState, type MouseEvent } from "react";
import { useCourseActionsMenu } from "@/hooks/useCourseActionsMenu";
import { useAddCourse } from "@/hooks/courses/useAddCourse";
import { useAddCoach } from "@/hooks/coaches/useAddCoach";
import { usePossibleEnrollments } from "@/hooks/courses/usePossibleEnrollments";
import { useArchiveConfirm } from "@/hooks/useArchiveConfirm";
import { useCollection } from "@/lib/firebase/useCollection";
import { useCoursesData } from "@/hooks/courses/useCoursesData";
import { archiveCourse } from "@/lib/firebase/data/courses";
import { courseFormValuesFromLive } from "@/lib/course-details";
import type { SessionDoc } from "@/lib/sessions-data";
import type { RelationDoc } from "@/lib/relations-data";
import { coachFormValuesFor } from "@/lib/coach-details";
import type { CoachRecord } from "@/lib/coaches-data";
import type { CourseAction } from "@/lib/course-actions";
import { UNLIMITED_CAPACITY } from "@/lib/courses-data";

export interface RegistrationClass {
  name: string;
  enrolled: number;
  /** Always a number to chart against — unlimited courses fall back to 99. */
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

  // The bars read the SAME derived courses the courses table does (live enrolled
  // count, status derived from the sessions), so the two can never disagree.
  const { courses: data } = useCoursesData();
  // The edit modal is prefilled from the stored sessions / relations, exactly as
  // on the courses page — never from values re-derived here.
  const { data: sessions } = useCollection<SessionDoc>("sessions");
  const { data: relations } = useCollection<RelationDoc>("relations");
  // Coaches live too, so the note edited here round-trips the persisted doc.
  const { data: coaches } = useCollection<CoachRecord>("coaches");
  const classes = useMemo<RegistrationClass[]>(
    () =>
      data
        .filter((c) => c.status === "פעיל")
        .map((c) => ({
          name: c.name,
          enrolled: c.enrolled,
          // A course with no capacity is unlimited, but the bar still needs a
          // ceiling to draw a share of — 99 stands in for "no limit".
          capacity: c.capacity || UNLIMITED_CAPACITY,
        })),
    [data],
  );

  // Each dropdown action opens the same modal the courses table uses.
  function onSelectAction(action: CourseAction) {
    const course = data.find((c) => c.name === activeName);
    if (action.id === "details" && course) {
      courseEdit.openForEdit(
        courseFormValuesFromLive(course, sessions, relations),
      );
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
