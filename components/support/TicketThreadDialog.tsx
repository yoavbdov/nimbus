"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Paperclip, Send, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SupportStatusBadge } from "@/components/support/SupportStatusBadge";
import {
  SUPPORT_CATEGORY_OPTIONS,
  type SupportTicket,
} from "@/lib/support-form";
import { cn } from "@/lib/utils";

const categoryLabel = (ticket: SupportTicket) =>
  SUPPORT_CATEGORY_OPTIONS.find((o) => o.value === ticket.category)?.label ??
  ticket.category;

const ease = [0.22, 1, 0.36, 1] as const;

const threadVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

const messageVariants = {
  hidden: { opacity: 0, y: 10, filter: "blur(4px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.3, ease },
  },
};

interface TicketThreadDialogProps {
  ticket: SupportTicket | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reply: string;
  onReplyChange: (value: string) => void;
  onSendReply: () => void;
  confirmingClose: boolean;
  onRequestCloseTicket: () => void;
  onCancelCloseTicket: () => void;
  onConfirmCloseTicket: () => void;
}

export function TicketThreadDialog({
  ticket,
  open,
  onOpenChange,
  reply,
  onReplyChange,
  onSendReply,
  confirmingClose,
  onRequestCloseTicket,
  onCancelCloseTicket,
  onConfirmCloseTicket,
}: TicketThreadDialogProps) {
  const isClosed = ticket?.status === "closed";

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          dir="rtl"
          className="top-[6vh] flex max-h-[88vh] max-w-2xl translate-y-0 flex-col gap-5"
        >
          {ticket && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between gap-3 pe-6">
                  <DialogTitle className="text-start">
                    {ticket.subject}
                  </DialogTitle>
                  <SupportStatusBadge status={ticket.status} />
                </div>
                <DialogDescription className="flex flex-wrap items-center gap-x-2 gap-y-1 text-start">
                  <span dir="ltr" className="num text-primary">
                    {ticket.id}
                  </span>
                  <span aria-hidden>·</span>
                  <span>{categoryLabel(ticket)}</span>
                  <span aria-hidden>·</span>
                  <span dir="ltr" className="num">
                    {ticket.createdAt}
                  </span>
                </DialogDescription>
              </DialogHeader>

              <motion.div
                key={ticket.id}
                variants={threadVariants}
                initial="hidden"
                animate="show"
                className="players-scroll -mx-1 min-h-0 flex-1 space-y-3 overflow-y-auto px-1 py-1"
              >
                {ticket.messages.map((m) => {
                  // Customer messages on the right, support on the left.
                  const mine = m.author === "user";
                  return (
                    <motion.div
                      key={m.id}
                      variants={messageVariants}
                      className={cn(
                        "flex",
                        mine ? "justify-start" : "justify-end",
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[80%] rounded-2xl border px-3.5 py-2.5",
                          mine
                            ? "rounded-tr-sm border-primary/40 bg-primary/10"
                            : "rounded-tl-sm border-foreground/15 bg-foreground/5",
                        )}
                      >
                        <div className="mb-1 flex items-center gap-2">
                          <span
                            className={cn(
                              "text-xs font-semibold",
                              mine
                                ? "text-primary"
                                : "text-emerald-600 dark:text-emerald-400",
                            )}
                          >
                            {m.authorName}
                          </span>
                          <span className="text-[0.65rem] text-muted-foreground/80 num">
                            {m.at}
                          </span>
                        </div>
                        <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">
                          {m.body}
                        </p>
                        {m.attachments?.map((file) => (
                          <div
                            key={file}
                            className="mt-2 flex w-fit items-center gap-1.5 rounded-lg border border-foreground/15 bg-background/40 px-2 py-1"
                          >
                            <FileText className="size-3.5 text-primary/70" />
                            <span className="text-xs text-foreground/80">
                              {file}
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>

              {isClosed ? (
                <p className="rounded-xl neu-inset bg-foreground/5 px-3 py-2.5 text-center text-sm text-muted-foreground">
                  הפנייה סגורה. לפתיחה מחדש פתחו פנייה חדשה.
                </p>
              ) : (
                <div className="space-y-2">
                  <Textarea
                    value={reply}
                    onChange={(e) => onReplyChange(e.target.value)}
                    placeholder="כתבו תגובה כדי להמשיך את הטיפול…"
                    className="h-auto min-h-20 rounded-xl neu-inset border-0 px-3 py-2 text-foreground placeholder:text-muted-foreground/70"
                  />
                  <Label className="group flex w-fit cursor-pointer items-center gap-2 rounded-xl neu-raised-xs neu-interactive px-3 py-2 text-sm text-foreground/80 transition-colors">
                    <Paperclip className="size-4 text-primary/70" />
                    <span>צירוף קובץ לתגובה</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*,.pdf"
                      className="sr-only"
                    />
                  </Label>
                </div>
              )}

              {!isClosed && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease, delay: 0.1 }}
                  className="mt-1 flex flex-col-reverse gap-2 border-t border-foreground/10 pt-4 sm:flex-row-reverse sm:justify-between"
                >
                  <Button
                    type="button"
                    disabled={!reply.trim()}
                    onClick={onSendReply}
                    className="rounded-xl gap-1.5"
                  >
                    <Send className="size-4" />
                    שליחת תגובה
                  </Button>
                  <Button
                    type="button"
                    onClick={onRequestCloseTicket}
                    className="rounded-xl gap-1.5 bg-destructive text-white shadow-sm hover:bg-destructive/90"
                  >
                    <CheckCircle2 className="size-4" />
                    סגירת הפנייה
                  </Button>
                </motion.div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={confirmingClose}
        onOpenChange={(v) => !v && onCancelCloseTicket()}
      >
        <DialogContent dir="rtl" className="max-w-sm">
          <DialogHeader>
            <DialogTitle>סגירת הפנייה?</DialogTitle>
            <DialogDescription>
              לאחר הסגירה לא ניתן יהיה להמשיך את ההתכתבות בפנייה זו. להמשך טיפול
              תצטרכו לפתוח פנייה חדשה.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:flex-row-reverse sm:justify-end">
            <Button
              type="button"
              onClick={onConfirmCloseTicket}
              className="rounded-xl gap-1.5 bg-destructive text-white hover:bg-destructive/90"
            >
              <CheckCircle2 className="size-4" />
              כן, סגרו את הפנייה
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={onCancelCloseTicket}
              className="rounded-xl"
            >
              ביטול
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
