import type { CoachRecord } from "@/lib/coaches-data";
import type { CoachFormValues } from "@/lib/coach-form";

/** A small, stable string hash (djb2-ish) with a seed for independent draws. */
function hash(str: string, seed: number): number {
  let h = seed;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/**
 * Build the "edit coach" form values from a roster entry. The email is read
 * from the stored record; for older coaches saved before the field existed we
 * fall back to a stable hash-derived address so the field is never empty.
 */
export function coachFormValuesFor(coach: CoachRecord): CoachFormValues {
  const [firstName, ...rest] = coach.name.trim().split(" ");
  const lastName = rest.join(" ");
  const h = hash(coach.name, 5381);

  return {
    id: coach.id,
    firstName,
    lastName,
    phone: coach.phone,
    email: coach.email ?? `coach${1000 + (h % 9000)}@gmail.com`,
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
