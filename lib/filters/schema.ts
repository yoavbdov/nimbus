/**
 * Generic, entity-agnostic filter schema. Both the rooms and equipment panels
 * describe their filterable fields with a {@link FilterSchema} and hand it to
 * the shared filter components (FilterBuilder / FilterChip / RoomsFilterBar), so
 * every panel gets the exact same UI and behaviour from one set of components.
 * The per-entity matching logic stays next to each entity's field defs.
 */

/** How a chosen operator collects its value. */
export type ValueMode = "none" | "text" | "number" | "single-enum" | "multi-enum";

export interface OperatorDef {
  op: string;
  label: string;
  valueMode: ValueMode;
}

export interface FieldDef {
  field: string;
  label: string;
  operators: OperatorDef[];
  options?: string[];
  /** Basic fields show up-front; non-basic ones sit behind "פילטור מתקדם". */
  basic?: boolean;
}

/** A single active filter: a field, an operator and its collected value. */
export interface Filter {
  id: string;
  field: string;
  op: string;
  value: string | number | string[] | null;
}

/** Everything the shared filter UI needs to render a given entity's fields. */
export interface FilterSchema {
  fieldDefs: FieldDef[];
  basicFieldDefs: FieldDef[];
  hasAdvancedFields: boolean;
  fieldByKey: Record<string, FieldDef>;
  getOperator(field: string, op: string): OperatorDef | undefined;
  formatValue(filter: Filter): string;
}

/** The default chip text for a filter's value (arrays joined, scalars stringified). */
function formatValue(filter: Filter): string {
  if (filter.value == null) return "";
  if (Array.isArray(filter.value)) return filter.value.join(", ");
  return String(filter.value);
}

/** Build a {@link FilterSchema} from a list of field definitions. */
export function makeFilterSchema(fieldDefs: FieldDef[]): FilterSchema {
  const basicFieldDefs = fieldDefs.filter((f) => f.basic);
  const fieldByKey = Object.fromEntries(
    fieldDefs.map((f) => [f.field, f]),
  ) as Record<string, FieldDef>;

  return {
    fieldDefs,
    basicFieldDefs,
    hasAdvancedFields: fieldDefs.length > basicFieldDefs.length,
    fieldByKey,
    getOperator: (field, op) =>
      fieldByKey[field]?.operators.find((o) => o.op === op),
    formatValue,
  };
}

/** Shared numeric operator set (equals / greater / less …). */
export const numericOps: OperatorDef[] = [
  { op: "equals", label: "שווה ל", valueMode: "number" },
  { op: "gt", label: "גדול מ", valueMode: "number" },
  { op: "gte", label: "גדול או שווה ל", valueMode: "number" },
  { op: "lt", label: "קטן מ", valueMode: "number" },
  { op: "lte", label: "קטן או שווה ל", valueMode: "number" },
];

/** Shared free-text operator set (equals / contains). */
export const textOps: OperatorDef[] = [
  { op: "equals", label: "שווה ל", valueMode: "text" },
  { op: "contains", label: "מכיל בתוכו", valueMode: "text" },
];

/** Shared numeric comparison used by entity matchers. */
export function compareNumber(a: number, op: string, b: number): boolean {
  if (op === "equals") return a === b;
  if (op === "gt") return a > b;
  if (op === "gte") return a >= b;
  if (op === "lt") return a < b;
  if (op === "lte") return a <= b;
  return false;
}
