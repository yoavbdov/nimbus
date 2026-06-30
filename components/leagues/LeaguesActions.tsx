import { FileDown, FileUp, Swords } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ActionButtonProps {
  icon: React.ElementType;
  label: string;
  variant?: "default" | "ghost";
  iconClassName?: string;
  onClick?: () => void;
}

function ActionButton({ icon: Icon, label, variant = "ghost", iconClassName, onClick }: ActionButtonProps) {
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

export function LeaguesActions({ onAddTeam }: { onAddTeam: () => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <ActionButton icon={Swords} label="הוסף קבוצה" variant="default" onClick={onAddTeam} />
      <ActionButton icon={FileDown} label="ייצוא לאקסל" iconClassName="text-[#217346]" />
      <ActionButton icon={FileUp} label="משיכה מאקסל" iconClassName="text-[#217346]" />
    </div>
  );
}
