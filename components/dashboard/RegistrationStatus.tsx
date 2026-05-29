"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const classes = [
  { name: "שחמט מתחילים", enrolled: 4, capacity: 15 },
  { name: "שחמט מתקדמים", enrolled: 3, capacity: 20 },
  { name: "אימון קבוצתי", enrolled: 3, capacity: 20 },
  { name: "שחמט מחשב", enrolled: 16, capacity: 20 },
  { name: "מועדון בוגרים", enrolled: 30, capacity: 30 },
];

function statusFor(pct: number) {
  if (pct >= 100) return { label: "מלא", cls: "status-full" };
  if (pct >= 75) return { label: "כמעט מלא", cls: "status-warn" };
  return { label: "רגיל", cls: "status-ok" };
}

export function RegistrationStatus() {
  return (
    <Card className="tint-indigo glass shadow-depth-xl border-0 ring-0 rounded-3xl gap-0 py-0 overflow-hidden">
      <div className="h-1 tint-bar" />
      <CardHeader className="px-6 pt-5 pb-4 flex flex-col items-center space-y-0">
        <CardTitle className="text-base font-semibold tracking-wide tint-text text-center">
          מצב רישומים · חוגים פעילים
        </CardTitle>
      </CardHeader>

      <CardContent className="px-5 pb-5 space-y-3">
        {classes.map((c, i) => {
          const pct = Math.round((c.enrolled / c.capacity) * 100);
          const status = statusFor(pct);
          return (
            <motion.div
              key={c.name}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="glass-sm shadow-depth rounded-2xl px-4 py-3"
            >
              <div className="flex items-center gap-3 mb-2.5">
                <span className="text-sm font-medium text-foreground flex-1 truncate">
                  {c.name}
                </span>
                <Badge
                  variant="secondary"
                  className={cn(
                    status.cls,
                    "rounded-full px-2.5 py-0.5 text-[0.65rem] font-medium border-0 shrink-0 tint-text",
                  )}
                  style={{ backgroundColor: "var(--tint-soft)" }}
                >
                  {status.label}
                </Badge>
                <span className="text-xs num text-muted-foreground shrink-0">
                  {c.enrolled} / {c.capacity}
                </span>
              </div>
              <div className="neu-inset rounded-full overflow-hidden">
                <Progress value={pct} className="h-1.5 bg-transparent" />
              </div>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}
