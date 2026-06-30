"use client";

import { motion } from "framer-motion";
import { FileDown, Plus, Search, Swords, Users, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { SelectCheckbox } from "@/components/shared/SelectCheckbox";
import { cn } from "@/lib/utils";
import { leagueCategories } from "@/lib/leagues-data";
import {
  ranksForCategory,
  type LeagueTeamFormValues,
} from "@/lib/league-team-form";
import type {
  PlayerPickerRow,
  TeamDetailsTab,
} from "@/hooks/leagues/useLeagueTeamDetails";
import type { RosterPlayer } from "@/lib/league-roster";
import {
  bodyVariants,
  ease,
  Field,
  FieldLabel,
  fieldClass,
  itemVariants,
  SelectField,
} from "@/components/leagues/teamFormFields";

const playerHeadClass =
  "px-3 py-2.5 text-center text-[0.7rem] font-medium uppercase tracking-[0.14em] text-foreground/70";

/** A dialog table of roster players with checkboxes; confirm adds all checked at once. */
function PlayerPickerDialog({
  open,
  onOpenChange,
  rows,
  query,
  onQueryChange,
  checkedCount,
  onToggle,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rows: PlayerPickerRow[];
  query: string;
  onQueryChange: (value: string) => void;
  checkedCount: number;
  onToggle: (id: string) => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="max-w-lg">
        <DialogHeader>
          <DialogTitle>הוספת שחקנים</DialogTitle>
          <DialogDescription>
            סמנו את השחקנים שברצונכם להוסיף בריבוע משמאל, ובסיום לחצו הוסף.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 inset-s-2.5 size-4 -translate-y-1/2 text-foreground/50" />
          <Input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="חיפוש שחקן…"
            className="h-9 ps-9 rounded-xl"
          />
        </div>

        {rows.length === 0 ? (
          <Alert className="border-0 bg-transparent py-10 [&>svg]:hidden">
            <AlertTitle className="text-center text-sm font-normal text-foreground/60">
              לא נמצאו שחקנים
            </AlertTitle>
          </Alert>
        ) : (
          <div className="neu-inset rounded-2xl p-3">
            <div
              dir="ltr"
              className="players-scroll max-h-[50vh] overflow-y-auto overflow-x-hidden"
            >
              <div dir="rtl">
                <Table>
                  <TableHeader className="sticky top-0 z-10 bg-background/40 backdrop-blur-md [&_tr]:border-b-2 [&_tr]:border-border">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className={playerHeadClass}>שם שחקן</TableHead>
                      <TableHead className={playerHeadClass}>מד כושר</TableHead>
                      <TableHead className={cn(playerHeadClass, "w-12")} />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map(({ player, disabled, checked, note }, i) => (
                      <TableRow
                        key={player.id}
                        onClick={() => !disabled && onToggle(player.id)}
                        className={cn(
                          "border-b-2 border-foreground/10 transition-colors duration-150",
                          i % 2 === 1 && "bg-primary/15",
                          disabled
                            ? "cursor-default opacity-40"
                            : cn(
                                // Selectable players stand out with a primary
                                // leading accent over the muted, grayed-out rows.
                                "cursor-pointer border-s-2 border-s-primary/60 hover:bg-primary/25",
                                checked && "bg-primary/25",
                              ),
                        )}
                      >
                        <TableCell className="px-3 py-2.5 text-center text-sm font-medium text-foreground">
                          <span className="inline-flex items-center gap-1.5">
                            {player.name}
                            {note && (
                              <span className="text-[0.7rem] font-normal text-muted-foreground">
                                ({note})
                              </span>
                            )}
                          </span>
                        </TableCell>
                        <TableCell className="px-3 py-2.5 text-center text-sm text-foreground/85 num">
                          {player.rating}
                        </TableCell>
                        <TableCell className="px-3 py-2.5 text-center">
                          <div className="flex justify-center">
                            <SelectCheckbox
                              checked={checked}
                              disabled={disabled}
                              onCheckedChange={() =>
                                !disabled && onToggle(player.id)
                              }
                              ariaLabel={`בחר ${player.name}`}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:flex-row-reverse sm:justify-end">
          <Button
            type="button"
            disabled={checkedCount === 0}
            onClick={onConfirm}
            className="rounded-xl"
          >
            הוסף{checkedCount > 0 ? ` (${checkedCount})` : ""}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="rounded-xl"
          >
            ביטול
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TabHighlight() {
  return (
    <motion.span
      layoutId="team-details-tab-highlight"
      className="absolute inset-0 rounded-lg border-2 border-primary bg-primary/5"
      transition={{ type: "spring", stiffness: 420, damping: 34 }}
    />
  );
}

interface EditLeagueTeamModalProps {
  open: boolean;
  tab: TeamDetailsTab;
  onTabChange: (tab: TeamDetailsTab) => void;
  onOpenChange: (open: boolean) => void;
  values: LeagueTeamFormValues;
  onFieldChange: <K extends keyof LeagueTeamFormValues>(
    field: K,
    value: LeagueTeamFormValues[K],
  ) => void;
  members: RosterPlayer[];
  onRemovePlayer: (id: string) => void;
  valid: boolean;
  onConfirm: () => void;
  // Add-players picker.
  pickerOpen: boolean;
  onOpenPicker: () => void;
  onPickerOpenChange: (open: boolean) => void;
  query: string;
  onQueryChange: (value: string) => void;
  pickerRows: PlayerPickerRow[];
  checkedCount: number;
  onToggleChecked: (id: string) => void;
  onConfirmAddPlayers: () => void;
}

export function EditLeagueTeamModal({
  open,
  tab,
  onTabChange,
  onOpenChange,
  values,
  onFieldChange,
  members,
  onRemovePlayer,
  valid,
  onConfirm,
  pickerOpen,
  onOpenPicker,
  onPickerOpenChange,
  query,
  onQueryChange,
  pickerRows,
  checkedCount,
  onToggleChecked,
  onConfirmAddPlayers,
}: EditLeagueTeamModalProps) {
  const rankOptions = ranksForCategory(values.category);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="top-[7vh] max-w-lg translate-y-0">
        <DialogHeader>
          <DialogTitle>עריכת קבוצה</DialogTitle>
          <DialogDescription>
            שדות המסומנים ב־
            <span className="text-destructive">*</span> הם שדות חובה.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={tab}
          onValueChange={(v) => onTabChange(v as TeamDetailsTab)}
          dir="rtl"
          className="gap-4"
        >
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="details" className="relative">
              {tab === "details" && <TabHighlight />}
              <span className="relative z-10 flex items-center gap-1.5">
                <Swords className="size-4" />
                פרטי קבוצה
              </span>
            </TabsTrigger>
            <TabsTrigger value="players" className="relative">
              {tab === "players" && <TabHighlight />}
              <span className="relative z-10 flex items-center gap-1.5">
                <Users className="size-4" />
                שחקנים
              </span>
            </TabsTrigger>
          </TabsList>

          <div className="relative">
            {/* Details tab */}
            <motion.div
              className={cn(
                tab === "details" ? "relative" : "absolute inset-x-0 top-0",
              )}
              initial={false}
              animate={
                tab === "details"
                  ? { opacity: 1, x: 0, filter: "blur(0px)" }
                  : { opacity: 0, x: 24, filter: "blur(4px)" }
              }
              transition={{ duration: 0.3, ease }}
              style={{ pointerEvents: tab === "details" ? "auto" : "none" }}
              aria-hidden={tab !== "details"}
            >
              <motion.div
                className="space-y-4"
                variants={bodyVariants}
                initial="hidden"
                animate="show"
              >
                <div className="flex justify-center gap-3">
                  <Field className="w-40 flex flex-col items-center">
                    <FieldLabel required>קטגוריה</FieldLabel>
                    <SelectField
                      value={values.category}
                      options={leagueCategories}
                      placeholder="בחרו קטגוריה"
                      onChange={(next) =>
                        onFieldChange(
                          "category",
                          next as LeagueTeamFormValues["category"],
                        )
                      }
                    />
                  </Field>

                  <Field className="w-40 flex flex-col items-center">
                    <FieldLabel required>דרגת ליגה</FieldLabel>
                    <SelectField
                      value={values.rank}
                      options={rankOptions}
                      placeholder={
                        values.category ? "בחרו דרגה" : "בחרו קטגוריה"
                      }
                      disabled={!values.category}
                      onChange={(next) => onFieldChange("rank", next)}
                    />
                  </Field>
                </div>

                <Field>
                  <FieldLabel>הערות</FieldLabel>
                  <Textarea
                    value={values.notes}
                    onChange={(e) => onFieldChange("notes", e.target.value)}
                    className={cn(fieldClass, "h-auto min-h-20 py-2")}
                  />
                </Field>
              </motion.div>
            </motion.div>

            {/* Players tab */}
            <motion.div
              className={cn(
                tab === "players" ? "relative" : "absolute inset-x-0 top-0",
              )}
              initial={false}
              animate={
                tab === "players"
                  ? { opacity: 1, x: 0, filter: "blur(0px)" }
                  : { opacity: 0, x: -24, filter: "blur(4px)" }
              }
              transition={{ duration: 0.3, ease }}
              style={{ pointerEvents: tab === "players" ? "auto" : "none" }}
              aria-hidden={tab !== "players"}
            >
              <motion.div
                className="space-y-4"
                variants={bodyVariants}
                initial="hidden"
                animate="show"
              >
                <Field>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={onOpenPicker}
                    className="h-9 w-fit justify-center gap-1.5 rounded-xl px-3.5 text-sm font-normal neu-raised-xs neu-interactive"
                  >
                    <Plus className="size-4 text-primary/70" />
                    הוסף שחקנים
                  </Button>
                </Field>

                {members.length === 0 ? (
                  <motion.p
                    variants={itemVariants}
                    className="py-8 text-center text-sm text-muted-foreground"
                  >
                    אין שחקנים רשומים עדיין.
                  </motion.p>
                ) : (
                  <motion.div variants={itemVariants} className="space-y-1.5">
                    {members.map((player) => (
                      <div
                        key={player.id}
                        className="flex items-center justify-between gap-2 rounded-xl neu-inset bg-foreground/5 px-3 py-2"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-foreground/85">
                            {player.name}
                          </span>
                          <span className="text-xs text-muted-foreground num">
                            מד כושר {player.rating}
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => onRemovePlayer(player.id)}
                          aria-label={`הסר ${player.name}`}
                          className="size-7 rounded-lg text-foreground/50 hover:bg-foreground/10 hover:text-foreground"
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          </div>
        </Tabs>

        <DialogFooter className="gap-2 sm:flex-row-reverse sm:justify-end">
          {tab === "players" && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {}}
              className="group/btn relative ms-auto h-9 w-fit justify-center gap-1.5 overflow-hidden rounded-xl px-3.5 text-xs font-medium neu-raised-xs neu-interactive tint-indigo"
            >
              <span className="absolute inset-x-0 top-0 h-1 tint-bar origin-center scale-x-0 group-hover/btn:scale-x-100 transition-transform duration-700 ease-out" />
              <FileDown className="size-4 text-[#217346]" />
              ייצוא לאקסל
            </Button>
          )}
          <Button
            type="button"
            disabled={!valid}
            onClick={onConfirm}
            className="rounded-xl"
          >
            עדכון
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="rounded-xl"
          >
            ביטול
          </Button>
        </DialogFooter>
      </DialogContent>

      <PlayerPickerDialog
        open={pickerOpen}
        onOpenChange={onPickerOpenChange}
        rows={pickerRows}
        query={query}
        onQueryChange={onQueryChange}
        checkedCount={checkedCount}
        onToggle={onToggleChecked}
        onConfirm={onConfirmAddPlayers}
      />
    </Dialog>
  );
}
