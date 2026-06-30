"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, UserX } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ToolBackLink } from "@/components/tools/ToolBackLink";
import { ToolTabs, type ToolTab } from "@/components/tools/ToolTabs";
import { WhatsAppInvite } from "@/components/tools/whatsapp/WhatsAppInvite";
import { WhatsAppAbsences } from "@/components/tools/whatsapp/WhatsAppAbsences";
import { useWhatsApp, type WhatsAppView as View } from "@/hooks/tools/useWhatsApp";

const tabs: ToolTab<View>[] = [
  { key: "invite", label: "הזמנה לפעילות", icon: MessageCircle },
  { key: "absences", label: "התראות היעדרות", icon: UserX },
];

export function WhatsAppView() {
  const wa = useWhatsApp();

  return (
    <div className="space-y-4">
      <ToolBackLink />

      <Card className="tint-indigo glass shadow-depth-xl border-0 ring-0 rounded-3xl gap-0 py-0 overflow-hidden">
        <div className="h-1 tint-bar" />
        <div className="p-6 space-y-5">
          <div className="space-y-1.5">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight tint-text leading-none">
              שליחת וואטסאפ
            </h1>
            <p className="text-xs text-muted-foreground/80">
              יצירת הודעות הזמנה לפי פרטי הפעילות, שמירת תבניות, והתראות להורים של
              תלמידים שנעדרו ברצף.
            </p>
          </div>

          <Separator className="bg-foreground/8" />

          <ToolTabs
            layoutId="whatsapp-tab"
            tabs={tabs}
            value={wa.view}
            onChange={wa.setView}
          />

          <AnimatePresence mode="wait">
            <motion.div
              key={wa.view}
              initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -4, filter: "blur(2px)" }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              {wa.view === "invite" ? (
                <WhatsAppInvite
                  courses={wa.courses}
                  courseId={wa.courseId}
                  onCourseChange={wa.setCourseId}
                  course={wa.course}
                  templates={wa.templates}
                  templateId={wa.templateId}
                  onTemplateChange={wa.selectTemplate}
                  templatePendingDelete={wa.templatePendingDelete}
                  onRequestDeleteTemplate={wa.requestDeleteTemplate}
                  onCancelDeleteTemplate={wa.cancelDeleteTemplate}
                  onConfirmDeleteTemplate={wa.confirmDeleteTemplate}
                  body={wa.body}
                  onBodyChange={wa.setBody}
                  newTemplateName={wa.newTemplateName}
                  onNewTemplateNameChange={wa.setNewTemplateName}
                  onSaveTemplate={wa.saveTemplate}
                  message={wa.message}
                  onSend={wa.sendInvitation}
                />
              ) : (
                <WhatsAppAbsences
                  threshold={wa.threshold}
                  onThresholdChange={wa.setThreshold}
                  absenceBody={wa.absenceBody}
                  onAbsenceBodyChange={wa.setAbsenceBody}
                  absentees={wa.absentees}
                  onSend={wa.sendAbsenceAlert}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </Card>
    </div>
  );
}
