import { useCallback, useMemo, useState } from "react";
import {
  EMPTY_COURSE_FORM,
  isCourseFormValid,
  makeEquipmentLine,
  makeMeeting,
  meetsCriteria,
  type CourseFormValues,
  type EquipmentLineValues,
  type MeetingValues,
} from "@/lib/course-form";
import { type Player } from "@/lib/players-data";
import { exampleRosters } from "@/lib/rosters-data";
import { useCollection } from "@/lib/firebase/useCollection";
import { addCourse, updateCourse } from "@/lib/firebase/data/courses";
import { replaceCourseSessions } from "@/lib/firebase/data/sessions";
import { replaceTargetRelations } from "@/lib/firebase/data/relations";
import { courseRecordFromForm, courseEditPatch } from "@/lib/course-details";

/**
 * Owns all state for the "add course" modal: the scalar fields plus the three
 * dynamic lists (recurring meetings, enrolled students, equipment lines). The
 * modal stays presentational and receives everything from here.
 */
/** The modal's tabs, in order; the first is the default shown on open. */
export type CourseTab = "details" | "meetings" | "students" | "equipment";

/**
 * "add" shows the empty add flow; "edit" prefills an existing course; "view"
 * prefills it read-only (used by the cleanup archive, where courses may only
 * be inspected, not changed).
 */
export type CourseModalMode = "add" | "edit" | "view";

