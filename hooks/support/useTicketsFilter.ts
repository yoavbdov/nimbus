import { useState } from "react";
import { SAMPLE_TICKETS, type SupportStatus } from "@/lib/support-form";

/** "all" shows every ticket; otherwise filter to a single status. */
export type TicketStatusFilter = SupportStatus | "all";

/** Filters the ticket list by status. */
export function useTicketsFilter() {
  const [status, setStatus] = useState<TicketStatusFilter>("all");

  const tickets =
    status === "all"
      ? SAMPLE_TICKETS
      : SAMPLE_TICKETS.filter((t) => t.status === status);

  return { status, setStatus, tickets };
}
