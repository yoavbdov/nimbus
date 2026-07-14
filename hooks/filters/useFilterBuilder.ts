import { useState } from "react";
import type {
  Filter,
  FilterSchema,
  ValueMode,
} from "@/lib/filters/schema";

function isValueComplete(mode: ValueMode, value: string | string[]): boolean {
  if (mode === "none") return true;
  if (mode === "multi-enum") return Array.isArray(value) && value.length > 0;
  return typeof value === "string" && value.trim().length > 0;
}

function makeFilterId(field: string, op: string) {
  return `${field}-${op}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function buildFilter(
  field: string,
  op: string,
  mode: ValueMode,
  value: string | string[],
  id?: string,
): Filter {
  const finalId = id ?? makeFilterId(field, op);
  if (mode === "none") return { id: finalId, field, op, value: null };
  if (mode === "multi-enum")
    return { id: finalId, field, op, value: value as string[] };
  if (mode === "number")
    return { id: finalId, field, op, value: Number(value) };
  return { id: finalId, field, op, value: value as string };
}

interface UseFilterBuilderProps {
  schema: FilterSchema;
  initial?: Filter;
  onSubmit: (filter: Filter) => void;
}

/**
 * Owns the multi-step "build a filter" flow (field → operator → value). Driven
 * entirely by the passed {@link FilterSchema}, so it works for any entity.
 */
export function useFilterBuilder({
  schema,
  initial,
  onSubmit,
}: UseFilterBuilderProps) {
  const { fieldDefs, basicFieldDefs, fieldByKey, getOperator } = schema;

  const initialMulti =
    initial && Array.isArray(initial.value) ? (initial.value as string[]) : [];
  const initialText =
    initial && !Array.isArray(initial.value) && initial.value != null
      ? String(initial.value)
      : "";

  const [field, setField] = useState<string>(initial?.field ?? "");
  const [op, setOp] = useState<string>(() => {
    if (initial?.op) return initial.op;
    if (initial?.field) {
      const ops = fieldByKey[initial.field].operators;
      if (ops.length === 1) return ops[0].op;
    }
    return "";
  });
  const [textValue, setTextValue] = useState(initialText);
  const [multiValue, setMultiValue] = useState<string[]>(initialMulti);
  const initialIsAdvanced =
    !!initial?.field && !fieldByKey[initial.field].basic;
  const [showAdvanced, setShowAdvanced] = useState(initialIsAdvanced);

  const visibleFields = showAdvanced ? fieldDefs : basicFieldDefs;

  function handleFieldChange(next: string) {
    setField(next);
    const ops = fieldByKey[next].operators;
    setOp(ops.length === 1 ? ops[0].op : "");
    setTextValue("");
    setMultiValue([]);
  }

  function handleOpChange(next: string) {
    setOp(next);
    setTextValue("");
    setMultiValue([]);
  }

  const fieldDef = field ? fieldByKey[field] : null;
  const opDef = field && op ? getOperator(field, op) : undefined;
  const mode: ValueMode | null = opDef?.valueMode ?? null;
  const hasOpStep = !!field && fieldByKey[field].operators.length > 1;
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
    visibleFields,
    showAdvanced,
    toggleAdvanced: () => setShowAdvanced((v) => !v),
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
