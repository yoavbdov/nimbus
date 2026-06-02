"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

function useFiltered(options: string[], query: string) {
  return useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.toLowerCase().includes(q));
  }, [options, query]);
}

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
  "bg-(--tint-soft) text-foreground font-medium ring-1 ring-[color-mix(in_oklab,var(--tint)_35%,transparent)]";

export function SingleEnumPicker({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  const [query, setQuery] = useState("");
  const filtered = useFiltered(options, query);

  return (
    <div className="w-full space-y-1.5">
      <SearchBox value={query} onChange={setQuery} />
      <div className="w-full h-44 overflow-y-auto neu-inset rounded-lg p-1.5 flex flex-col gap-0.5">
        {filtered.length === 0 ? (
          <EmptyState />
        ) : (
          filtered.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={cn(optionClass, value === opt && selectedClass)}
            >
              {opt}
            </button>
          ))
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
  const [query, setQuery] = useState("");
  const filtered = useFiltered(options, query);

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
                className={cn(
                  optionClass,
                  "data-[state=on]:bg-(--tint-soft) data-[state=on]:text-foreground data-[state=on]:font-medium data-[state=on]:ring-1 data-[state=on]:ring-[color-mix(in_oklab,var(--tint)_35%,transparent)]",
                )}
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
