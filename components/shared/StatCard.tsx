import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  trend?: string;
  trendUp?: boolean;
  icon: string;
  color?: "indigo" | "emerald" | "amber" | "rose" | "sky";
  onClick?: () => void;
}

const colorMap = {
  indigo: {
    border: "border-blue-400",
    iconBg: "bg-blue-100",
    bg: "bg-blue-50",
    hoverBg: "hover:bg-blue-100",
  },
  emerald: {
    border: "border-teal-400",
    iconBg: "bg-teal-100",
    bg: "bg-teal-50",
    hoverBg: "hover:bg-teal-100",
  },
  amber: {
    border: "border-amber-400",
    iconBg: "bg-amber-100",
    bg: "bg-amber-50",
    hoverBg: "hover:bg-amber-100",
  },
  rose: {
    border: "border-pink-400",
    iconBg: "bg-pink-100",
    bg: "bg-pink-50",
    hoverBg: "hover:bg-pink-100",
  },
  sky: {
    border: "border-violet-400",
    iconBg: "bg-violet-100",
    bg: "bg-violet-50",
    hoverBg: "hover:bg-violet-100",
  },
};

export function StatCard({
  label,
  value,
  subtext,
  trend,
  trendUp,
  icon,
  color = "indigo",
  onClick,
}: StatCardProps) {
  const c = colorMap[color];
  return (
    <Card
      onClick={onClick}
      className={cn(
        "border-[3px] shadow-md rounded-xl animate-in fade-in-0 slide-in-from-bottom-2 duration-300 transition-all hover:-translate-y-1 hover:shadow-xl",
        c.border,
        c.bg,
        c.hoverBg,
        onClick && "cursor-pointer",
      )}
    >
      <CardContent className="p-2.5">
        <div className="flex flex-col items-center text-center">
          <div
            className={cn(
              "size-12 rounded-full flex items-center justify-center shrink-0 mb-2",
              c.iconBg,
            )}
          >
            <Image
              src={icon}
              alt=""
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
          <p className="text-sm font-medium text-muted-foreground mb-1">
            {label}
          </p>
          <p className="text-2xl font-semibold font-mono tabular-nums text-foreground leading-none">
            {value}
          </p>
          {subtext && (
            <p className="text-xs text-muted-foreground/60 mt-1.5">{subtext}</p>
          )}
          {trend && (
            <p
              className={cn(
                "text-xs font-mono mt-1.5",
                trendUp ? "text-emerald-500" : "text-rose-500",
              )}
            >
              {trend}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
