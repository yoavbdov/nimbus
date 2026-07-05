"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  Search,
  StickyNote,
  Swords,
  Trash2,
  TriangleAlert,
  Users,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LeagueRankBadge } from "@/components/leagues/LeagueRankBadge";
import { UnsavedCloseBar } from "@/components/shared/UnsavedCloseBar";
import { cn } from "@/lib/utils";
import {
  leagueCategories,
  type LeagueCategory,
  type LeagueTeam,
} from "@/lib/leagues-data";

const ease = [0.22, 1, 0.36, 1] as const;

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12, filter: "blur(4px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.32, ease },
  },
};

function TeamMeta({ team }: { team: LeagueTeam }) {
  return (
    <div className="flex flex-nowrap items-center gap-x-4 whitespace-nowrap text-xs text-foreground/70">
      <span className="shrink-0 text-foreground/55">{team.category}</span>
      <span className="flex shrink-0 items-center gap-1.5">
        <Users className="size-3.5 text-primary/70" />
        {team.players.length} שחקנים
      </span>
      {team.notes && (
        <span className="flex min-w-0 items-center gap-1.5">
          <StickyNote className="size-3.5 shrink-0 text-primary/70" />
          <span className="truncate">{team.notes}</span>
        </span>
      )}
    </div>
  );
}

function TeamHeader({ team }: { team: LeagueTeam }) {
  return (
    <div className="min-w-0 space-y-2">
      <div className="flex items-center gap-2">
        <Swords className="size-4 shrink-0 text-primary" />
        <span className="font-medium text-foreground">{team.name}</span>
        <LeagueRankBadge category={team.category} rank={team.rank} />
      </div>
      <TeamMeta team={team} />
    </div>
  );
}

interface RegisteredTeamCardProps {
  team: LeagueTeam;
  confirming: boolean;
  onRequestRemove: () => void;
  onCancelRemove: () => void;
  onConfirmRemove: () => void;
}

function RegisteredTeamCard({
  team,
  confirming,
  onRequestRemove,
  onCancelRemove,
  onConfirmRemove,
}: RegisteredTeamCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease }}
      className={cn(
        "relative overflow-hidden rounded-2xl neu-raised-xs bg-foreground/5 p-3.5",
        confirming && "ring-1 ring-destructive/40",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <TeamHeader team={team} />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRequestRemove}
          aria-label={`הסר רישום מ${team.name}`}
          className="size-8 shrink-0 rounded-lg text-destructive/80 hover:bg-destructive/15 hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      <AnimatePresence>
        {confirming && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease }}
            className="overflow-hidden"
          >
            <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-destructive/10 px-3 py-2">
              <span className="flex items-center gap-2 text-sm text-destructive">
                <TriangleAlert className="size-4 shrink-0" />
                להסיר את הרישום מקבוצת הליגה?
              </span>
              <div className="flex shrink-0 gap-2">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={onConfirmRemove}
                  className="h-7 rounded-lg px-3 text-xs"
                >
                  כן, הסר
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onCancelRemove}
                  className="h-7 rounded-lg px-3 text-xs"
                >
                  ביטול
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface CategoryFilterProps {
  value: LeagueCategory | null;
  onChange: (value: LeagueCategory | null) => void;
}

const filterOptions: { value: LeagueCategory | null; label: string }[] = [
  { value: null, label: "הכל" },
  ...leagueCategories.map((category) => ({ value: category, label: category })),
];

