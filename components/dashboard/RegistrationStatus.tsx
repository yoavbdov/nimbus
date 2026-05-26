import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
    <Card className="border-border/40 shadow-none rounded-lg overflow-hidden">
      <CardHeader className="px-4 py-3 border-b border-border/30 space-y-0">
        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
          מצב רישומים — חוגים פעילים
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0 divide-y divide-border/30">
        {classes.map((c) => {
          const pct = Math.round((c.enrolled / c.capacity) * 100);
          return (
            <div
              key={c.name}
              className="px-4 py-3 hover:bg-muted/30 transition-colors duration-75"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-foreground flex-1 truncate">{c.name}</span>
                <Badge
                  variant="secondary"
                  className="rounded-full px-1.5 py-0.5 text-xs font-medium bg-muted text-muted-foreground border border-border/40 shrink-0"
                >
                  {c.type}
                </Badge>
                <span className="text-xs font-mono tabular-nums text-muted-foreground shrink-0">
                  {c.enrolled} / {c.capacity}
                </span>
              </div>
              <Progress value={pct} className="h-1" />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
