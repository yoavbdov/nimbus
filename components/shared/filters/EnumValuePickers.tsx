"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useEnumPickerSearch } from "@/hooks/shared/useEnumPickerSearch";
import { cn } from "@/lib/utils";

function SearchBox({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <Search className="absolute top-1/2 -translate-y-1/2 inset-s-2.5 size-3.5 text-foreground/40 pointer-events-none" />
      <Input
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 ps-8 pe-2 text-xs neu-inset border-0 rounded-lg"
      />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="px-2 py-2 text-center text-xs text-foreground/40">
      אין תוצאות
    </div>
  );
}

const optionClass =
  "tint-indigo w-full flex items-center justify-center text-center px-2 py-1.5 rounded-md text-xs font-normal text-foreground hover:bg-foreground/8";

const selectedClass =
  "data-[state=on]:bg-(--tint-soft) data-[state=on]:text-foreground data-[state=on]:font-medium data-[state=on]:ring-1 data-[state=on]:ring-[color-mix(in_oklab,var(--tint)_35%,transparent)]";

export function SingleEnumPicker({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  const { query, setQuery, filtered } = useEnumPickerSearch(options);

  return (
    <div className="w-full space-y-1.5">
      <SearchBox value={query} onChange={setQuery} />
      <div className="w-full h-44 overflow-y-auto neu-inset rounded-lg p-1.5">
        {filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <ToggleGroup
            type="single"
            value={value}
            // a single picker always keeps a selection — ignore deselect events
            onValueChange={(v) => v && onChange(v)}
            className="flex flex-col gap-0.5 items-stretch w-full"
          >
            {filtered.map((opt) => (
              <ToggleGroupItem
                key={opt}
                value={opt}
                className={cn(optionClass, selectedClass)}
              >
                {opt}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        )}
      </div>
    </div>
  );
}

export function MultiEnumPicker({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const { query, setQuery, filtered } = useEnumPickerSearch(options);

  return (
    <div className="w-full space-y-1.5">
      <SearchBox value={query} onChange={setQuery} />
      <div className="w-full h-44 overflow-y-auto neu-inset rounded-lg p-1.5">
        {filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <ToggleGroup
            type="multiple"
            value={value}
            onValueChange={onChange}
            className="flex flex-col gap-0.5 items-stretch w-full"
          >
            {filtered.map((opt) => (
              <ToggleGroupItem
                key={opt}
                value={opt}
                className={cn(optionClass, selectedClass)}
              >
                {opt}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        )}
      </div>
    </div>
  );
}
