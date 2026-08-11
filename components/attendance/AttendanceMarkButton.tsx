import { Check, X, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AttendanceMark } from "@/lib/attendance-data";

const config: Record<
  AttendanceMark,
  { label: string; icon: React.ElementType; className: string }
> = {
  present: {
    label: "נוכח",
    icon: Check,
    className:
      "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/30 hover:bg-emerald-500/25",
  },
  absent: {
    label: "לא נוכח",
    icon: X,
    className:
      "bg-rose-500/15 text-rose-600 dark:text-rose-400 ring-1 ring-rose-500/30 hover:bg-rose-500/25",
  },
  unset: {
    label: "לא הוזן",
    icon: Minus,
    className:
      "bg-transparent text-foreground/40 ring-1 ring-foreground/12 hover:bg-foreground/5",
  },
};

interface AttendanceMarkButtonProps {
  mark: AttendanceMark;
  disabled?: boolean;
  onClick: () => void;
}

/** Tri-state click target: לא הוזן → נוכח → לא נוכח → לא הוזן. */
export function AttendanceMarkButton({
  mark,
  disabled = false,
  onClick,
}: AttendanceMarkButtonProps) {
  const { label, icon: Icon, className } = config[mark];
  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "h-8 w-28 mx-auto gap-1.5 rounded-xl text-xs font-medium transition-all duration-150 hover:scale-105 active:scale-95",
        disabled && "pointer-events-none opacity-70 hover:scale-100",
        className,
      )}
    >
      <Icon className="size-4" />
      {label}
    </Button>
  );
}
