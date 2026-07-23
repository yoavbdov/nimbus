import type { CoachRecord } from "@/lib/coaches-data";
import type { CoachFormValues } from "@/lib/coach-form";

/**
 * Build the "edit coach" form values from a roster entry — every field comes
 * from the stored record. A coach saved before the email field existed shows an
 * empty box, rather than a fabricated address that would be written back as
 * real data on the next save.
 */
export function coachFormValuesFor(coach: CoachRecord): CoachFormValues {
  const [firstName, ...rest] = coach.name.trim().split(" ");
  const lastName = rest.join(" ");

  return {
    id: coach.id,
    firstName,
    lastName,
    phone: coach.phone,
    email: coach.email ?? "",
    notes: coach.notes ?? "",
  };
}

/**
 * The editable fields from the "edit coach" form, shaped for Firestore. The
 * modal owns only the personal fields; it leaves club/competition assignments
 * (which drive the derived status) to their own modals.
 */
export function coachEditPatch(values: CoachFormValues): Partial<CoachRecord> {
  return {
    name: `${values.firstName.trim()} ${values.lastName.trim()}`.trim(),
    phone: values.phone,
    email: values.email,
    notes: values.notes,
  };
}

/**
 * Build a full new-coach record for Firestore from the form values. Course /
 * tournament associations are NOT stored on the coach — a new coach simply has
 * no `relations` yet.
 */
export function coachRecordFromForm(
  values: CoachFormValues,
): Omit<CoachRecord, "id"> {
  return coachEditPatch(values) as Omit<CoachRecord, "id">;
}
