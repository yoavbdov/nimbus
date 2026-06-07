import { cn } from "@/lib/utils";

type SortDir = "asc" | "desc";

/**
 * Two stacked caret buttons (up above down). The caret matching the active
 * sort direction is highlighted in indigo; the inactive caret stays muted.
 */
export function SortIcon({
  active,
  dir,
}: {
  active: boolean;
  dir: SortDir;
}) {
  const upActive = active && dir === "asc";
  const downActive = active && dir === "desc";
  return (
    <span className="group/sort inline-flex flex-col items-center justify-center leading-none">
      <svg
        viewBox="0 0 10 6"
        className={cn(
          "size-2.5 transition-all",
          upActive
            ? "text-indigo-500 drop-shadow-[0_0_3px_rgba(99,102,241,0.7)]"
            : "text-indigo-500/35 group-hover/sort:text-indigo-500 group-hover/sort:drop-shadow-[0_0_3px_rgba(99,102,241,0.7)]",
        )}
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M5 0 L10 6 L0 6 Z" />
      </svg>
      <svg
        viewBox="0 0 10 6"
        className={cn(
          "size-2.5 transition-all",
          downActive
            ? "text-indigo-500 drop-shadow-[0_0_3px_rgba(99,102,241,0.7)]"
            : "text-indigo-500/35 group-hover/sort:text-indigo-500 group-hover/sort:drop-shadow-[0_0_3px_rgba(99,102,241,0.7)]",
        )}
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M0 0 L10 0 L5 6 Z" />
      </svg>
    </span>
  );
}
