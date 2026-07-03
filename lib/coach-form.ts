/** Shape of the "add coach" form. Empty strings = not filled yet. */
export interface CoachFormValues {
  /** Set when editing an existing coach; drives the Firestore save. */
  id?: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  notes: string;
}

export const EMPTY_COACH_FORM: CoachFormValues = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  notes: "",
};

/** First and last name are the starred fields required to submit. */
export function isCoachFormValid(values: CoachFormValues): boolean {
  return values.firstName.trim() !== "" && values.lastName.trim() !== "";
}
