"use client";

import { motion } from "framer-motion";
import { Minus, Plus, Send, CircleCheck, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  PlaceholderLegend,
  type LegendEntry,
} from "@/components/tools/whatsapp/PlaceholderLegend";
import { EmojiBar } from "@/components/tools/whatsapp/EmojiBar";
import { useEmojiInsert } from "@/hooks/shared/useEmojiInsert";
import { type AbsenceStreak } from "@/lib/whatsapp-absences";

const legend: LegendEntry[] = [
  { token: "{שם}", value: "שם התלמיד" },
  { token: "{חוג}", value: "שם החוג" },
  { token: "{היעדרויות}", value: "מספר ההיעדרויות" },
  { token: "{תאריך}", value: "התאריך האחרון" },
];

const itemVariants = {
  hidden: { opacity: 0, y: 8, filter: "blur(4px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const },
  },
};

interface WhatsAppAbsencesProps {
  threshold: number;
  onThresholdChange: (value: number) => void;
  absenceBody: string;
  onAbsenceBodyChange: (value: string) => void;
  absentees: AbsenceStreak[];
  onSend: (item: AbsenceStreak) => void;
}

export function WhatsAppAbsences({
  threshold,
  onThresholdChange,
  absenceBody,
  onAbsenceBodyChange,
  absentees,
  onSend,
}: WhatsAppAbsencesProps) {
  const { ref: bodyRef, insert: insertEmoji } = useEmojiInsert(
    absenceBody,
    onAbsenceBodyChange,
  );

  return (
    <div className="space-y-5">
      {/* Message composer */}
      <div className="rounded-xl bg-foreground/3 px-3 py-2.5">
        <PlaceholderLegend entries={legend} />
      </div>
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground/80">
          תוכן ההודעה להורים
        </Label>
        <Textarea
          ref={bodyRef}
          value={absenceBody}
          onChange={(e) => onAbsenceBodyChange(e.target.value)}
          className="min-h-28 rounded-xl neu-inset border-0 px-3.5 py-3 text-sm leading-relaxed text-foreground"
        />
        <EmojiBar onPick={insertEmoji} />
      </div>

      {/* Compact threshold setting */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>הצגת תלמידים שנעדרו לפחות</span>
        <div className="inline-flex items-center gap-0.5 rounded-lg neu-inset p-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => onThresholdChange(Math.max(1, threshold - 1))}
            aria-label="הפחתה"
            className="rounded-md"
          >
            <Minus className="size-3" />
          </Button>
          <span className="w-6 text-center text-sm font-semibold text-primary num">
            {threshold}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => onThresholdChange(threshold + 1)}
            aria-label="הוספה"
            className="rounded-md"
          >
            <Plus className="size-3" />
          </Button>
        </div>
        <span>מפגשים ברצף</span>
      </div>

      {absentees.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-12 text-center">
          <CircleCheck className="size-8 text-emerald-500" />
          <p className="text-sm text-muted-foreground">
            אין תלמידים שנעדרו {threshold} מפגשים ברצף.
          </p>
        </div>
      ) : (
        <div className="grid gap-2.5 sm:grid-cols-2">
          {absentees.map((item) => (
            <motion.div
              key={`${item.classId}-${item.studentId}`}
              variants={itemVariants}
              initial="hidden"
              animate="show"
              className="group flex items-center gap-3 rounded-2xl neu-inset p-3"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-destructive/10">
                <UserX className="size-4 text-destructive" />
              </div>

              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-semibold text-foreground">
                    {item.studentName}
                  </span>
                  <span className="shrink-0 rounded-full bg-destructive/15 px-2 py-0.5 text-[0.65rem] font-medium text-destructive num">
                    ×{item.streak}
                  </span>
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  {item.className} · מ-
                  <span className="num" dir="ltr">
                    {item.lastSeen}
                  </span>
                </p>
              </div>

              <Button
                type="button"
                size="icon-sm"
                onClick={() => onSend(item)}
                aria-label={`שליחת הודעה להורי ${item.studentName}`}
                className="shrink-0 rounded-xl bg-emerald-600 text-white hover:bg-emerald-600/90"
              >
                <Send className="size-3.5" />
              </Button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
