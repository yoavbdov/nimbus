"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  trend?: string;
  trendUp?: boolean;
  icon: string;
  color?: "indigo" | "sky";
  onClick?: () => void;
  active?: boolean;
  tinted?: boolean;
}

const accentMap: Record<NonNullable<StatCardProps["color"]>, string> = {
  indigo: "text-indigo-500",
  sky: "text-sky-500",
};

const bloomMap: Record<NonNullable<StatCardProps["color"]>, string> = {
  indigo: "bloom bloom-indigo bloom-hover",
  sky: "bloom bloom-sky bloom-hover",
};

const tintMap: Record<NonNullable<StatCardProps["color"]>, string> = {
  indigo: "tint-indigo",
  sky: "tint-sky",
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
  active = false,
  tinted = false,
}: StatCardProps) {
  return (
    <motion.div
      whileHover={onClick ? { y: -3 } : undefined}
      whileTap={onClick ? { scale: 0.97 } : undefined}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
      onClick={onClick}
      className={cn(
        "rounded-2xl h-full",
        tintMap[color],
        bloomMap[color],
        onClick && "cursor-pointer",
      )}
    >
      <Card
        className={cn(
          "group/stat relative overflow-hidden glass shadow-depth-xl neu-interactive border-0 ring-0 rounded-2xl gap-0 py-0 h-full transition-colors duration-100",
          active && "tint-ring",
        )}
        style={active ? { backgroundColor: "var(--tint-soft)" } : undefined}
      >
        <div
          className={cn(
            "absolute inset-x-0 top-0 h-1 tint-bar origin-center transition-transform duration-700 ease-out",
            active ? "scale-x-100" : "scale-x-0 group-hover/stat:scale-x-100",
          )}
        />
        <CardContent className="p-5">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="tint-well rounded-full size-14 flex items-center justify-center shrink-0">
              <Image
                src={icon}
                alt=""
                width={30}
                height={30}
                className="object-contain opacity-90 dark:invert"
              />
            </div>
            <p className="text-[0.7rem] font-medium uppercase tracking-[0.14em] text-foreground">
              {label}
            </p>
            <p className="text-3xl font-semibold num tint-text leading-none">
              {value}
            </p>
            {subtext && (
              <p className="text-xs text-muted-foreground/70">{subtext}</p>
            )}
            {trend && (
              <p
                className={cn(
                  "text-xs num",
                  trendUp ? "text-emerald-500" : "text-rose-500",
                  accentMap[color],
                )}
              >
                {trend}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
