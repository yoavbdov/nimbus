"use client";

import { AlertTriangle, CalendarClock, Package } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { ConflictKind, DraftConflict } from "@/lib/conflicts";
import type { EquipmentDemand } from "@/lib/equipment-conflicts";
import { cn } from "@/lib/utils";

/** "חדר" / "מדריך" / "חדר ומדריך" for the resources that clash. */
function resourceLabel(kinds: ConflictKind[]): string {
  const parts: string[] = [];
  if (kinds.includes("room")) parts.push("חדר");
  if (kinds.includes("coach")) parts.push("מדריך");
  return parts.join(" ו");
}

/** "2026-07-29" → "29.07.2026". */
function formatIsoDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

/** A time window, always read left-to-right. */
function Hours({ start, end }: { start: string; end: string }) {
  return (
    <span dir="ltr" className="num">
      {start}–{end}
    </span>
  );
}

/**
 * A signed number, always read left-to-right. Without the `dir`, a negative
 * value inherits the dialog's RTL context and the browser renders the minus on
 * the WRONG side ("3-" instead of "-3"), because the sign is a neutral
 * character resolved from the surrounding direction, not from the digits.
 */
function Num({ value }: { value: number }) {
  return (
    <span dir="ltr" className="num inline-block">
      {value}
    </span>
  );
}

/** A section heading inside one warning card. */
function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[0.7rem] font-semibold uppercase tracking-widest text-foreground/50">
      {children}
    </p>
  );
}

/** One "label ………… value" row of the stock breakdown. */
function StockRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  /**
   * `free` colours by the value itself: green while units remain, red once the
   * count goes negative — an over-subscribed item is the whole point of the
   * card, so it must not read as a healthy number.
   */
  tone?: "free" | "missing";
}) {
  const short = tone === "missing" || (tone === "free" && value < 0);
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-foreground/70">{label}</span>
      <span
        className={cn(
          "font-semibold",
          short && "text-destructive",
          tone === "free" && !short && "text-emerald-600 dark:text-emerald-400",
        )}
      >
        <Num value={value} />
      </span>
    </div>
  );
}

/** The card for one schedule clash — a room or an instructor taken twice. */
function ConflictCard({ conflict }: { conflict: DraftConflict }) {
  const resource = resourceLabel(conflict.kinds);
  const taken = conflict.roomName ?? conflict.coachName;

  return (
    <section className="neu-inset space-y-2 rounded-2xl bg-destructive/5 p-3.5">
      <p className="flex items-center gap-1.5 font-medium text-destructive">
        <CalendarClock className="size-4 shrink-0" />
        קונפליקט ב{resource}
      </p>

      <p className="text-sm text-foreground/80">
        הפעילות מתנגשת עם{" "}
        <span className="font-medium text-foreground">{conflict.title}</span>
        {taken && (
          <>
            {" "}
            על <span className="font-medium text-foreground">{taken}</span>
          </>
        )}
        .
      </p>

      {conflict.next && (
        <div className="space-y-1 text-sm">
          <SubHeading>מתי</SubHeading>
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-foreground/70">
              {conflict.next.day}, {formatIsoDate(conflict.next.date)}
            </span>
            <Hours start={conflict.next.start} end={conflict.next.end} />
          </div>
          {conflict.recurring && (
            <p className="text-xs text-foreground/55">
              חוזר ב-<span className="num">{conflict.count}</span> מפגשים נוספים
              בשנה הקרובה.
            </p>
          )}
        </div>
      )}
    </section>
  );
}

