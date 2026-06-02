import { useState } from "react";
import { rooms as allRooms, filterRooms } from "@/lib/rooms-data";

/** Owns the rooms search state and derives the filtered list + counts. */
export function useRoomsPanel() {
  const [search, setSearch] = useState("");
  const filtered = filterRooms(search);

  return { search, setSearch, filtered, total: allRooms.length };
}
