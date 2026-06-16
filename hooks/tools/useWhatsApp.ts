"use client";

import { useMemo, useState } from "react";
import {
  buildInvitationMessage,
  defaultNotesTemplates,
  invitableActivities,
  openWhatsApp,
  type NotesTemplate,
} from "@/lib/whatsapp-templates";
import {
  absenceStreaksAtLeast,
  DEFAULT_ABSENCE_TEMPLATE,
  DEFAULT_ABSENCE_THRESHOLD,
  fillAbsenceMessage,
  type AbsenceStreak,
} from "@/lib/whatsapp-absences";

export type WhatsAppView = "invite" | "absences";

/**
 * Drives the WhatsApp tool: building tournament/class invitations from an
 * editable notes template, saving templates, and the consecutive-absence
 * alerts. Templates are kept in memory (mock data).
 */
export function useWhatsApp() {
  const [view, setView] = useState<WhatsAppView>("invite");

  // ── Invitations ──
  const [activityId, setActivityId] = useState(invitableActivities[0]?.id ?? "");
  const [templates, setTemplates] = useState<NotesTemplate[]>(
    defaultNotesTemplates,
  );
  const [templateId, setTemplateId] = useState(defaultNotesTemplates[0]?.id ?? "");
  const [body, setBody] = useState(defaultNotesTemplates[0]?.body ?? "");
  const [newTemplateName, setNewTemplateName] = useState("");

  const activity = useMemo(
    () => invitableActivities.find((a) => a.id === activityId) ?? null,
    [activityId],
  );

  const selectTemplate = (id: string) => {
    setTemplateId(id);
    const tpl = templates.find((t) => t.id === id);
    if (tpl) setBody(tpl.body);
  };

  const [templatePendingDelete, setTemplatePendingDelete] = useState<
    string | null
  >(null);

  const requestDeleteTemplate = (id: string) => setTemplatePendingDelete(id);
  const cancelDeleteTemplate = () => setTemplatePendingDelete(null);

  const confirmDeleteTemplate = () => {
    const id = templatePendingDelete;
    if (!id) return;
    setTemplates((prev) => {
      const next = prev.filter((t) => t.id !== id);
      if (id === templateId) {
        const fallback = next[0];
        setTemplateId(fallback?.id ?? "");
        if (fallback) setBody(fallback.body);
      }
      return next;
    });
    setTemplatePendingDelete(null);
  };

  const saveTemplate = () => {
    const name = newTemplateName.trim();
    if (!name) return;
    const tpl: NotesTemplate = {
      id: `tpl-${Date.now()}`,
      name,
      body,
    };
    setTemplates((prev) => [...prev, tpl]);
    setTemplateId(tpl.id);
    setNewTemplateName("");
  };

  const message = useMemo(
    () => (activity ? buildInvitationMessage(activity, body) : ""),
    [activity, body],
  );

  const sendInvitation = () => {
    if (message) openWhatsApp(message);
  };

  // ── Absence alerts ──
  const [threshold, setThreshold] = useState(DEFAULT_ABSENCE_THRESHOLD);
  const [absenceBody, setAbsenceBody] = useState(DEFAULT_ABSENCE_TEMPLATE);
  const absentees = useMemo(
    () => absenceStreaksAtLeast(threshold),
    [threshold],
  );

  const sendAbsenceAlert = (item: AbsenceStreak) => {
    openWhatsApp(fillAbsenceMessage(absenceBody, item));
  };

  return {
    view,
    setView,
    // invitations
    activities: invitableActivities,
    activityId,
    setActivityId,
    activity,
    templates,
    templateId,
    selectTemplate,
    templatePendingDelete,
    requestDeleteTemplate,
    cancelDeleteTemplate,
    confirmDeleteTemplate,
    body,
    setBody,
    newTemplateName,
    setNewTemplateName,
    saveTemplate,
    message,
    sendInvitation,
    // absences
    threshold,
    setThreshold,
    absenceBody,
    setAbsenceBody,
    absentees,
    sendAbsenceAlert,
  };
}
