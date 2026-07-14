/**
 * A numeric min–max range for a table cell (age / rating). Each side is
 * optional: a blank/zero bound imposes no limit on that side, so a fully open
 * range reads "ללא הגבלה", and a half-open one reads "מ-X" / "עד Y".
 */
export function RangePill({
  from,
  to,
  noLimit,
}: {
  from: number | null | undefined;
  to: number | null | undefined;
  noLimit?: boolean;
}) {
  const lo = from ? from : null;
  const hi = to ? to : null;

  if (noLimit || (lo == null && hi == null))
    return <span className="text-sm text-foreground/70">ללא הגבלה</span>;

  return (
    <span className="num text-sm text-foreground/85" dir="ltr">
      {lo != null && hi != null ? `${lo}–${hi}` : lo != null ? `${lo}+` : `≤${hi}`}
    </span>
  );
}
