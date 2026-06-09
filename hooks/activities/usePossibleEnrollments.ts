import { useCallback, useMemo, useState } from "react";
import {
  possibleEnrollments,
  type EnrollmentCandidate,
} from "@/lib/possible-enrollments";
import type { Activity } from "@/lib/activities-data";

/** Drives the "possible enrollments" dialog: which activity it shows and its candidates. */
export function usePossibleEnrollments() {
  const [activity, setActivity] = useState<Activity | null>(null);
  const [open, setOpen] = useState(false);

  const openFor = useCallback((next: Activity) => {
    setActivity(next);
    setOpen(true);
  }, []);

  const candidates: EnrollmentCandidate[] = useMemo(
    () => (activity ? possibleEnrollments(activity) : []),
    [activity],
  );

  return { open, onOpenChange: setOpen, openFor, activity, candidates };
}
