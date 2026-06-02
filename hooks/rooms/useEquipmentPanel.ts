import { useState } from "react";
import { equipment as allEquipment, filterEquipment } from "@/lib/rooms-data";

/** Owns the equipment search state and derives the filtered list + counts. */
export function useEquipmentPanel() {
  const [search, setSearch] = useState("");
  const filtered = filterEquipment(search);

  return { search, setSearch, filtered, total: allEquipment.length };
}