/** The card for one equipment shortage — the club simply hasn't got enough. */
function ShortageCard({ shortage }: { shortage: EquipmentDemand }) {
  return (
    <section className="neu-inset space-y-3 rounded-2xl bg-amber-500/5 p-3.5">
      <p className="flex items-center gap-1.5 font-medium text-amber-600 dark:text-amber-400">
        <Package className="size-4 shrink-0" />
        קונפליקט בציוד
      </p>

      <p className="text-sm text-foreground/80">
        הפעילות שביקשת דורשת{" "}
        <span className="num font-medium text-foreground">
          {shortage.requested}
        </span>{" "}
        <span className="font-medium text-foreground">
          {shortage.equipmentId}
        </span>
        , אך {shortage.at ? "בשעות הפעילות" : "במועדון"} זמינים רק{" "}
        <span
          className={cn(
            "font-medium",
            shortage.available < 0 ? "text-destructive" : "text-foreground",
          )}
        >
          <Num value={shortage.available} />
        </span>
        .
      </p>

      <div className="space-y-1.5 text-sm">
        <SubHeading>מצב הציוד במועדון</SubHeading>
        <StockRow
          label={`סה״כ ${shortage.equipmentId} במועדון`}
          value={shortage.total}
        />
        {/* "לא כולל פעילות זו" is not a detail — the hook drops the edited
            activity's own allocation from the claims, so without saying so the
            number reads as if it already contained it. */}
        <StockRow
          label="בשימוש בשעות הפעילות (לא כולל פעילות זו)"
          value={shortage.heldByOthers}
        />
        <StockRow label="פנויים" value={shortage.available} tone="free" />
        <StockRow label="נדרש לפעילות שלך" value={shortage.requested} />
      </div>

      {shortage.holders.length > 0 && (
        <div className="space-y-1.5 text-sm">
          <SubHeading>הציוד שבשימוש</SubHeading>
          <ul className="space-y-1">
            {shortage.holders.map((holder) => (
              <li
                key={holder.parentId}
                className="flex items-baseline justify-between gap-3"
              >
                <span className="min-w-0 truncate text-foreground/80">
                  <span className="text-foreground/50">
                    {holder.category}:{" "}
                  </span>
                  {holder.title}
                </span>
                <span className="flex shrink-0 items-baseline gap-2 text-xs text-foreground/60">
                  <Hours start={holder.start} end={holder.end} />
                  <span className="num font-semibold text-foreground/80">
                    {holder.quantity}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {shortage.at && (
        <p className="text-xs text-foreground/55">
          החוסר נוצר ב{shortage.at.day}, {formatIsoDate(shortage.at.date)} בין{" "}
          <Hours start={shortage.at.start} end={shortage.at.end} />
          {shortage.recurring && (
            <>
              {" "}
              (וחוזר ב-<span className="num">{shortage.count}</span> מועדים)
            </>
          )}
          .
        </p>
      )}

      <Separator className="bg-foreground/10" />

      <p className="flex items-baseline justify-between gap-3 font-medium">
        <span className="text-destructive">
          {shortage.missing === 1 ? "חסר" : "חסרים"}
        </span>
        <span className="text-destructive">
          <span className="num">{shortage.missing}</span> {shortage.equipmentId}
        </span>
      </p>
    </section>
  );
}

interface ActivityWarningsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Room / instructor clashes with other activities. */
  conflicts: DraftConflict[];
  /** Items the club doesn't have enough of while this activity runs. */
  shortages: EquipmentDemand[];
}

/**
 * The full story behind the warnings bar: one card per schedule clash and per
 * equipment shortage, each spelling out what is contested, when, and — for
 * equipment, the counted resource — the whole stock breakdown plus who is
 * holding the rest at that moment.
 *
 * Opened from the bar so the detail costs the form no vertical space at all.
 * Purely presentational; both engines run in the parent modal's hook. None of
 * this blocks saving.
 */
export function ActivityWarningsDialog({
  open,
  onOpenChange,
  conflicts,
  shortages,
}: ActivityWarningsDialogProps) {
  const total = conflicts.length + shortages.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir="rtl"
        className="top-[5vh] flex max-h-[90vh] max-w-lg translate-y-0 flex-col"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="size-5 shrink-0 text-amber-600 dark:text-amber-400" />
            קונפליקטים שזוהו ({total})
          </DialogTitle>
          <DialogDescription>
            אזהרות בלבד — אפשר לשמור את הפעילות בכל מקרה.
          </DialogDescription>
        </DialogHeader>

        <div
          dir="ltr"
          className="players-scroll -mx-1 min-h-0 flex-1 overflow-y-auto px-1"
        >
          <div dir="rtl" className="space-y-2.5">
            {/* Equipment first: it carries the numbers a user has to act on,
                and there is usually one of it against several clashes. */}
            {shortages.map((shortage) => (
              <ShortageCard key={shortage.equipmentId} shortage={shortage} />
            ))}
            {conflicts.map((conflict) => (
              <ConflictCard key={conflict.parentId} conflict={conflict} />
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="rounded-xl"
          >
            סגור
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
