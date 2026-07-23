"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Eye, Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ToolBackLink } from "@/components/tools/ToolBackLink";
import { RosterNameDialog } from "@/components/tools/rosters/RosterNameDialog";
import { RosterModal } from "@/components/tools/rosters/RosterModal";
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
    draft,
    members,
    openList,
    cancelDraft,
    saveDraft,
    saving,
    nameDialogMode,
    draftName,
    setDraftName,
    startCreateList,
    startRenameList,
    closeNameDialog,
    confirmNameDialog,
    availablePlayers,
    pickerOpen,
    setPickerOpen,
    checkedIds,
    openPicker,
    togglePicked,
    confirmAddMembers,
    removeMember,
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
        </div>
      </Card>

      <RosterModal
        open={draft != null}
        mode={draft?.mode ?? "edit"}
        onCancel={cancelDraft}
        onConfirm={saveDraft}
        saving={saving}
        rosterName={draft?.name ?? ""}
        members={members}
        onRename={startRenameList}
        onRemoveMember={removeMember}
        availablePlayers={availablePlayers}
        pickerOpen={pickerOpen}
        onPickerOpenChange={setPickerOpen}
        onOpenPicker={openPicker}
        checkedIds={checkedIds}
        onToggleChecked={togglePicked}
        onConfirmMembers={confirmAddMembers}
      />

      <RosterNameDialog
        mode={nameDialogMode}
        value={draftName}
        onValueChange={setDraftName}
        onConfirm={confirmNameDialog}
        onClose={closeNameDialog}
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
