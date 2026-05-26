import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  accent?: "blue" | "emerald" | "amber" | "red";
  onClick?: () => void;
}

const accentMap = {
  blue: {
    stripe: "border-s-blue-500",
    iconBg: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  },
  emerald: {
    stripe: "border-s-emerald-500",
    iconBg: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  },
  amber: {
    stripe: "border-s-amber-500",
    iconBg: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
  },
  red: {
    stripe: "border-s-red-500",
    iconBg: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
  },
};

export function StatCard({
  label,
  value,
  subtext,
  icon: Icon,
  accent = "blue",
  onClick,
}: StatCardProps) {
  const { stripe, iconBg } = accentMap[accent];

  return (
    <Card
      onClick={onClick}
      className={cn(
        "border-s-4 rounded-xl shadow-none",
        stripe,
        onClick &&
          "cursor-pointer hover:border-blue-300 dark:hover:border-blue-600 transition-colors duration-200"
      )}
    >
      <CardContent className="p-5 flex items-start gap-4">
        <div className={cn("p-2.5 rounded-lg shrink-0", iconBg)}>
          <Icon className="size-5" />
        </div>

        <div className="min-w-0">
          <p className="text-2xl font-bold font-mono tabular-nums text-foreground leading-none mb-1">
            {value}
          </p>
          <p className="text-sm text-muted-foreground">{label}</p>
          {subtext && (
            <p className="text-xs text-muted-foreground mt-0.5">{subtext}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