function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  return (
    <Tabs
      value={value ?? "all"}
      onValueChange={(next) =>
        onChange(next === "all" ? null : (next as LeagueCategory))
      }
      dir="rtl"
    >
      <TabsList>
        {filterOptions.map((option) => {
          const tabValue = option.value ?? "all";
          const active = (value ?? "all") === tabValue;
          return (
            <TabsTrigger key={tabValue} value={tabValue} className="relative">
              {active && (
                <motion.span
                  layoutId="league-category-highlight"
                  className="absolute inset-0 rounded-lg border-2 border-primary bg-primary/5"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative z-10">{option.label}</span>
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
}

interface AvailableTeamCardProps {
  team: LeagueTeam;
  onRegister: (name: string) => void;
}

function AvailableTeamCard({ team, onRegister }: AvailableTeamCardProps) {
  return (
    <motion.li
      variants={itemVariants}
      className="flex items-center justify-between gap-3 rounded-2xl neu-raised-xs bg-foreground/5 p-3.5"
    >
      <TeamHeader team={team} />
      <Button
        type="button"
        size="sm"
        onClick={() => onRegister(team.name)}
        className="h-8 shrink-0 gap-1.5 rounded-lg px-3 text-xs"
      >
        <Check className="size-3.5" />
        הרשם
      </Button>
    </motion.li>
  );
}

interface LeagueModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  playerName: string;
  registered: LeagueTeam | null;
  available: LeagueTeam[];
  confirmingRemoval: boolean;
  categoryFilter: LeagueCategory | null;
  onCategoryFilterChange: (value: LeagueCategory | null) => void;
  query: string;
  onQueryChange: (value: string) => void;
  dirty: boolean;
  confirmingClose: boolean;
  closeNudge: number;
  onRequestRemove: () => void;
  onCancelRemove: () => void;
  onConfirmRemove: () => void;
  onRegister: (name: string) => void;
  onCommit: () => void;
  onConfirmClose: () => void;
  onCancelClose: () => void;
}

export function LeagueModal({
  open,
  onOpenChange,
  playerName,
  registered,
  available,
  confirmingRemoval,
  categoryFilter,
  onCategoryFilterChange,
  query,
  onQueryChange,
  dirty,
  confirmingClose,
  closeNudge,
  onRequestRemove,
  onCancelRemove,
  onConfirmRemove,
  onRegister,
  onCommit,
  onConfirmClose,
  onCancelClose,
}: LeagueModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="top-[20%] max-w-2xl translate-y-0">
        <DialogHeader>
          <DialogTitle>הרשמה לליגה</DialogTitle>
          <DialogDescription>
            {registered ? (
              <>
                <span className="font-semibold text-foreground">
                  {playerName}
                </span>{" "}
                רשום לקבוצת ליגה.
              </>
            ) : (
              <>
                בחרו קבוצת ליגה שאליה יירשם{" "}
                <span className="font-semibold text-foreground">
                  {playerName}
                </span>
                .
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {registered ? (
            <RegisteredTeamCard
              team={registered}
              confirming={confirmingRemoval}
              onRequestRemove={onRequestRemove}
              onCancelRemove={onCancelRemove}
              onConfirmRemove={onConfirmRemove}
            />
          ) : (
            <>
              <Separator className="bg-foreground/10" />
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease }}
                className="space-y-3"
              >
                <CategoryFilter
                  value={categoryFilter}
                  onChange={onCategoryFilterChange}
                />
                <div className="relative w-48">
                  <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-foreground/45" />
                  <Input
                    value={query}
                    onChange={(e) => onQueryChange(e.target.value)}
                    placeholder="חיפוש קבוצה…"
                    className="h-9 rounded-xl neu-inset border-0 bg-foreground/8! ps-9 pe-3 text-start"
                  />
                </div>
              </motion.div>
              <AnimatePresence mode="wait" initial={false}>
                {available.length === 0 ? (
                  <motion.p
                    key="empty"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25, ease }}
                    className="rounded-2xl neu-inset bg-foreground/5 py-8 text-center text-sm text-foreground/60"
                  >
                    {query.trim()
                      ? "לא נמצאו קבוצות התואמות לחיפוש."
                      : categoryFilter
                        ? `אין קבוצות ${categoryFilter} פתוחות להרשמה.`
                        : "אין קבוצות ליגה פתוחות להרשמה."}
                  </motion.p>
                ) : (
                  <motion.ul
                    key={categoryFilter ?? "all"}
                    variants={listVariants}
                    initial="hidden"
                    animate="show"
                    exit={{ opacity: 0, transition: { duration: 0.15 } }}
                    className="players-scroll scrollbar-right max-h-72 space-y-2.5 overflow-y-auto pe-1"
                  >
                    {available.map((team) => (
                      <AvailableTeamCard
                        key={team.id}
                        team={team}
                        onRegister={onRegister}
                      />
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </>
          )}
        </div>

        <DialogFooter className="gap-2 sm:justify-start">
          {confirmingClose ? (
            <UnsavedCloseBar
              nudge={closeNudge}
              onConfirmClose={onConfirmClose}
              onCancelClose={onCancelClose}
            />
          ) : (
            <>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="rounded-xl"
              >
                {dirty ? "ביטול" : "סגור"}
              </Button>
              <Button
                type="button"
                disabled={!dirty}
                onClick={onCommit}
                className="gap-1.5 rounded-xl"
              >
                <Check className="size-4" />
                עדכן
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
