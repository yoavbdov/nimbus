export interface LegendEntry {
  token: string;
  value: string;
}

/** Centered legend that maps each placeholder to its resolved value/meaning. */
export function PlaceholderLegend({ entries }: { entries: LegendEntry[] }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-2">
      {entries.map((e) => (
        <span
          key={e.token}
          className="inline-flex items-center gap-1.5 rounded-full bg-background/50 px-3 py-1.5 text-sm"
        >
          <code className="text-sm text-primary">{e.token}</code>
          <span className="text-sm text-muted-foreground">=</span>
          <span className="text-sm font-medium text-foreground/85">{e.value}</span>
        </span>
      ))}
    </div>
  );
}
