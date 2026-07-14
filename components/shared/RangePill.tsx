/**
 * A numeric min–max range for a table cell (age / rating). When the range is
 * unbounded (`noLimit`), it reads "ללא הגבלה" instead of numbers.
 */
export function RangePill({
  from,
  to,
  noLimit,
}: {
  from: number;
  to: number;
  noLimit?: boolean;
}) {
  if (noLimit)
    return <span className="text-sm text-foreground/70">ללא הגבלה</span>;
  return (
    <span className="num text-sm text-foreground/85" dir="ltr">
      {from}–{to}
    </span>
  );
}
