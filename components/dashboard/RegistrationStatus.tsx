"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Popover, PopoverAnchor } from "@/components/ui/popover";
import { CourseActionsMenuContent } from "@/components/courses/CourseActionsMenu";
import { CourseFormModal } from "@/components/courses/CourseFormModal";
import { PossibleEnrollmentsModal } from "@/components/courses/PossibleEnrollmentsModal";
import { AddCoachModal } from "@/components/coaches/AddCoachModal";
import { ArchiveConfirmDialog } from "@/components/shared/ArchiveConfirmDialog";
import { useRegistrationStatus } from "@/hooks/dashboard/useRegistrationStatus";
import { cn } from "@/lib/utils";

function statusFor(pct: number) {
  if (pct >= 100) return { label: "מלא", cls: "status-full" };
  if (pct >= 75) return { label: "כמעט מלא", cls: "status-warn" };
  return { label: "רגיל", cls: "status-ok" };
}

export function RegistrationStatus() {
  const {
    classes,
    menuOpen,
    virtualRef,
    onSelectAction,
    activeName,
    courseEdit,
    coachEdit,
    enrollments,
    archive,
    confirmArchive,
    handleRowClick,
    handleMenuOpenChange,
  } = useRegistrationStatus();

  return (
    <Popover open={menuOpen} onOpenChange={handleMenuOpenChange}>
      <PopoverAnchor virtualRef={virtualRef} />
      <Card className="tint-indigo glass shadow-depth-xl border-0 ring-0 rounded-3xl gap-0 py-0 overflow-hidden">
        <div className="h-1 tint-bar" />
        <CardHeader className="px-6 pt-5 pb-4 flex flex-col items-center space-y-0">
          <CardTitle className="text-base font-semibold tracking-wide tint-text text-center">
            חוגים פעילים - מצב קיבולת
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
                transition={{
                  delay: i * 0.06,
                  duration: 0.4,
                  ease: [0.22, 1, 0.36, 1],
                }}
                onClick={(e) => handleRowClick(c.name, e)}
                className={cn(
                  "glass-sm shadow-depth rounded-2xl px-4 py-3 cursor-pointer transition-colors duration-150 hover:bg-primary/15",
                  activeName === c.name && "bg-primary/20",
                )}
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
                    {c.enrolled} מתוך {c.capacity}
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
      <CourseActionsMenuContent onSelect={onSelectAction} />
      <CourseFormModal addCourse={courseEdit} />
      <AddCoachModal
        open={coachEdit.open}
        mode={coachEdit.mode}
        onOpenChange={coachEdit.handleOpenChange}
        values={coachEdit.values}
        onFieldChange={coachEdit.updateField}
        valid={coachEdit.valid}
        onConfirm={coachEdit.confirm}
      />
      <PossibleEnrollmentsModal
        open={enrollments.open}
        onOpenChange={enrollments.onOpenChange}
        course={enrollments.course}
        candidates={enrollments.candidates}
        onExport={() => {}}
      />
      <ArchiveConfirmDialog
        open={archive.open}
        count={archive.count}
        noun="חוגים"
        onCancel={archive.cancel}
        onConfirm={confirmArchive}
      />
    </Popover>
  );
}
