import { useCallback, useMemo, useState } from "react";
import {
  EMPTY_ACTIVITY_FORM,
  isActivityFormValid,
  makeEquipmentLine,
  makeMeeting,
  meetsCriteria,
  type ActivityFormValues,
  type EquipmentLineValues,
  type MeetingValues,
} from "@/lib/activity-form";
import { players } from "@/lib/players-data";

/**
 * Owns all state for the "add activity" modal: the scalar fields plus the three
 * dynamic lists (recurring meetings, enrolled students, equipment lines). The
 * modal stays presentational and receives everything from here.
 */
/** The modal's tabs, in order; the first is the default shown on open. */
export type ActivityTab = "details" | "meetings" | "students" | "equipment";

export function useAddActivity() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<ActivityTab>("details");
  const [values, setValues] = useState<ActivityFormValues>(EMPTY_ACTIVITY_FORM);

  const valid = isActivityFormValid(values);

  const updateField = useCallback(
    <K extends keyof ActivityFormValues>(field: K, value: ActivityFormValues[K]) => {
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

  const openStudentPicker = useCallback(() => {
    setCheckedStudentIds([]);
    setStudentPickerOpen(true);
  }, []);

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
    [values.studentIds],
  );

  const availableStudents = useMemo(
    () => players.filter((p) => !values.studentIds.includes(p.id)),
    [values.studentIds],
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
    [values],
  );

  const openModal = useCallback(() => {
    setValues(EMPTY_ACTIVITY_FORM);
    setTab("details");
    setOpen(true);
  }, []);

  const handleOpenChange = useCallback((next: boolean) => setOpen(next), []);

  const confirm = useCallback(() => {
    if (!valid) return;
    // UI only for now — submitting is wired up elsewhere later.
    setOpen(false);
  }, [valid]);

  return {
    open,
    tab,
    setTab,
    openModal,
    handleOpenChange,
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
