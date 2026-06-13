import { useState } from "react";
import { SAMPLE_TICKETS, type SupportTicket } from "@/lib/support-form";

/**
 * Tracks which ticket is open in the thread dialog and the in-progress reply.
 * Sending a reply and closing a ticket are no-ops for now (no backend) — they
 * simply close the dialog — but all the state lives here so the dialog stays
 * presentational.
 */
export function useTicketThread() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [confirmingClose, setConfirmingClose] = useState(false);

  const selected: SupportTicket | null =
    SAMPLE_TICKETS.find((t) => t.id === selectedId) ?? null;

  function openTicket(id: string) {
    setSelectedId(id);
    setReply("");
    setConfirmingClose(false);
  }

  function close() {
    setSelectedId(null);
    setConfirmingClose(false);
  }

  function sendReply() {
    // No backend yet — just clear the box.
    setReply("");
  }

  /** Ask for confirmation before closing the ticket. */
  function requestCloseTicket() {
    setConfirmingClose(true);
  }

  function cancelCloseTicket() {
    setConfirmingClose(false);
  }

  function confirmCloseTicket() {
    // No backend yet — just dismiss everything.
    close();
  }

  return {
    selected,
    open: selected !== null,
    openTicket,
    close,
    reply,
    setReply,
    sendReply,
    confirmingClose,
    requestCloseTicket,
    cancelCloseTicket,
    confirmCloseTicket,
  };
}
