"use client";

import { motion } from "framer-motion";
import { Paperclip } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SupportStatusBadge } from "@/components/support/SupportStatusBadge";
import { TicketThreadDialog } from "@/components/support/TicketThreadDialog";
import { useTicketThread } from "@/hooks/support/useTicketThread";
import {
  useTicketsFilter,
  type TicketStatusFilter,
} from "@/hooks/support/useTicketsFilter";
import {
  SUPPORT_CATEGORY_OPTIONS,
  SUPPORT_PRIORITY_OPTIONS,
  SUPPORT_STATUS_LABELS,
  type SupportCategory,
  type SupportPriority,
  type SupportStatus,
} from "@/lib/support-form";
import { cn } from "@/lib/utils";

const categoryLabel = (value: SupportCategory) =>
  SUPPORT_CATEGORY_OPTIONS.find((o) => o.value === value)?.label ?? value;
const priorityLabel = (value: SupportPriority) =>
  SUPPORT_PRIORITY_OPTIONS.find((o) => o.value === value)?.label ?? value;

const headClass =
  "px-3 py-2.5 text-center text-[0.7rem] font-medium uppercase tracking-[0.14em] text-foreground/70";
const cellClass = "px-3 py-2.5 text-center text-sm text-foreground/85";

const bodyVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.04 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10, filter: "blur(4px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function SupportTicketsList() {
  const thread = useTicketThread();
  const { status, setStatus, tickets } = useTicketsFilter();

  const statuses: SupportStatus[] = ["new", "in_progress", "closed"];

  return (
    <motion.div variants={bodyVariants} initial="hidden" animate="show">
      <Card className="tint-indigo glass shadow-depth-xl border-0 ring-0 rounded-3xl gap-0 py-0 overflow-hidden">
        <div className="h-1 tint-bar" />
        <div className="p-5 sm:p-6">
          <motion.div variants={itemVariants} className="mb-4 space-y-3">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-foreground">
                הפניות שלי
              </h2>
              <span className="text-xs text-muted-foreground num">
                ({tickets.length})
              </span>
            </div>

            <Select
              value={status}
              onValueChange={(v) => setStatus(v as TicketStatusFilter)}
            >
              <SelectTrigger className="h-8 w-32 gap-1.5 rounded-xl neu-inset border-0 text-center [&_[data-slot=select-value]]:flex-1 [&_[data-slot=select-value]]:justify-center">
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                dir="rtl"
                position="popper"
                className="[&_[data-slot=select-item]]:justify-center [&_[data-slot=select-item]]:pl-8 [&_[data-slot=select-item]]:text-center"
              >
                <SelectItem value="all">כל הסטטוסים</SelectItem>
                {statuses.map((s) => (
                  <SelectItem key={s} value={s}>
                    {SUPPORT_STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>

          <motion.div variants={itemVariants} className="neu-inset rounded-2xl p-2">
            <Table>
              <TableHeader className="[&_tr]:border-b-2 [&_tr]:border-border">
                <TableRow className="hover:bg-transparent">
                  <TableHead className={headClass}>מספר</TableHead>
                  <TableHead className={cn(headClass, "text-start")}>
                    נושא
                  </TableHead>
                  <TableHead className={headClass}>סוג</TableHead>
                  <TableHead className={headClass}>דחיפות</TableHead>
                  <TableHead className={headClass}>סטטוס</TableHead>
                  <TableHead className={headClass}>תאריך</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((t, i) => (
                  <TableRow
                    key={t.id}
                    onClick={() => thread.openTicket(t.id)}
                    className={cn(
                      "cursor-pointer border-b-2 border-foreground/10 transition-colors duration-150 hover:bg-primary/15",
                      i % 2 === 1 && "bg-primary/10",
                    )}
                  >
                    <TableCell
                      className={cn(cellClass, "font-medium text-primary num")}
                      dir="ltr"
                    >
                      {t.id}
                    </TableCell>
                    <TableCell
                      className={cn(
                        cellClass,
                        "text-start font-medium text-foreground",
                      )}
                    >
                      <span className="flex items-center gap-1.5">
                        {t.subject}
                        {t.messages.some((m) => m.attachments?.length) && (
                          <Paperclip
                            className="size-3.5 shrink-0 text-muted-foreground"
                            aria-label="מכילה קובץ מצורף"
                          />
                        )}
                      </span>
                    </TableCell>
                    <TableCell className={cellClass}>
                      {categoryLabel(t.category)}
                    </TableCell>
                    <TableCell className={cellClass}>
                      {priorityLabel(t.priority)}
                    </TableCell>
                    <TableCell className={cellClass}>
                      <div className="flex justify-center">
                        <SupportStatusBadge status={t.status} />
                      </div>
                    </TableCell>
                    <TableCell className={cn(cellClass, "num")} dir="ltr">
                      {t.createdAt}
                    </TableCell>
                  </TableRow>
                ))}
                {tickets.length === 0 && (
                  <TableRow className="hover:bg-transparent">
                    <TableCell
                      colSpan={6}
                      className="px-3 py-10 text-center text-sm text-muted-foreground"
                    >
                      אין פניות בסטטוס זה.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </motion.div>
        </div>
      </Card>

      <TicketThreadDialog
        ticket={thread.selected}
        open={thread.open}
        onOpenChange={(v) => !v && thread.close()}
        reply={thread.reply}
        onReplyChange={thread.setReply}
        onSendReply={thread.sendReply}
        confirmingClose={thread.confirmingClose}
        onRequestCloseTicket={thread.requestCloseTicket}
        onCancelCloseTicket={thread.cancelCloseTicket}
        onConfirmCloseTicket={thread.confirmCloseTicket}
      />
    </motion.div>
  );
}
