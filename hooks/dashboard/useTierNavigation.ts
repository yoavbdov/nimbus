import { useRouter } from "next/navigation";

/** Navigates to the players page pre-filtered by a rating range. */
export function useTierNavigation() {
  const router = useRouter();

  return function goToPlayers(min: number, max: number) {
    const params = new URLSearchParams({
      ratingMin: String(min),
      ratingMax: String(max),
    });
    router.push(`/players?${params.toString()}`);
  };
}
