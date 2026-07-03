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
import {
  formatDayTime,
  todayHebrewDay,
  type Course,
} from "@/lib/courses-data";
import type { CourseAction } from "@/lib/course-actions";

export interface TodaySession {
  id: string;
  time: string;
  type: string;
  name: string;
  location: string;
  enrolled: number;
  capacity: number;
}

export const todayLabel = `יום ${todayHebrewDay()}`;

export function useTodaySessions() {
  const menu = useCourseActionsMenu();
  const courseEdit = useAddCourse();
  const coachEdit = useAddCoach();
  const enrollments = usePossibleEnrollments();
  const archive = useArchiveConfirm();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [archiveId, setArchiveId] = useState<string | null>(null);

  // Only active courses that actually meet on today's weekday.
  const { data } = useCollection<Course>("courses");
  const today = todayHebrewDay();
  const todayCourses = useMemo(
    () => data.filter((c) => c.status === "פעיל" && c.days?.includes(today)),
    [data, today],
  );

  const sessions = useMemo<TodaySession[]>(
    () =>
      todayCourses.map((c) => ({
        id: c.id,
        time: formatDayTime(c.times?.[today]),
        type: "חוג",
        name: c.name,
        location: c.room,
        enrolled: c.enrolled,
        capacity: c.capacity,
      })),
    [todayCourses, today],
  );

  function onSelectAction(action: CourseAction) {
    const course =
      activeIndex === null ? undefined : todayCourses[activeIndex];
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

  function handleRowClick(index: number, e: MouseEvent) {
    setActiveIndex(index);
    menu.openAt(e);
  }

  function handleMenuOpenChange(next: boolean) {
    menu.setOpen(next);
    if (!next) setActiveIndex(null);
  }

  return {
    sessions,
    menuOpen: menu.open,
    virtualRef: menu.virtualRef,
    onSelectAction,
    courseEdit,
    coachEdit,
    enrollments,
    archive,
    confirmArchive,
    activeIndex,
    handleRowClick,
    handleMenuOpenChange,
  };
}
