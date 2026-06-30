import { useCallback, useMemo, useState } from "react";
import {
  possibleEnrollments,
  type EnrollmentCandidate,
} from "@/lib/possible-enrollments";
import type { Course } from "@/lib/courses-data";

/** Drives the "possible enrollments" dialog: which course it shows and its candidates. */
export function usePossibleEnrollments() {
  const [course, setCourse] = useState<Course | null>(null);
  const [open, setOpen] = useState(false);

  const openFor = useCallback((next: Course) => {
    setCourse(next);
    setOpen(true);
  }, []);

  const candidates: EnrollmentCandidate[] = useMemo(
    () => (course ? possibleEnrollments(course) : []),
    [course],
  );

  return { open, onOpenChange: setOpen, openFor, course, candidates };
}
