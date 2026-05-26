import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const classes = [
  { name: "שחמט מתחילים", type: "רגיל", enrolled: 4, capacity: 15 },
  { name: "שחמט מתקדמים", type: "רגיל", enrolled: 3, capacity: 20 },
  { name: "אימון קבוצתי", type: "רגיל", enrolled: 3, capacity: 20 },
  { name: "שחמט מחשב", type: "רגיל", enrolled: 3, capacity: 20 },
  { name: "מועדון בוגרים", type: "רגיל", enrolled: 0, capacity: 30 },
];

export function RegistrationStatus() {
  return (
    <Card className="rounded-xl shadow-none overflow-hidden">
      <CardHeader className="px-5 py-4 border-b border-border space-y-0">
        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          מצב רישומים — חוגים פעילים
        </p>
      </CardHeader>

      <CardContent className="p-0 divide-y divide-border">
        {classes.map((c) => {
          const pct = Math.round((c.enrolled / c.capacity) * 100);
          return (
            <div
              key={c.name}
              className="px-5 py-3.5 hover:bg-muted/30 transition-colors duration-100"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-foreground flex-1 truncate">
                  {c.name}
                </span>
                <Badge variant="secondary" className="shrink-0">{c.type}</Badge>
                <span className="text-xs font-mono tabular-nums text-muted-foreground shrink-0">
                  {c.enrolled} / {c.capacity}
                </span>
              </div>
              <Progress value={pct} className="h-1.5" />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
