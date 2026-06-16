"use client";

import { useRef } from "react";

/**
 * Inserts an emoji at the textarea's caret position (or replaces the current
 * selection), then restores focus and the caret. Keeps the DOM/caret handling
 * out of the presentational components.
 */
export function useEmojiInsert(
  value: string,
  onChange: (next: string) => void,
) {
  const ref = useRef<HTMLTextAreaElement | null>(null);

  const insert = (emoji: string) => {
    const el = ref.current;
    if (!el) {
      onChange(value + emoji);
      return;
    }
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    onChange(value.slice(0, start) + emoji + value.slice(end));
    requestAnimationFrame(() => {
      const pos = start + emoji.length;
      el.focus();
      el.setSelectionRange(pos, pos);
    });
  };

  return { ref, insert };
}
