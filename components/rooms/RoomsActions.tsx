import { CalendarCheck2, DoorOpen, FileDown, FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ActionButtonProps {
  icon: React.ElementType;
  label: string;
  variant?: "default" | "ghost";
  onClick?: () => void;
  iconClassName?: string;
}

function ActionButton({ icon: Icon, label, variant = "ghost", onClick, iconClassName }: ActionButtonProps) {
  return (
    <Button
      type="button"
      onClick={onClick}
      variant={variant}
      className={cn(
        "group/btn relative overflow-hidden tint-indigo",
        "h-9 rounded-xl gap-1.5 px-3.5 text-xs font-medium neu-raised-xs neu-interactive",
        variant === "default" && "bg-transparent text-foreground hover:bg-transparent",
      )}
    >
      <span className="absolute inset-x-0 top-0 h-1 tint-bar origin-center scale-x-0 group-hover/btn:scale-x-100 transition-transform duration-700 ease-out" />
      <Icon className={cn("size-4", iconClassName)} />
      {label}
    </Button>
  );
}

interface RoomsActionsProps {
  onAddRoom: () => void;
  onCheckAvailability: () => void;
}

export function RoomsActions({ onAddRoom, onCheckAvailability }: RoomsActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <ActionButton icon={DoorOpen} label="הוסף חדר" variant="default" onClick={onAddRoom} />
      <ActionButton icon={CalendarCheck2} label="בדוק זמינות" onClick={onCheckAvailability} />
      <ActionButton icon={FileDown} label="ייצוא לאקסל" iconClassName="text-[#217346]" />
      <ActionButton icon={FileUp} label="משיכה מאקסל" iconClassName="text-[#217346]" />
    </div>
  );
}
