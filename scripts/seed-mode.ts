/**
 * Which dataset a seed run writes. Shared by scripts/seed.ts (Admin SDK) and
 * scripts/seed-client.ts (Client SDK) so the two never drift apart.
 *
 *   full   (default)  the whole curated demo club, conflicts included
 *   basics --basics   resources only: 20 players, 5 coaches, 5 rooms,
 *                     5 equipment types — nothing scheduled
 *   empty  --empty    every collection cleared, club doc kept
 */
export type SeedMode = "full" | "basics" | "empty";

export function seedMode(argv: string[] = process.argv): SeedMode {
  if (argv.includes("--empty")) return "empty";
  if (argv.includes("--basics")) return "basics";
  return "full";
}

/**
 * Returns the per-collection chooser for a mode. `basics` defaults to an empty
 * list, so a collection the basics variant does not include needs no argument.
 */
export function pickFor(mode: SeedMode) {
  return <T>(full: T[], basics: T[] = []): T[] => {
    if (mode === "empty") return [];
    return mode === "basics" ? basics : full;
  };
}
