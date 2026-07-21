"use client";

import { motion } from "framer-motion";
import { SortIcon } from "@/components/shared/SortIcon";
import { RangePill } from "@/components/shared/RangePill";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Popover, PopoverAnchor } from "@/components/ui/popover";
import {
  CourseStatusBadge,
  CourseOccupancyBadge,
} from "@/components/courses/CourseStatusBadge";
import { CourseActionsMenuContent } from "@/components/courses/CourseActionsMenu";
import { PossibleEnrollmentsModal } from "@/components/courses/PossibleEnrollmentsModal";
import { AddCoachModal } from "@/components/coaches/AddCoachModal";
import { CourseFormModal } from "@/components/courses/CourseFormModal";
import { DeleteCourseModal } from "@/components/courses/DeleteCourseModal";
import { SelectionHead, SelectionCell } from "@/components/shared/SelectionColumn";
import { BulkActionsMenuContent } from "@/components/shared/BulkActionsMenu";
import { ArchiveConfirmDialog } from "@/components/shared/ArchiveConfirmDialog";
import { courseActions } from "@/lib/course-actions";
import { useTableSelection } from "@/hooks/useTableSelection";
import type { RowSelection } from "@/hooks/useRowSelection";
import { useCoursesTable } from "@/hooks/courses/useCoursesTable";
import type { SortDir, SortKey } from "@/hooks/courses/useCoursesSort";
import { cn } from "@/lib/utils";
import type { Course } from "@/lib/courses-data";

/** "רישומים אפשריים" is a per-course action, so it never appears in the bulk menu. */
const bulkActions = courseActions.filter((a) => a.id !== "enrollments");

function CountPill({ value }: { value: number }) {
  if (value === 0)
    return <span className="text-foreground/40 num">—</span>;
  return (
    <Badge
      variant="secondary"
      className="min-w-6 h-6 px-2 rounded-full neu-raised-xs bg-transparent border-0 text-[0.7rem] num text-foreground justify-center"
    >
      {value}
    </Badge>
  );
}

function DaysPills({ days }: { days: string[] }) {
  if (days.length === 0)
    return <span className="text-foreground/40 num">—</span>;
  return (
    <div className="flex flex-wrap justify-center gap-1">
      {days.map((d) => (
        <Badge
          key={d}
          variant="secondary"
          className="h-6 px-2 rounded-full neu-raised-xs bg-transparent border-0 text-[0.7rem] text-foreground"
        >
          {d}
        </Badge>
      ))}
    </div>
  );
}

function SortableHeader({
  children,
  sortKey,
  active,
  dir,
  onSort,
}: {
  children: React.ReactNode;
  sortKey: SortKey;
  active: boolean;
  dir: SortDir;
  onSort: (key: SortKey) => void;
}) {
  return (
    <TableHead className="px-4 py-3 text-[0.7rem] font-medium uppercase tracking-[0.14em] text-foreground/70 text-center">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onSort(sortKey)}
        className={cn(
          "mx-auto h-auto px-0 py-0 gap-1.5 font-medium uppercase tracking-[0.14em] text-foreground/70 hover:bg-transparent hover:text-foreground",
          active && "text-foreground",
        )}
      >
        {children}
        <SortIcon active={active} dir={dir} />
      </Button>
    </TableHead>
  );
}

const MotionTableRow = motion.create(TableRow);

function CourseRow({
  course: a,
  index: i,
  isActive,
  onOpen,
  selection,
}: {
  course: Course;
  index: number;
  isActive: boolean;
  onOpen: (id: string, e: React.MouseEvent) => void;
  selection: RowSelection;
}) {
  return (
    <MotionTableRow
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: Math.min(i * 0.015, 0.2),
        duration: 0.3,
        ease: [0.22, 1, 0.36, 1],
      }}
      onClick={(e) => onOpen(a.id, e)}
      className={cn(
        "cursor-pointer border-b-2 border-foreground/10 transition-colors duration-150 hover:bg-primary/25",
        i % 2 === 1 && "bg-primary/15",
        isActive && "bg-primary/30",
      )}
    >
      <TableCell className="px-4 py-3 text-sm font-medium text-foreground text-center">
        {a.name}
      </TableCell>
      <TableCell className="px-4 py-3 text-sm text-foreground/85 text-center">
        {a.coach}
      </TableCell>
      <TableCell className="px-4 py-3 text-center">
        <RangePill from={a.ageMin} to={a.ageMax} noLimit={a.noAgeLimit} />
      </TableCell>
      <TableCell className="px-4 py-3 text-center">
        <RangePill
          from={a.ratingMin}
          to={a.ratingMax}
          noLimit={a.noRatingLimit}
        />
      </TableCell>
      <TableCell className="px-4 py-3 text-center">
        <CountPill value={a.enrolled} />
      </TableCell>
      <TableCell className="px-4 py-3 text-center">
        <CountPill value={a.capacity} />
      </TableCell>
      <TableCell className="px-4 py-3 text-center">
        <DaysPills days={a.days} />
      </TableCell>
      <TableCell className="px-4 py-3 text-sm text-foreground/85 text-center num" dir="ltr">
        {a.nextDate}
      </TableCell>
      <TableCell className="px-4 py-3 text-sm text-foreground/85 text-center">
        {a.room || "—"}
      </TableCell>
      <TableCell className="px-4 py-3 text-center">
        <CourseStatusBadge status={a.status} />
      </TableCell>
      <TableCell className="px-4 py-3 text-center">
        <CourseOccupancyBadge occupancy={a.occupancy} />
      </TableCell>
      <SelectionCell id={a.id} selection={selection} />
    </MotionTableRow>
  );
}

