"use client";

import { AlertTriangle } from "lucide-react";
import type { ConflictKind, DraftConflict } from "@/lib/conflicts";

/** "חדר" / "מדריך" / "חדר ומדריך" for the resources that clash. */
function resourceLabel(kinds: ConflictKind[]): string {
  const parts: string[] = [];
  if (kinds.includes("room")) parts.push("חדר");
  if (kinds.includes("coach")) parts.push("מדריך");
  return parts.join(" ו");
}

/** "2026-07-22" → "22.07.2026". */
function formatIsoDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

/**
 * A non-blocking banner listing the activities this draft would clash with on a
 * room or an instructor. Purely presentational — the clashes are computed by
 * the modal's hook. Renders nothing when there are none.
 */
export function ConflictWarning({ conflicts }: { conflicts: DraftConflict[] }) {
  if (conflicts.length === 0) return null;

  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm">
      <p className="flex items-center gap-1.5 font-medium text-destructive">
        <AlertTriangle className="size-4 shrink-0" />
        זוהו קונפליקטים בלוח הזמנים
      </p>
      <ul className="mt-1.5 space-y-1.5 text-destructive/90">
        {conflicts.map((conflict) => (
          <li key={conflict.parentId}>
            <span>
              התנגשות עם <span className="font-medium">{conflict.title}</span> על{" "}
              {resourceLabel(conflict.kinds)}
            </span>
            {conflict.next && (
              <span className="block text-xs text-destructive/75">
                הקרובה: {conflict.next.day}, {formatIsoDate(conflict.next.date)}
                {" · "}
                <span dir="ltr" className="num">
                  {conflict.next.start}–{conflict.next.end}
                </span>
                {conflict.recurring && ` · חוזר (${conflict.count} מפגשים)`}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
