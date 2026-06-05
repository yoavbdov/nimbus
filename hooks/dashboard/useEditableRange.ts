import { useState } from "react";

/** Manages the edit/draft lifecycle for an inline-editable numeric range. */
export function useEditableRange(
  min: number,
  max: number,
  onCommit: (range: { min: number; max: number }) => void,
) {
  const [editing, setEditing] = useState(false);
  const [minDraft, setMinDraft] = useState(String(min));
  const [maxDraft, setMaxDraft] = useState(String(max));

  function startEditing() {
    setMinDraft(String(min));
    setMaxDraft(String(max));
    setEditing(true);
  }

  function commit() {
    const nextMin = Number(minDraft);
    const nextMax = Number(maxDraft);
    onCommit({
      min: Number.isFinite(nextMin) ? nextMin : min,
      max: Number.isFinite(nextMax) ? nextMax : max,
    });
    setEditing(false);
  }

  function cancel() {
    setEditing(false);
  }

  return { editing, minDraft, setMinDraft, maxDraft, setMaxDraft, startEditing, commit, cancel };
}
