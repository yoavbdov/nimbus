"use client";

import { AnimatePresence, motion } from "framer-motion";
import { BookmarkPlus, CheckCircle2, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToolBackLink } from "@/components/tools/ToolBackLink";
import { SavedRosterCard } from "@/components/tools/rosters/SavedRosterCard";
import { useRosters } from "@/hooks/tools/useRosters";

const itemVariants = {
  hidden: { opacity: 0, y: 10, filter: "blur(4px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function RostersView() {
  const {
    activities,
    sourceId,
    source,
    selectSource,
    listName,
    setListName,
    saved,
    saveCurrent,
    removeSaved,
    targetIds,
    setTarget,
    exportToActivity,
    exportNotice,
  } = useRosters();

  return (
    <div className="space-y-4">
      <ToolBackLink />

      <Card className="tint-indigo glass shadow-depth-xl border-0 ring-0 rounded-3xl gap-0 py-0 overflow-hidden">
        <div className="h-1 tint-bar" />
        <div className="p-6 space-y-5">
          <div className="space-y-1.5">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight tint-text leading-none">
              רשימות שחקנים
            </h1>
            <p className="text-xs text-muted-foreground/80">
              בחרו פעילות, שמרו את רשימת השחקנים שלה, וייצאו אותה אל פעילות אחרת.
            </p>
          </div>

          <Separator className="bg-foreground/8" />

          {/* Source picker + save */}
          <div className="space-y-3 rounded-2xl neu-inset p-4">
            <div className="flex flex-wrap items-end gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  פעילות מקור
                </Label>
                <Select value={sourceId} onValueChange={selectSource}>
                  <SelectTrigger className="h-9 w-52 gap-1.5 rounded-xl neu-raised-xs border-0">
                    <SelectValue placeholder="בחירת פעילות" />
                  </SelectTrigger>
                  <SelectContent dir="rtl" position="popper">
                    {activities.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 space-y-1.5 min-w-48">
                <Label className="text-xs text-muted-foreground">
                  שם הרשימה (לא חובה)
                </Label>
                <Input
                  value={listName}
                  onChange={(e) => setListName(e.target.value)}
                  placeholder={source?.name ?? ""}
                  className="h-9 rounded-xl neu-raised-xs border-0"
                />
              </div>

              <Button
                type="button"
                onClick={saveCurrent}
                disabled={!source}
                className="h-9 gap-1.5 rounded-xl"
              >
                <BookmarkPlus className="size-4" />
                שמירת רשימה
              </Button>
            </div>

            {source && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="size-3.5" />
                  {source.players.length} שחקנים:
                </span>
                {source.players.map((p) => (
                  <span
                    key={p.id}
                    className="rounded-lg border border-foreground/10 bg-background/40 px-2 py-1 text-xs text-foreground/80"
                  >
                    {p.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          <AnimatePresence>
            {exportNotice && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-700 dark:text-emerald-300"
              >
                <CheckCircle2 className="size-4 shrink-0" />
                {exportNotice}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Saved lists */}
          <div className="space-y-3">
            <h2 className="text-base font-semibold text-foreground">
              רשימות שמורות{" "}
              <span className="text-xs text-muted-foreground num">
                ({saved.length})
              </span>
            </h2>

            {saved.length === 0 ? (
              <p className="rounded-xl neu-inset bg-foreground/5 px-3 py-6 text-center text-sm text-muted-foreground">
                עדיין לא שמרתם רשימות. בחרו פעילות מקור ולחצו על שמירת רשימה.
              </p>
            ) : (
              <div className="grid gap-3 lg:grid-cols-2">
                <AnimatePresence initial={false}>
                  {saved.map((roster) => (
                    <motion.div
                      key={roster.id}
                      variants={itemVariants}
                      initial="hidden"
                      animate="show"
                      exit={{ opacity: 0, scale: 0.97 }}
                    >
                      <SavedRosterCard
                        roster={roster}
                        activities={activities}
                        targetId={targetIds[roster.id]}
                        onTargetChange={(id) => setTarget(roster.id, id)}
                        onExport={() => exportToActivity(roster)}
                        onRemove={() => removeSaved(roster.id)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
