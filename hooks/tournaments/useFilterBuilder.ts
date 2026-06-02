import { useState } from "react";
import {
  FIELD_BY_KEY,
  getOperator,
  type TournamentFilter,
  type FilterField,
  type ValueMode,
} from "@/lib/tournaments-filters";

function isValueComplete(mode: ValueMode, value: string | string[]): boolean {
  if (mode === "none") return true;
  if (mode === "multi-enum") return Array.isArray(value) && value.length > 0;
  return typeof value === "string" && value.trim().length > 0;
}

function makeFilterId(field: FilterField, op: string) {
  return `${field}-${op}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function buildFilter(
  field: FilterField,
  op: string,
  mode: ValueMode,
  value: string | string[],
  id?: string,
): TournamentFilter {
  const finalId = id ?? makeFilterId(field, op);
  if (mode === "none") return { id: finalId, field, op, value: null };
  if (mode === "multi-enum")
    return { id: finalId, field, op, value: value as string[] };
  if (mode === "number")
    return { id: finalId, field, op, value: Number(value) };
  return { id: finalId, field, op, value: value as string };
}

interface UseFilterBuilderProps {
  initial?: TournamentFilter;
  onSubmit: (filter: TournamentFilter) => void;
}

export function useFilterBuilder({ initial, onSubmit }: UseFilterBuilderProps) {
  const initialMulti =
    initial && Array.isArray(initial.value) ? (initial.value as string[]) : [];
  const initialText =
    initial && !Array.isArray(initial.value) && initial.value != null
      ? String(initial.value)
      : "";

  const [field, setField] = useState<FilterField | "">(initial?.field ?? "");
  const [op, setOp] = useState<string>(() => {
    if (initial?.op) return initial.op;
    if (initial?.field) {
      const ops = FIELD_BY_KEY[initial.field].operators;
      if (ops.length === 1) return ops[0].op;
    }
    return "";
  });
  const [textValue, setTextValue] = useState(initialText);
  const [multiValue, setMultiValue] = useState<string[]>(initialMulti);

  function handleFieldChange(next: FilterField) {
    setField(next);
    const ops = FIELD_BY_KEY[next].operators;
    setOp(ops.length === 1 ? ops[0].op : "");
    setTextValue("");
    setMultiValue([]);
  }

  function handleOpChange(next: string) {
    setOp(next);
    setTextValue("");
    setMultiValue([]);
  }

  const fieldDef = field ? FIELD_BY_KEY[field] : null;
  const opDef = field && op ? getOperator(field, op) : undefined;
  const mode: ValueMode | null = opDef?.valueMode ?? null;
  const hasOpStep = !!field && FIELD_BY_KEY[field].operators.length > 1;
  const showValueStep = !!opDef && mode !== "none";
  const showActions = !!opDef;
  const currentValue: string | string[] =
    mode === "multi-enum" ? multiValue : textValue;
  const canSubmit =
    !!opDef &&
    mode != null &&
    (mode === "none" || isValueComplete(mode, currentValue));

  function submit() {
    if (!field || !opDef || !mode) return;
    if (mode === "none") {
      onSubmit(buildFilter(field, opDef.op, "none", "", initial?.id));
      return;
    }
    if (!isValueComplete(mode, currentValue)) return;
    onSubmit(buildFilter(field, opDef.op, mode, currentValue, initial?.id));
  }

  return {
    field,
    op,
    textValue,
    multiValue,
    fieldDef,
    opDef,
    mode,
    hasOpStep,
    showValueStep,
    showActions,
    canSubmit,
    handleFieldChange,
    handleOpChange,
    setTextValue,
    setMultiValue,
    submit,
    isEditing: !!initial,
  };
}
