import { useState } from "react";
import {
  EMPTY_SUPPORT_FORM,
  isSupportFormValid,
  type SupportFormValues,
} from "@/lib/support-form";

/**
 * Holds the state for the "open a support ticket" form. Submitting is a no-op
 * for now — the form simply resets — but every field and its validation live
 * here so the view stays presentational.
 */
export function useSupportTicket() {
  const [values, setValues] = useState<SupportFormValues>(EMPTY_SUPPORT_FORM);

  function updateField<K extends keyof SupportFormValues>(
    field: K,
    value: SupportFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  function reset() {
    setValues(EMPTY_SUPPORT_FORM);
  }

  function submit() {
    // Submitting is intentionally a no-op for now.
    reset();
  }

  return {
    values,
    updateField,
    reset,
    submit,
    valid: isSupportFormValid(values),
  };
}
