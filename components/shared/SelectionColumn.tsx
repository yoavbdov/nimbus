"use client";

import { TableCell, TableHead } from "@/components/ui/table";
import { SelectCheckbox } from "@/components/shared/SelectCheckbox";
import type { RowSelection } from "@/hooks/useRowSelection";

/** Header cell holding the "select all rows" checkbox. */
export function SelectionHead({ selection }: { selection: RowSelection }) {
  return (
    <TableHead className="w-10 px-4 py-3 text-center">
      <div className="flex justify-center">
        <SelectCheckbox
          ariaLabel="בחר את כל השורות"
          checked={
            selection.allSelected
              ? true
              : selection.someSelected
                ? "indeterminate"
                : false
          }
          onCheckedChange={() => selection.toggleAll()}
        />
      </div>
    </TableHead>
  );
}

/** Body cell holding a single row's selection checkbox. */
export function SelectionCell({
  id,
  selection,
}: {
  id: string;
  selection: RowSelection;
}) {
  return (
    <TableCell className="w-10 px-4 py-3 text-center">
      <div className="flex justify-center">
        <SelectCheckbox
          ariaLabel="בחר שורה"
          checked={selection.isSelected(id)}
          onCheckedChange={() => selection.toggle(id)}
        />
      </div>
    </TableCell>
  );
}