export function useAddCourse() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<CourseModalMode>("add");
  const [tab, setTab] = useState<CourseTab>("details");
  const [values, setValues] = useState<CourseFormValues>(EMPTY_COURSE_FORM);
  // Snapshot of the form as it was on open (JSON), to detect unsaved edits.
  const [baseline, setBaseline] = useState<string>(() =>
    JSON.stringify(EMPTY_COURSE_FORM),
  );
  // Whether a close attempt is awaiting the "discard unsaved edits" confirm, and
  // a counter bumped on each repeated attempt to replay the warning's shake.
  const [confirmingClose, setConfirmingClose] = useState(false);
  const [closeNudge, setCloseNudge] = useState(0);

  // The club roster, read live — the students picker and criteria checks all
  // work off real players, not the legacy mock.
  const { data: players } = useCollection<Player>("players");

  const valid = isCourseFormValid(values);
  // Read-only (view) never counts as dirty; otherwise compare against the open snapshot.
  const dirty = mode !== "view" && JSON.stringify(values) !== baseline;

  const updateField = useCallback(
    <K extends keyof CourseFormValues>(field: K, value: CourseFormValues[K]) => {
      setValues((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  // ---- Meetings -----------------------------------------------------------
  const addMeeting = useCallback(() => {
    setValues((prev) => ({ ...prev, meetings: [...prev.meetings, makeMeeting()] }));
  }, []);

  const updateMeeting = useCallback(
    (id: string, patch: Partial<MeetingValues>) => {
      setValues((prev) => ({
        ...prev,
        meetings: prev.meetings.map((m) => (m.id === id ? { ...m, ...patch } : m)),
      }));
    },
    [],
  );

  const removeMeeting = useCallback((id: string) => {
    setValues((prev) => ({
      ...prev,
      meetings: prev.meetings.filter((m) => m.id !== id),
    }));
  }, []);

  // ---- Students -----------------------------------------------------------
  const toggleStudent = useCallback((id: string) => {
    setValues((prev) => ({
      ...prev,
      studentIds: prev.studentIds.includes(id)
        ? prev.studentIds.filter((s) => s !== id)
        : [...prev.studentIds, id],
    }));
  }, []);

  const removeStudent = useCallback((id: string) => {
    setValues((prev) => ({
      ...prev,
      studentIds: prev.studentIds.filter((s) => s !== id),
    }));
  }, []);

  // The "add students" picker: a checkbox table whose checked rows are committed
  // to the form in bulk on confirm.
  const [studentPickerOpen, setStudentPickerOpen] = useState(false);
  const [checkedStudentIds, setCheckedStudentIds] = useState<string[]>([]);

  // The "add students" flow first asks the source (a saved roster, or the whole
  // club) before opening the picker.
  const [sourceChoiceOpen, setSourceChoiceOpen] = useState(false);
  const [rosterChoiceOpen, setRosterChoiceOpen] = useState(false);
  // The exact rows the picker shows: the whole club for the "all" branch, or a
  // roster's full member list for the roster branch. Members already enrolled
  // are listed in `pickerDisabledIds` so the picker greys them out.
  const [pickerStudents, setPickerStudents] = useState<Player[]>([]);
  const [pickerDisabledIds, setPickerDisabledIds] = useState<string[]>([]);

  const studentRosters = useMemo(
    () =>
      exampleRosters.map((r) => ({
        id: r.id,
        name: r.name,
        count: r.players.length,
      })),
    [],
  );

  // Opens the source question; the picker opens only after a branch is chosen.
  const openStudentPicker = useCallback(() => {
    setSourceChoiceOpen(true);
  }, []);

  const chooseStudentsFromAll = useCallback(() => {
    setPickerStudents(players.filter((p) => !values.studentIds.includes(p.id)));
    setPickerDisabledIds([]);
    setSourceChoiceOpen(false);
    setCheckedStudentIds([]);
    setStudentPickerOpen(true);
  }, [players, values.studentIds]);

  const chooseStudentsFromRoster = useCallback(() => {
    setSourceChoiceOpen(false);
    setRosterChoiceOpen(true);
  }, []);

  const backToSourceChoice = useCallback(() => {
    setRosterChoiceOpen(false);
    setSourceChoiceOpen(true);
  }, []);

  // Picking a roster pre-checks its members (matched by name) among the players
  // not yet enrolled, then opens the picker for review and confirmation.
  const selectStudentRoster = useCallback(
    (rosterId: string) => {
      const roster = exampleRosters.find((r) => r.id === rosterId);
      const names = new Set(roster?.players.map((p) => p.name) ?? []);
      const members = players.filter((p) => names.has(p.name));
      setPickerStudents(members);
      // Already-enrolled members stay visible but greyed out; only the new ones
      // are pre-checked.
      setPickerDisabledIds(
        members.filter((p) => values.studentIds.includes(p.id)).map((p) => p.id),
      );
      setCheckedStudentIds(
        members
          .filter((p) => !values.studentIds.includes(p.id))
          .map((p) => p.id),
      );
      setRosterChoiceOpen(false);
      setStudentPickerOpen(true);
    },
    [players, values.studentIds],
  );

  const toggleCheckedStudent = useCallback((id: string) => {
    setCheckedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  }, []);

  const confirmStudents = useCallback(() => {
    setValues((prev) => ({
      ...prev,
      studentIds: [...new Set([...prev.studentIds, ...checkedStudentIds])],
    }));
    setStudentPickerOpen(false);
  }, [checkedStudentIds]);

  const students = useMemo(
    () => players.filter((p) => values.studentIds.includes(p.id)),
    [players, values.studentIds],
  );

  const availableStudents = useMemo(
    () => players.filter((p) => !values.studentIds.includes(p.id)),
    [players, values.studentIds],
  );

  // ---- Equipment ----------------------------------------------------------
  const addEquipmentLine = useCallback(() => {
    setValues((prev) => ({
      ...prev,
      equipment: [...prev.equipment, makeEquipmentLine()],
    }));
  }, []);

  const updateEquipmentLine = useCallback(
    (id: string, patch: Partial<EquipmentLineValues>) => {
      setValues((prev) => ({
        ...prev,
        equipment: prev.equipment.map((e) => (e.id === id ? { ...e, ...patch } : e)),
      }));
    },
    [],
  );

  const removeEquipmentLine = useCallback((id: string) => {
    setValues((prev) => ({
      ...prev,
      equipment: prev.equipment.filter((e) => e.id !== id),
    }));
  }, []);

  // ---- Derived warnings (non-blocking) ------------------------------------
  const coachWarning = values.coach === "";
  const capacityWarning =
    values.capacity !== "" && students.length > Number(values.capacity);
  const criteriaMismatch = useCallback(
    (playerId: string) => {
      const player = players.find((p) => p.id === playerId);
      return player ? !meetsCriteria(player, values) : false;
    },
    [players, values],
  );

  const openModal = useCallback(() => {
    setMode("add");
    setValues(EMPTY_COURSE_FORM);
    setBaseline(JSON.stringify(EMPTY_COURSE_FORM));
    setConfirmingClose(false);
    setCloseNudge(0);
    setTab("details");
    setOpen(true);
  }, []);

  // Opens the modal in edit mode prefilled with an existing course.
  const openForEdit = useCallback((next: CourseFormValues) => {
    setMode("edit");
    setValues(next);
    setBaseline(JSON.stringify(next));
    setConfirmingClose(false);
    setCloseNudge(0);
    setTab("details");
    setOpen(true);
  }, []);

  // Opens the modal read-only, prefilled with an existing course.
  const openForView = useCallback((next: CourseFormValues) => {
    setMode("view");
    setValues(next);
    setBaseline(JSON.stringify(next));
    setConfirmingClose(false);
    setCloseNudge(0);
    setTab("details");
    setOpen(true);
  }, []);

  // Actually closes. The warning state is NOT reset here, so the bar stays put
  // through the close animation (no flash of the normal buttons); the next open
  // clears it.
  const doClose = useCallback(() => {
    setOpen(false);
  }, []);

  // Close requests (X / Escape / backdrop / ביטול) route through here: with
  // unsaved edits, ask before discarding instead of closing.
  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (next) {
        setOpen(true);
        return;
      }
      if (dirty) {
        setConfirmingClose((was) => {
          if (was) setCloseNudge((n) => n + 1);
          return true;
        });
        return;
      }
      doClose();
    },
    [dirty, doClose],
  );

  const cancelClose = useCallback(() => setConfirmingClose(false), []);

  const confirm = useCallback(() => {
    if (!valid) return;
    // Persist the whole course: the scalar doc, then its meetings (sessions) and
    // its associations (coach / students / equipment) in the `relations`
    // junction. Add creates the doc; edit patches it. Derived counts
    // (enrolled/occupancy) are projected on read, so the patch skips them.
    const persist = async () => {
      const courseId = values.id
        ? (await updateCourse(values.id, courseEditPatch(values)), values.id)
        : await addCourse(courseRecordFromForm(values));
      await Promise.all([
        replaceCourseSessions(courseId, values.startDate, values.meetings),
        replaceTargetRelations(
          "coach_course",
          "coach",
          "course",
          courseId,
          values.coach ? [{ subjectId: values.coach, role: "מדריך ראשי" }] : [],
        ),
        replaceTargetRelations(
          "player_course",
          "player",
          "course",
          courseId,
          values.studentIds.map((subjectId) => ({ subjectId })),
        ),
        replaceTargetRelations(
          "equipment_course",
          "equipment",
          "course",
          courseId,
          values.equipment
            .filter((e) => e.equipmentId)
            .map((e) => ({ subjectId: e.equipmentId, role: e.quantity })),
        ),
      ]);
    };
    void persist();
    doClose();
  }, [valid, values, doClose]);

  return {
    open,
    mode,
    tab,
    setTab,
    openModal,
    openForEdit,
    openForView,
    handleOpenChange,
    dirty,
    confirmingClose,
    closeNudge,
    confirmClose: doClose,
    cancelClose,
    values,
    updateField,
    valid,
    confirm,
    addMeeting,
    updateMeeting,
    removeMeeting,
    students,
    availableStudents,
    toggleStudent,
    removeStudent,
    studentPickerOpen,
    setStudentPickerOpen,
    openStudentPicker,
    sourceChoiceOpen,
    setSourceChoiceOpen,
    rosterChoiceOpen,
    setRosterChoiceOpen,
    pickerStudents,
    pickerDisabledIds,
    studentRosters,
    chooseStudentsFromAll,
    chooseStudentsFromRoster,
    backToSourceChoice,
    selectStudentRoster,
    checkedStudentIds,
    toggleCheckedStudent,
    confirmStudents,
    addEquipmentLine,
    updateEquipmentLine,
    removeEquipmentLine,
    coachWarning,
    capacityWarning,
    criteriaMismatch,
  };
}
