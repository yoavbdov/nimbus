import type { Coach } from "@/lib/coaches-data";
import type { CoachFormValues } from "@/lib/coach-form";
import { tournaments } from "@/lib/tournaments-data";

/** A small, stable string hash (djb2-ish) with a seed for independent draws. */
function hash(str: string, seed: number): number {
  let h = seed;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/**
 * The roster data only carries name + phone. The "edit coach" modal needs an
 * email too, which isn't stored — so we invent one from a stable hash of the
 * name, the same way the player details do, so it stays consistent across
 * reloads.
 */
export function coachFormValuesFor(coach: Coach): CoachFormValues {
  const [firstName, ...rest] = coach.name.trim().split(" ");
  const lastName = rest.join(" ");
  const h = hash(coach.name, 5381);

  return {
    id: coach.id,
    firstName,
    lastName,
    phone: coach.phone,
    email: `coach${1000 + (h % 9000)}@gmail.com`,
    notes: coach.notes ?? "",
  };
}

/**
 * The roster carries only the count of תחרויות a coach is assigned to, not their
 * names. The "שיוך לתחרות" modal needs names, so we pick a stable slice of the
 * tournament list, rotated by a hash of the coach's name so different coaches
 * get different competitions consistently across reloads.
 */
export function coachCompetitionsFor(coach: Coach): string[] {
  const count = Math.min(coach.competitions, tournaments.length);
  const offset = hash(coach.name, 7919) % tournaments.length;
  return Array.from(
    { length: count },
    (_, i) => tournaments[(offset + i) % tournaments.length].name,
  );
}
