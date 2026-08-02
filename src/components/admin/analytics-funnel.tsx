"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { conversionFunnel } from "@/lib/admin/mock-data";
import { cn } from "@/lib/utils";

const stageColors = [
  "bg-primary",
  "bg-primary/80",
  "bg-primary/60",
  "bg-primary/40",
  "bg-primary/25",
];

export function AnalyticsFunnel() {
  const max = conversionFunnel[0].count;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversion Funnel</CardTitle>
        <CardDescription>Visitor to booking conversion breakdown</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {conversionFunnel.map((stage, i) => {
            const widthPct = (stage.count / max) * 100;
            const dropoff =
              i > 0
                ? (
                    ((conversionFunnel[i - 1].count - stage.count) /
                      conversionFunnel[i - 1].count) *
                    100
                  ).toFixed(1)
                : null;

            return (
              <div key={stage.stage} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white",
                        stageColors[i]
                      )}
                    >
                      {i + 1}
                    </span>
                    <span className="font-medium">{stage.stage}</span>
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    {dropoff && (
                      <span className="text-[10px] text-destructive">−{dropoff}%</span>
                    )}
                    <span className="w-16 font-semibold">
                      {stage.count.toLocaleString()}
                    </span>
                    <span className="w-10 text-muted-foreground">{stage.percentage}%</span>
                  </div>
                </div>
                {/* Bar */}
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn("h-full rounded-full transition-all duration-500", stageColors[i])}
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 rounded-xl border bg-muted/40 p-3">
          <p className="text-[11px] text-muted-foreground">
            Overall conversion:{" "}
            <span className="font-semibold text-foreground">
              {conversionFunnel[conversionFunnel.length - 1].percentage}%
            </span>{" "}
            of visitors complete a booking.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
