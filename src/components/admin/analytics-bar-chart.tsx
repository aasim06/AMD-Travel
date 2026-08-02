"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { monthlyRevenueData, weeklyRevenueData } from "@/lib/admin/mock-data";
import { cn } from "@/lib/utils";

type Range = "weekly" | "monthly";

export function AnalyticsBarChart() {
  const [range, setRange] = useState<Range>("monthly");
  const [hovered, setHovered] = useState<number | null>(null);

  const data = range === "monthly" ? monthlyRevenueData : weeklyRevenueData;
  const label = range === "monthly" ? "month" : "day";
  const maxRevenue = Math.max(...data.map((d) => d.revenue));

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Revenue Overview</CardTitle>
          <CardDescription>Revenue and bookings trend over time</CardDescription>
        </div>
        <div className="flex shrink-0 gap-1 rounded-lg border bg-muted/50 p-1">
          {(["weekly", "monthly"] as Range[]).map((r) => (
            <Button
              key={r}
              size="sm"
              variant="ghost"
              onClick={() => setRange(r)}
              className={cn(
                "h-7 px-3 text-xs capitalize",
                range === r && "bg-background shadow-sm text-foreground"
              )}
            >
              {r}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {/* Y-axis labels + bars */}
        <div className="flex gap-3">
          {/* Y axis */}
          <div className="flex w-10 shrink-0 flex-col-reverse justify-between pb-6 text-right">
            {[0, 25, 50, 75, 100].map((tick) => (
              <span key={tick} className="text-[10px] leading-none text-muted-foreground">
                €{((maxRevenue * tick) / 100 / 1000).toFixed(0)}k
              </span>
            ))}
          </div>

          {/* Chart area */}
          <div className="flex-1">
            {/* Grid lines */}
            <div className="relative h-[240px]">
              {[0, 25, 50, 75, 100].map((tick) => (
                <div
                  key={tick}
                  className="absolute w-full border-t border-dashed border-border/50"
                  style={{ bottom: `${tick}%` }}
                />
              ))}

              {/* Bars */}
              <div className="absolute inset-0 flex items-end gap-1.5 pb-0">
                {data.map((item, i) => {
                  const barHeight = (item.revenue / maxRevenue) * 100;
                  const targetHeight =
                    "target" in item
                      ? ((item as typeof monthlyRevenueData[0]).target / maxRevenue) * 100
                      : null;
                  const isHovered = hovered === i;

                  return (
                    <div
                      key={(item as { month?: string; day?: string })[label] ?? i}
                      className="group relative flex flex-1 flex-col items-center"
                      onMouseEnter={() => setHovered(i)}
                      onMouseLeave={() => setHovered(null)}
                    >
                      {/* Tooltip */}
                      {isHovered && (
                        <div className="absolute -top-16 left-1/2 z-10 -translate-x-1/2 rounded-lg border bg-popover px-3 py-2 shadow-lg">
                          <p className="text-[11px] font-semibold text-popover-foreground">
                            €{item.revenue.toLocaleString()}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {item.bookings} bookings
                          </p>
                        </div>
                      )}

                      {/* Target line */}
                      {targetHeight !== null && (
                        <div
                          className="absolute w-full"
                          style={{ bottom: `${targetHeight}%` }}
                        >
                          <div className="mx-1 h-0.5 rounded-full bg-amber-400/60" />
                        </div>
                      )}

                      {/* Bar */}
                      <div
                        className={cn(
                          "w-full rounded-t-md transition-all duration-200",
                          isHovered
                            ? "bg-gradient-to-t from-primary to-emerald-400"
                            : "bg-gradient-to-t from-primary/80 to-primary/60"
                        )}
                        style={{ height: `${barHeight}%` }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* X axis labels */}
            <div className="mt-2 flex gap-1.5">
              {data.map((item, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex-1 text-center text-[11px] font-medium transition-colors",
                    hovered === i ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {(item as { month?: string; day?: string })[label]}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap items-center gap-4 border-t pt-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-4 rounded-sm bg-primary/70" />
            <span className="text-xs text-muted-foreground">Revenue</span>
          </div>
          {range === "monthly" && (
            <div className="flex items-center gap-2">
              <div className="h-0.5 w-4 rounded-full bg-amber-400/70" />
              <span className="text-xs text-muted-foreground">Target</span>
            </div>
          )}
          <div className="ml-auto text-xs text-muted-foreground">
            Peak:{" "}
            <span className="font-semibold text-foreground">
              €{Math.max(...data.map((d) => d.revenue)).toLocaleString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
