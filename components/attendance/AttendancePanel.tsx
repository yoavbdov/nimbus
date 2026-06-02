"use client";

import { AnimatePresence, motion } from "framer-motion";
import { TriangleAlert } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AttendanceActions } from "@/components/attendance/AttendanceActions";
import { AttendanceClassList } from "@/components/attendance/AttendanceClassList";
import { AttendanceSessionList } from "@/components/attendance/AttendanceSessionList";
import { AttendanceBulkActions } from "@/components/attendance/AttendanceBulkActions";
import { AttendanceTable } from "@/components/attendance/AttendanceTable";
import { useAttendancePanel } from "@/hooks/attendance/useAttendancePanel";

export function AttendancePanel() {
  const {
    classes,
    activeClass,
    activeSession,
    classId,
    sessionId,
    roster,
    counts,
    classMissingCount,
    sessionMissingById,
    selectClass,
    selectSession,
    cycleMark,
    setComment,
    markAll,
  } = useAttendancePanel();

  const sessionHasMissing = sessionMissingById[activeSession.id];

  return (
    <Card className="tint-indigo glass shadow-depth-xl border-0 ring-0 rounded-3xl gap-0 py-0 overflow-hidden">
      <div className="h-1 tint-bar" />
      <CardContent className="p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1.5">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight tint-text leading-none">
              נוכחות
            </h1>
            <p className="text-xs text-muted-foreground/80 num">
              {activeClass.name} · {activeSession.label} · {counts.total} תלמידים
            </p>
          </div>
          <AttendanceActions classes={classes} />
        </div>

        <Separator className="bg-foreground/8" />

        {/* Right → left: classes · dates · attendance editor */}
        <div className="grid grid-cols-1 lg:grid-cols-[14rem_15rem_1fr] gap-4 items-start">
          <AttendanceClassList
            classes={classes}
            activeId={classId}
            missingCount={classMissingCount}
            onSelect={selectClass}
          />

          <AttendanceSessionList
            sessions={activeClass.sessions}
            activeId={sessionId}
            missingById={sessionMissingById}
            onSelect={selectSession}
          />

          <div className="space-y-4">
            <AttendanceBulkActions
              counts={counts}
              onMarkAllPresent={() => markAll("present")}
              onMarkAllAbsent={() => markAll("absent")}
            />

            {sessionHasMissing && (
              <div className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 bg-amber-500/10 ring-1 ring-amber-500/25 text-sm text-amber-600 dark:text-amber-400">
                <TriangleAlert className="size-4 shrink-0" />
                במועד זה יש תלמידים שטרם הוזנה עבורם נוכחות
              </div>
            )}

            <div className="neu-inset rounded-2xl p-3">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${classId}-${sessionId}`}
                  initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -4, filter: "blur(2px)" }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                >
                  <AttendanceTable
                    roster={roster}
                    onCycle={cycleMark}
                    onComment={setComment}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
