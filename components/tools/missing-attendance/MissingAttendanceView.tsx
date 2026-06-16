"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ClipboardCheck, CircleCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ToolBackLink } from "@/components/tools/ToolBackLink";
import { missingAttendanceClasses } from "@/lib/missing-attendance-data";

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10, filter: "blur(4px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const totalMissing = missingAttendanceClasses.reduce(
  (sum, cls) => sum + cls.totalMissing,
  0,
);

export function MissingAttendanceView() {
  return (
    <div className="space-y-4">
      <ToolBackLink />

      <Card className="tint-indigo glass shadow-depth-xl border-0 ring-0 rounded-3xl gap-0 py-0 overflow-hidden">
        <div className="h-1 tint-bar" />
        <div className="p-6 space-y-5">
          <div className="space-y-1.5">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight tint-text leading-none">
              עדכון נוכחות חסרה
            </h1>
            <p className="text-xs text-muted-foreground/80 num">
              {missingAttendanceClasses.length} חוגים · {totalMissing} סימוני
              נוכחות חסרים
            </p>
          </div>

          <Separator className="bg-foreground/8" />

          {missingAttendanceClasses.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <CircleCheck className="size-8 text-emerald-500" />
              <p className="text-sm text-muted-foreground">
                כל הכבוד! אין נוכחות חסרה בחוגים.
              </p>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="space-y-3"
            >
              {missingAttendanceClasses.map((cls) => (
                <motion.div
                  key={cls.id}
                  variants={itemVariants}
                  className="rounded-2xl neu-inset p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-semibold text-foreground">
                          {cls.name}
                        </h2>
                        <Badge
                          variant="secondary"
                          className="rounded-full border-0 bg-amber-500/15 px-2.5 py-0.5 text-[0.65rem] font-medium text-amber-600 dark:text-amber-300 num"
                        >
                          {cls.totalMissing} חסרים
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        מדריך: {cls.coach}
                      </p>
                    </div>

                    <Button
                      asChild
                      size="sm"
                      className="h-8 gap-1.5 rounded-xl"
                    >
                      <Link
                        href={`/attendance?class=${cls.id}&session=${cls.sessions[0].id}`}
                      >
                        <ClipboardCheck className="size-3.5" />
                        השלמת נוכחות
                      </Link>
                    </Button>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {cls.sessions.map((ses) => (
                      <Link
                        key={ses.id}
                        href={`/attendance?class=${cls.id}&session=${ses.id}`}
                        className="flex items-center gap-2 rounded-xl border border-foreground/10 bg-background/40 px-3 py-1.5 transition-colors hover:border-primary/40 hover:bg-primary/10"
                      >
                        <span className="text-sm text-foreground/85">
                          {ses.label}
                        </span>
                        <span className="text-xs text-amber-600 dark:text-amber-300">
                          חסרים{" "}
                          <span className="num">{ses.missingCount}</span> דיווחים
                          מתוך <span className="num">{ses.totalStudents}</span>
                        </span>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </Card>
    </div>
  );
}