interface CoursesTableProps {
  courses: Course[];
}

export function CoursesTable({ courses }: CoursesTableProps) {
  const {
    sortKey,
    sortDir,
    sorted,
    handleSort,
    menuOpen,
    virtualRef,
    onSelectAction,
    onRowAction,
    archive,
    deleteCourse,
    enrollments,
    coachEdit,
    courseEdit,
    activeId,
    handleRowClick,
    handleMenuOpenChange,
  } = useCoursesTable(courses);
  const { selection, bulkMode, onBulkSelect } = useTableSelection({
    ids: sorted.map((a) => a.id),
    activeId,
    onAction: onSelectAction,
  });

  if (courses.length === 0) {
    return (
      <Alert className="border-0 bg-transparent py-12 [&>svg]:hidden">
        <AlertTitle className="text-center text-sm text-foreground/60 font-normal">
          לא נמצאו חוגים תואמים
        </AlertTitle>
      </Alert>
    );
  }

  const headerProps = (key: SortKey) => ({
    sortKey: key,
    active: sortKey === key,
    dir: sortDir,
    onSort: handleSort,
  });

  return (
    <>
    <Popover open={menuOpen} onOpenChange={handleMenuOpenChange}>
      <PopoverAnchor virtualRef={virtualRef} />
      <div
        dir="ltr"
        className="players-scroll max-h-[calc(100dvh-22rem)] overflow-y-auto overflow-x-hidden"
      >
        <div dir="rtl">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-background/40 backdrop-blur-md [&_tr]:border-b-2 [&_tr]:border-foreground/15">
              <TableRow className="hover:bg-transparent">
                <SortableHeader {...headerProps("name")}>שם החוג</SortableHeader>
                <SortableHeader {...headerProps("coach")}>מדריך</SortableHeader>
                <SortableHeader {...headerProps("age")}>גילאים</SortableHeader>
                <SortableHeader {...headerProps("rating")}>מד כושר</SortableHeader>
                <SortableHeader {...headerProps("enrolled")}>רשומים</SortableHeader>
                <SortableHeader {...headerProps("capacity")}>קיבולת</SortableHeader>
                <SortableHeader {...headerProps("days")}>ימי פעילות</SortableHeader>
                <SortableHeader {...headerProps("nextDate")}>המועד הבא</SortableHeader>
                <SortableHeader {...headerProps("room")}>חדר</SortableHeader>
                <SortableHeader {...headerProps("status")}>סטטוס</SortableHeader>
                <SortableHeader {...headerProps("occupancy")}>תפוסה</SortableHeader>
                <SelectionHead selection={selection} />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((a, i) => (
                <CourseRow
                  key={a.id}
                  course={a}
                  index={i}
                  isActive={activeId === a.id}
                  onOpen={handleRowClick}
                  selection={selection}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      {bulkMode ? (
        <BulkActionsMenuContent
          actions={bulkActions}
          count={selection.selectedCount}
          onSelect={onBulkSelect}
        />
      ) : (
        <CourseActionsMenuContent onSelect={onRowAction} />
      )}
    </Popover>
    <PossibleEnrollmentsModal
      open={enrollments.open}
      onOpenChange={enrollments.onOpenChange}
      course={enrollments.course}
      candidates={enrollments.candidates}
      onExport={() => {}}
    />
    <AddCoachModal
      open={coachEdit.open}
      mode={coachEdit.mode}
      onOpenChange={coachEdit.handleOpenChange}
      values={coachEdit.values}
      onFieldChange={coachEdit.updateField}
      valid={coachEdit.valid}
      onConfirm={coachEdit.confirm}
    />
    <CourseFormModal addCourse={courseEdit} />
    <DeleteCourseModal
      open={deleteCourse.open}
      onOpenChange={deleteCourse.handleOpenChange}
      courseNames={deleteCourse.names}
      expectedPhrase={deleteCourse.expectedPhrase}
      confirmText={deleteCourse.confirmText}
      onConfirmTextChange={deleteCourse.setConfirmText}
      valid={deleteCourse.valid}
      onConfirm={deleteCourse.confirm}
    />
    <ArchiveConfirmDialog
      open={archive.open}
      count={archive.count}
      noun="חוגים"
      names={archive.names}
      warnFinal
      onCancel={archive.cancel}
      onConfirm={archive.confirm}
    />
    </>
  );
}
