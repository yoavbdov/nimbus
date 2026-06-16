"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  Eye,
  Pencil,
  Plus,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ToolBackLink } from "@/components/tools/ToolBackLink";
import { RosterNameDialog } from "@/components/tools/rosters/RosterNameDialog";
import { MemberPickerDialog } from "@/components/tools/rosters/MemberPickerDialog";
import { ConfirmDialog } from "@/components/tools/rosters/ConfirmDialog";
import { useRosters } from "@/hooks/tools/useRosters";

const ease = [0.22, 1, 0.36, 1] as const;

const itemVariants = {
  hidden: { opacity: 0, y: 10, filter: "blur(4px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.3, ease },
  },
};

export function RostersView() {
  const {
    lists,
    selectedList,
    openList,
    backToLists,
    nameDialogMode,
    draftName,
    setDraftName,
    startCreateList,
    startRenameList,
    closeNameDialog,
    confirmNameDialog,
    availableMembers,
    filteredMembers,
    memberQuery,
    setMemberQuery,
    pickerOpen,
    setPickerOpen,
    checkedIds,
    openPicker,
    togglePicked,
    confirmAddMembers,
    pendingMember,
    requestRemoveMember,
    cancelRemoveMember,
    confirmRemoveMember,
    pendingDeletionList,
    requestDeleteList,
    cancelDeleteList,
    confirmDeleteList,
  } = useRosters();

  return (
    <div className="space-y-4">
      <ToolBackLink />

      <Card className="tint-indigo glass shadow-depth-xl border-0 ring-0 rounded-3xl gap-0 py-0 overflow-hidden">
        <div className="h-1 tint-bar" />
        <div className="p-6 space-y-5">
          <AnimatePresence mode="wait" initial={false}>
            {selectedList ? (
              // ── Detail view: a single list's members ──────────────
              <motion.div
                key={`detail-${selectedList.id}`}
                initial={{ opacity: 0, x: -16, filter: "blur(4px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, x: -16, filter: "blur(4px)" }}
                transition={{ duration: 0.25, ease }}
                className="space-y-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl md:text-3xl font-semibold tracking-tight tint-text leading-none">
                        {selectedList.name}
                      </h1>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={startRenameList}
                        aria-label="שינוי שם הרשימה"
                        className="rounded-lg text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="size-4" />
                      </Button>
                    </div>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground num">
                      <Users className="size-3.5" />
                      {selectedList.players.length} שחקנים ברשימה
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={backToLists}
                    className="h-9 gap-1.5 rounded-xl text-sm font-normal text-foreground/70"
                  >
                    חזרה לרשימות
                    <ChevronLeft className="size-4 rotate-180" />
                  </Button>
                </div>

                <Separator className="bg-foreground/8" />

                <Button
                  type="button"
                  variant="ghost"
                  onClick={openPicker}
                  className="h-9 w-fit justify-center gap-1.5 rounded-xl px-3.5 text-sm font-normal neu-raised-xs neu-interactive"
                >
                  <Plus className="size-4 text-primary/70" />
                  הוספת שחקנים מהמועדון
                </Button>

                {selectedList.players.length === 0 ? (
                  <p className="rounded-xl neu-inset bg-foreground/5 px-3 py-8 text-center text-sm text-muted-foreground">
                    אין שחקנים ברשימה. הוסיפו שחקנים מהמועדון.
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    <AnimatePresence initial={false}>
                      {selectedList.players.map((p) => (
                        <motion.div
                          key={p.id}
                          variants={itemVariants}
                          initial="hidden"
                          animate="show"
                          exit={{ opacity: 0, scale: 0.97 }}
                          className="flex items-center justify-between gap-2 rounded-xl neu-inset bg-foreground/5 px-3 py-2"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-foreground/85">
                              {p.name}
                            </span>
                            <span className="text-xs text-muted-foreground num">
                              מד כושר {p.rating}
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => requestRemoveMember(p.id)}
                            aria-label={`הסרת ${p.name}`}
                            className="size-7 rounded-lg text-foreground/50 hover:bg-destructive/15 hover:text-destructive"
                          >
                            <X className="size-4" />
                          </Button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            ) : (
              // ── List view: all saved lists ────────────────────────
              <motion.div
                key="lists"
                initial={{ opacity: 0, x: 16, filter: "blur(4px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, x: 16, filter: "blur(4px)" }}
                transition={{ duration: 0.25, ease }}
                className="space-y-5"
              >
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div className="space-y-1.5">
                    <h1 className="text-3xl md:text-4xl font-semibold tracking-tight tint-text leading-none">
                      רשימות שחקנים
                    </h1>
                    <p className="text-xs text-muted-foreground/80">
                      צרו רשימות שחקנים, לחצו על רשימה כדי לצפות בה ולערוך אותה.
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={startCreateList}
                    className="h-9 gap-1.5 rounded-xl"
                  >
                    <Plus className="size-4" />
                    רשימה חדשה
                  </Button>
                </div>

                <Separator className="bg-foreground/8" />

                {lists.length === 0 ? (
                  <p className="rounded-xl neu-inset bg-foreground/5 px-3 py-8 text-center text-sm text-muted-foreground">
                    עדיין אין רשימות. לחצו על רשימה חדשה כדי להתחיל.
                  </p>
                ) : (
                  <div className="space-y-3">
                    <AnimatePresence initial={false}>
                      {lists.map((list) => (
                        <motion.div
                          key={list.id}
                          variants={itemVariants}
                          initial="hidden"
                          animate="show"
                          exit={{ opacity: 0, scale: 0.97 }}
                          className="rounded-2xl neu-inset p-4"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <h2 className="text-base font-semibold text-foreground">
                                  {list.name}
                                </h2>
                                <Badge
                                  variant="secondary"
                                  className="rounded-full border-0 bg-primary/15 px-2.5 py-0.5 text-[0.65rem] font-medium text-primary num"
                                >
                                  {list.players.length} שחקנים
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                לחצו על צפייה ועריכה כדי לנהל את הרשימה
                              </p>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => openList(list.id)}
                                className="h-8 gap-1.5 rounded-xl"
                              >
                                <Eye className="size-3.5" />
                                צפייה ועריכה
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => requestDeleteList(list.id)}
                                aria-label={`מחיקת הרשימה ${list.name}`}
                                className="rounded-xl text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>

      <RosterNameDialog
        mode={nameDialogMode}
        value={draftName}
        onValueChange={setDraftName}
        onConfirm={confirmNameDialog}
        onClose={closeNameDialog}
      />

      <MemberPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        filteredMembers={filteredMembers}
        availableCount={availableMembers.length}
        query={memberQuery}
        onQueryChange={setMemberQuery}
        checkedIds={checkedIds}
        onToggle={togglePicked}
        onConfirm={confirmAddMembers}
      />

      <ConfirmDialog
        open={pendingMember != null}
        title="הסרת שחקן"
        description={`להסיר את ${pendingMember?.name ?? ""} מהרשימה?`}
        confirmLabel="הסרה"
        onConfirm={confirmRemoveMember}
        onCancel={cancelRemoveMember}
      />

      <ConfirmDialog
        open={pendingDeletionList != null}
        title="מחיקת רשימה"
        description={`למחוק את הרשימה "${pendingDeletionList?.name ?? ""}"? לא ניתן לשחזר פעולה זו.`}
        confirmLabel="מחיקה"
        onConfirm={confirmDeleteList}
        onCancel={cancelDeleteList}
      />
    </div>
  );
}
