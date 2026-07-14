"use client";

import { motion } from "framer-motion";
import { Check, FileUp, Gauge, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ToolBackLink } from "@/components/tools/ToolBackLink";
import { RatingConfirmDialog } from "@/components/tools/rating/RatingConfirmDialog";
import { RatingExcelModal } from "@/components/tools/rating/RatingExcelModal";
import { RatingUpdateTable } from "@/components/tools/rating/RatingUpdateTable";
import { useRatingUpdate } from "@/hooks/tools/useRatingUpdate";

const ease = [0.22, 1, 0.36, 1] as const;

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12, filter: "blur(4px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.4, ease },
  },
};

export function RatingUpdateView() {
  const {
    visiblePlayers,
    query,
    setQuery,
    drafts,
    setDraft,
    filledCount,
    hasChanges,
    confirmOpen,
    requestConfirm,
    cancelConfirm,
    confirmUpdate,
    excelOpen,
    openExcelModal,
    closeExcelModal,
    exportToExcel,
    droppedFileName,
    handleFileDrop,
    clearDroppedFile,
    confirmExcelImport,
  } = useRatingUpdate();

  return (
    <div className="space-y-4">
      <ToolBackLink />

      <Card className="tint-indigo glass shadow-depth-xl border-0 ring-0 rounded-3xl gap-0 py-0 overflow-hidden">
        <div className="h-1 tint-bar" />
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="p-6 space-y-5"
        >
          {/* ── Header ─────────────────────────────────────────────── */}
          <motion.div variants={itemVariants} className="space-y-1.5">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight tint-text leading-none">
              עדכון מד כושר מרוכז
            </h1>
            <p className="text-xs text-muted-foreground/80">
              עדכנו מד כושר לכמה שחקנים בבת אחת — ישירות בטבלה או דרך קובץ אקסל.
            </p>
          </motion.div>

          {/* ── Excel import ───────────────────────────────────────── */}
          <motion.div variants={itemVariants}>
            <Button
              type="button"
              onClick={openExcelModal}
              className="group/btn relative h-10 w-fit gap-1.5 overflow-hidden rounded-xl px-4 text-sm font-medium neu-raised-xs neu-interactive bg-transparent text-foreground hover:bg-transparent"
            >
              <span className="absolute inset-x-0 top-0 h-1 tint-bar origin-center scale-x-0 transition-transform duration-700 ease-out group-hover/btn:scale-x-100" />
              <FileUp className="size-4 text-[#217346]" />
              עדכון לפי טבלת אקסל
            </Button>
          </motion.div>

          {/* ── Actions ────────────────────────────────────────────── */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center justify-start gap-3 rounded-2xl neu-inset bg-foreground/5 px-4 py-3"
          >
            <Button
              type="button"
              onClick={requestConfirm}
              disabled={!hasChanges}
              className="h-10 gap-2 rounded-xl px-5 font-medium shadow-depth-md transition-transform duration-150 hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-50"
            >
              <Check className="size-4" />
              עדכון
            </Button>
            <Badge
              variant="secondary"
              className="gap-1.5 rounded-full border-0 bg-primary/15 px-3.5 py-1.5 text-xs font-medium text-primary"
            >
              <Gauge className="size-3.5" />
              <span className="num">{filledCount}</span> שחקנים מסומנים לעדכון
            </Badge>
          </motion.div>

          {/* ── Search ─────────────────────────────────────────────── */}
          <motion.div variants={itemVariants} className="relative">
            <Search className="absolute top-1/2 -translate-y-1/2 inset-s-3 size-4 text-foreground/50 pointer-events-none" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="חיפוש לפי שם שחקן"
              className="h-11 ps-10 pe-3 text-sm neu-inset border-0 rounded-2xl"
            />
          </motion.div>

          {/* ── Table ──────────────────────────────────────────────── */}
          <motion.div variants={itemVariants}>
            <RatingUpdateTable
              players={visiblePlayers}
              drafts={drafts}
              onDraftChange={setDraft}
            />
          </motion.div>
        </motion.div>
      </Card>

      <RatingConfirmDialog
        open={confirmOpen}
        count={filledCount}
        onConfirm={confirmUpdate}
        onCancel={cancelConfirm}
      />

      <RatingExcelModal
        open={excelOpen}
        fileName={droppedFileName}
        onOpenChange={(o) => !o && closeExcelModal()}
        onExport={exportToExcel}
        onFileDrop={handleFileDrop}
        onClearFile={clearDroppedFile}
        onConfirm={confirmExcelImport}
      />
    </div>
  );
}
