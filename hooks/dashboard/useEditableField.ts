import { useState } from "react";

/** Manages the edit/draft lifecycle for an inline-editable text field. */
export function useEditableField(value: string, onCommit: (val: string) => void) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  function startEditing() {
    setDraft(value);
    setEditing(true);
  }

  function commit() {
    onCommit(draft.trim() || value);
    setEditing(false);
  }

  function cancel() {
    setDraft(value);
    setEditing(false);
  }

  return { editing, draft, setDraft, startEditing, commit, cancel };
}
