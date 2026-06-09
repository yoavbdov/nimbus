"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil, Check, X } from "lucide-react";
import { RatingPlayersTable } from "@/components/dashboard/RatingPlayersTable";
import { DeletePlayerModal } from "@/components/players/DeletePlayerModal";
import { AvailabilityModal } from "@/components/players/AvailabilityModal";
import { AddPlayerModal } from "@/components/players/AddPlayerModal";
import { ClubsModal } from "@/components/players/ClubsModal";
import { useDeletePlayer } from "@/hooks/players/useDeletePlayer";
import { useAvailabilityCheck } from "@/hooks/players/useAvailabilityCheck";
import { useAddPlayer } from "@/hooks/players/useAddPlayer";
import { useClubRegistration } from "@/hooks/players/useClubRegistration";
import { playerFormValuesFor } from "@/lib/player-details";
import { useEditableField } from "@/hooks/dashboard/useEditableField";
import { useEditableRange } from "@/hooks/dashboard/useEditableRange";
import { useTierNavigation } from "@/hooks/dashboard/useTierNavigation";
import { ratingPlayers, ratingPlayersAsPlayers } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";

export interface RatingTier {
  label: string;
  count: number;
  min: number;
  max: number;
}

interface RatingDistributionProps {
  tiers: RatingTier[];
  onTierChange: (index: number, updated: Partial<RatingTier>) => void;
}

interface EditableFieldProps {
  value: string;
  onCommit: (val: string) => void;
  className?: string;
}

function EditableField({ value, onCommit, className }: EditableFieldProps) {
  const { editing, draft, setDraft, startEditing, commit, cancel } =
    useEditableField(value, onCommit);

  if (editing) {
    return (
      <div
        className="flex items-center gap-1"
        onClick={(e) => e.stopPropagation()}
      >
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === "Escape") e.stopPropagation();
            if (e.key === "Enter") commit();
            if (e.key === "Escape") cancel();
          }}
          autoFocus
          className="h-7 text-xs px-2 neu-inset border-0 rounded-md flex-1"
        />
        <Button
          variant="ghost"
          size="icon"
          className="size-5"
          onClick={commit}
          aria-label="אשר"
        >
          <Check className="size-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-5"
          onClick={cancel}
          aria-label="בטל"
        >
          <X className="size-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("group relative flex items-center justify-center min-w-0", className)}>
      <span className="truncate">{value}</span>
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-5 size-5 opacity-0 group-hover:opacity-100 transition-opacity duration-100 text-muted-foreground shrink-0"
        onClick={(e) => {
          e.stopPropagation();
          startEditing();
        }}
        aria-label="ערוך"
      >
        <Pencil className="size-3" />
      </Button>
    </div>
  );
}

interface RangeFieldProps {
  min: number;
  max: number;
  onCommit: (range: { min: number; max: number }) => void;
}

function RangeField({ min, max, onCommit }: RangeFieldProps) {
  const {
    editing,
    minDraft,
    setMinDraft,
    maxDraft,
    setMaxDraft,
    startEditing,
    commit,
    cancel,
  } = useEditableRange(min, max, onCommit);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === "Escape") e.stopPropagation();
    if (e.key === "Enter") commit();
    if (e.key === "Escape") cancel();
  }

  if (editing) {
    return (
      <div
        className="flex items-center gap-1"
        onClick={(e) => e.stopPropagation()}
      >
        <Input
          value={minDraft}
          onChange={(e) => setMinDraft(e.target.value)}
          onKeyDown={onKeyDown}
          inputMode="numeric"
          autoFocus
          aria-label="מינימום"
          className="h-7 w-14 text-xs px-2 neu-inset border-0 rounded-md num text-center"
        />
        <span className="text-xs text-muted-foreground">–</span>
        <Input
          value={maxDraft}
          onChange={(e) => setMaxDraft(e.target.value)}
          onKeyDown={onKeyDown}
          inputMode="numeric"
          aria-label="מקסימום"
          className="h-7 w-14 text-xs px-2 neu-inset border-0 rounded-md num text-center"
        />
        <Button
          variant="ghost"
          size="icon"
          className="size-5"
          onClick={commit}
          aria-label="אשר"
        >
          <Check className="size-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-5"
          onClick={cancel}
          aria-label="בטל"
        >
          <X className="size-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className="group relative flex items-center justify-center min-w-0 text-xs text-foreground num">
      <span className="truncate">
        {min}–{max}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-5 size-5 opacity-0 group-hover:opacity-100 transition-opacity duration-100 text-muted-foreground shrink-0"
        onClick={(e) => {
          e.stopPropagation();
          startEditing();
        }}
        aria-label="ערוך טווח"
      >
        <Pencil className="size-3" />
      </Button>
    </div>
  );
}

