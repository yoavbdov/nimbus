"use client";

import { BookmarkPlus, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  PlaceholderLegend,
  type LegendEntry,
} from "@/components/tools/whatsapp/PlaceholderLegend";
import { EmojiBar } from "@/components/tools/whatsapp/EmojiBar";
import { useEmojiInsert } from "@/hooks/shared/useEmojiInsert";
import {
  type InvitableActivity,
  type NotesTemplate,
} from "@/lib/whatsapp-templates";

const triggerCenter =
  "h-10 w-60 rounded-xl neu-raised-xs border-0 text-sm text-center [&_[data-slot=select-value]]:flex-1 [&_[data-slot=select-value]]:justify-center";
const contentCenter =
  "[&_[data-slot=select-item]]:justify-center [&_[data-slot=select-item]]:pl-8 [&_[data-slot=select-item]]:text-center [&_[data-slot=select-item]]:text-sm";

interface WhatsAppInviteProps {
  activities: InvitableActivity[];
  activityId: string;
  onActivityChange: (id: string) => void;
  activity: InvitableActivity | null;
  templates: NotesTemplate[];
  templateId: string;
  onTemplateChange: (id: string) => void;
  templatePendingDelete: string | null;
  onRequestDeleteTemplate: (id: string) => void;
  onCancelDeleteTemplate: () => void;
  onConfirmDeleteTemplate: () => void;
  body: string;
  onBodyChange: (value: string) => void;
  newTemplateName: string;
  onNewTemplateNameChange: (value: string) => void;
  onSaveTemplate: () => void;
  message: string;
  onSend: () => void;
}

export function WhatsAppInvite({
  activities,
  activityId,
  onActivityChange,
  activity,
  templates,
  templateId,
  onTemplateChange,
  templatePendingDelete,
  onRequestDeleteTemplate,
  onCancelDeleteTemplate,
  onConfirmDeleteTemplate,
  body,
  onBodyChange,
  newTemplateName,
  onNewTemplateNameChange,
  onSaveTemplate,
  message,
  onSend,
}: WhatsAppInviteProps) {
  const { ref: bodyRef, insert: insertEmoji } = useEmojiInsert(
    body,
    onBodyChange,
  );

  const pendingName =
    templates.find((t) => t.id === templatePendingDelete)?.name ?? "";

  const legend: LegendEntry[] = activity
    ? [
        { token: "{שם}", value: `${activity.kind} ${activity.name}` },
        { token: "{תאריך}", value: activity.date },
        { token: "{ימים}", value: activity.daysLabel },
        { token: "{שעות}", value: activity.timeRange },
        { token: "{טווח}", value: activity.rangeLabel },
        { token: "{חדר}", value: activity.room },
      ]
    : [];

  return (
    <div className="space-y-5">
      {/* Top: pickers (right) + save-template (left) */}
      <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-foreground/70">
              פעילות
            </span>
            <Select value={activityId} onValueChange={onActivityChange}>
              <SelectTrigger className={triggerCenter}>
                <SelectValue placeholder="בחירה" />
              </SelectTrigger>
              <SelectContent
                dir="rtl"
                position="popper"
                className={contentCenter}
              >
                {activities.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.kind} · {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-foreground/70">
              תבנית
            </span>
            <Select value={templateId} onValueChange={onTemplateChange}>
              <SelectTrigger className={triggerCenter}>
                <SelectValue placeholder="בחירה" />
              </SelectTrigger>
              <SelectContent
                dir="rtl"
                position="popper"
                className={contentCenter}
              >
                {templates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => templateId && onRequestDeleteTemplate(templateId)}
              disabled={!templateId}
              aria-label="מחיקת התבנית הנבחרת"
              className="rounded-lg text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Input
            value={newTemplateName}
            onChange={(e) => onNewTemplateNameChange(e.target.value)}
            placeholder="שם לתבנית חדשה"
            className="h-8 w-44 rounded-lg neu-inset border-0 text-center text-xs text-muted-foreground placeholder:text-muted-foreground"
          />
          <Button
            type="button"
            size="sm"
            onClick={onSaveTemplate}
            disabled={!newTemplateName.trim()}
            className="h-8 gap-1.5 rounded-lg"
          >
            <BookmarkPlus className="size-3.5" />
            שמירת תבנית
          </Button>
        </div>
      </div>

      {/* Message editor — legend (resolved values), then title + emojis, then content */}
      <div className="space-y-2">
        {legend.length > 0 && (
          <div className="rounded-xl bg-foreground/3 px-3 py-2.5">
            <PlaceholderLegend entries={legend} />
          </div>
        )}
        <Label className="text-sm font-medium text-foreground/80">
          תוכן ההודעה
        </Label>
        <Textarea
          ref={bodyRef}
          value={body}
          onChange={(e) => onBodyChange(e.target.value)}
          className="min-h-32 rounded-xl neu-inset border-0 px-3.5 py-3 text-sm leading-relaxed text-foreground"
        />
        <EmojiBar onPick={insertEmoji} />
      </div>

      {/* Preview + send */}
      <div className="space-y-2.5">
        <Label className="text-sm font-medium text-foreground/80">
          תצוגה מקדימה
        </Label>
        <div className="relative overflow-hidden rounded-2xl border border-emerald-500/25 bg-emerald-500/5 px-4 py-3.5">
          <span className="absolute inset-y-0 right-0 w-1 bg-emerald-500/60" />
          <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">
            {message}
          </p>
        </div>
        <Button
          type="button"
          size="lg"
          onClick={onSend}
          disabled={!message.trim()}
          className="w-full gap-2 rounded-xl bg-emerald-600 text-base font-semibold text-white shadow-md hover:bg-emerald-600/90"
        >
          <Send className="size-5" />
          פתיחת וואטסאפ
        </Button>
      </div>

      <Dialog
        open={templatePendingDelete !== null}
        onOpenChange={(v) => !v && onCancelDeleteTemplate()}
      >
        <DialogContent dir="rtl" className="max-w-sm">
          <DialogHeader>
            <DialogTitle>מחיקת תבנית?</DialogTitle>
            <DialogDescription>
              {pendingName ? `התבנית "${pendingName}" ` : "התבנית "}תימחק
              לצמיתות.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:flex-row-reverse sm:justify-end">
            <Button
              type="button"
              onClick={onConfirmDeleteTemplate}
              className="gap-1.5 rounded-xl bg-destructive text-white hover:bg-destructive/90"
            >
              <Trash2 className="size-4" />
              כן, מחק
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={onCancelDeleteTemplate}
              className="rounded-xl"
            >
              ביטול
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