function TierBox({
  tier,
  onChange,
}: {
  tier: RatingTier;
  onChange: (updated: Partial<RatingTier>) => void;
}) {
  const goToPlayers = useTierNavigation();

  return (
    <motion.div
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 320, damping: 24 }}
      onClick={() => goToPlayers(tier.min, tier.max)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          goToPlayers(tier.min, tier.max);
        }
      }}
      className="tint-indigo bloom bloom-indigo bloom-hover rounded-2xl h-full cursor-pointer"
    >
      <Card className="group/tier relative overflow-hidden glass-sm shadow-depth neu-interactive border-0 ring-0 rounded-2xl h-full gap-0 py-0">
        <div className="absolute inset-x-0 top-0 h-1 tint-bar origin-center scale-x-0 group-hover/tier:scale-x-100 transition-transform duration-700 ease-out" />
        <CardContent className="p-4 h-full">
          <div className="flex flex-col items-center text-center justify-center h-full gap-2">
            <EditableField
              value={tier.label}
              onCommit={(label) => onChange({ label })}
              className="text-lg font-semibold uppercase tracking-[0.12em] text-foreground justify-center"
            />
            <span className="text-5xl font-semibold num tint-text leading-none">
              {tier.count}
            </span>
            <RangeField
              min={tier.min}
              max={tier.max}
              onCommit={({ min, max }) => onChange({ min, max })}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function RatingDistribution({
  tiers,
  onTierChange,
}: RatingDistributionProps) {
  const total = tiers.reduce((sum, t) => sum + t.count, 0);
  const deletePlayer = useDeletePlayer();
  const availability = useAvailabilityCheck(ratingPlayersAsPlayers);
  const addPlayer = useAddPlayer();
  const clubRegistration = useClubRegistration();

  function handlePlayerAction(actionId: string, playerName: string | null) {
    if (actionId === "details") {
      const player = ratingPlayersAsPlayers.find((p) => p.name === playerName);
      if (player) addPlayer.openForEdit(playerFormValuesFor(player));
    } else if (actionId === "clubs") {
      const player = ratingPlayersAsPlayers.find((p) => p.name === playerName);
      if (player) clubRegistration.openFor({ name: player.name, clubs: player.clubs });
    } else if (actionId === "availability") {
      availability.openWith(playerName ? [playerName] : []);
    } else if (actionId === "delete" && playerName) {
      deletePlayer.openFor([playerName]);
    }
  }

  function handleBulkAction(actionId: string, playerNames: string[]) {
    if (actionId === "availability") {
      availability.openWith(playerNames);
    } else if (actionId === "delete") {
      deletePlayer.openFor(playerNames);
    }
  }

  return (
    <Card className="tint-indigo glass shadow-depth-xl border-0 ring-0 rounded-3xl gap-0 py-0 overflow-hidden">
      <div className="h-1 tint-bar" />
      <CardContent className="p-6">
        <div className="flex flex-col items-center mb-6 gap-1">
          <CardTitle className="text-base font-semibold tracking-wide tint-text">
            התפלגות דירוגים
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground/80 num">
            {total} שחקנים
          </CardDescription>
        </div>

        <div className="flex gap-6 items-stretch">
          <div className="w-1/2 h-90">
            <div className="grid grid-cols-2 grid-rows-2 gap-5 h-full">
              {tiers.map((tier, i) => (
                <TierBox
                  key={i}
                  tier={tier}
                  onChange={(updated) => onTierChange(i, updated)}
                />
              ))}
            </div>
          </div>
          <div className="w-1/2 neu-inset rounded-2xl p-3">
            <RatingPlayersTable
              players={ratingPlayers}
              onAction={handlePlayerAction}
              onBulkAction={handleBulkAction}
            />
          </div>
        </div>
      </CardContent>

      <DeletePlayerModal
        open={deletePlayer.open}
        onOpenChange={deletePlayer.handleOpenChange}
        playerNames={deletePlayer.names}
        expectedPhrase={deletePlayer.expectedPhrase}
        confirmText={deletePlayer.confirmText}
        onConfirmTextChange={deletePlayer.setConfirmText}
        valid={deletePlayer.valid}
        onConfirm={deletePlayer.confirm}
      />

      <AddPlayerModal
        open={addPlayer.open}
        mode={addPlayer.mode}
        onOpenChange={addPlayer.handleOpenChange}
        values={addPlayer.values}
        onFieldChange={addPlayer.updateField}
        birthParts={addPlayer.birthParts}
        onBirthPartChange={addPlayer.setBirthPart}
        onGradeChange={addPlayer.setGrade}
        valid={addPlayer.valid}
        onConfirm={addPlayer.confirm}
      />

      <AvailabilityModal
        open={availability.open}
        onOpenChange={availability.handleOpenChange}
        players={ratingPlayersAsPlayers}
        selectedIds={availability.selectedIds}
        onTogglePlayer={availability.togglePlayer}
        slot={availability.slot}
        onSlotChange={availability.updateSlot}
        slotValid={availability.slotValid}
        result={availability.result}
        onConfirm={availability.confirm}
        checkingAll={availability.checkingAll}
      />

      <ClubsModal
        open={clubRegistration.open}
        onOpenChange={clubRegistration.handleOpenChange}
        playerName={clubRegistration.playerName}
        editing={clubRegistration.editing}
        registered={clubRegistration.registered}
        available={clubRegistration.available}
        pendingRemoval={clubRegistration.pendingRemoval}
        selectedClub={clubRegistration.selectedClub}
        onSelectedClubChange={clubRegistration.setSelectedClub}
        onStartEditing={clubRegistration.startEditing}
        onStopEditing={clubRegistration.stopEditing}
        onRequestRemove={clubRegistration.requestRemove}
        onCancelRemove={clubRegistration.cancelRemove}
        onConfirmRemove={clubRegistration.confirmRemove}
        onAddClub={clubRegistration.addClub}
      />
    </Card>
  );
}
