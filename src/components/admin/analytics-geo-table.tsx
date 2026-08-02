"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { geographicData } from "@/lib/admin/mock-data";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

type SortKey = "bookings" | "revenue" | "growth";

export function AnalyticsGeoTable() {
  const [sortBy, setSortBy] = useState<SortKey>("bookings");

  const maxBookings = Math.max(...geographicData.map((d) => d.bookings));

  const sorted = [...geographicData].sort((a, b) => b[sortBy] - a[sortBy]);

  return (
    <Card className="col-span-full">
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Top Markets</CardTitle>
          <CardDescription>Bookings and revenue by customer country</CardDescription>
        </div>
        {/* Sort pills */}
        <div className="flex shrink-0 gap-1 rounded-lg border bg-muted/50 p-1">
          {(["bookings", "revenue", "growth"] as SortKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setSortBy(key)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-all",
                sortBy === key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {key}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sorted.map((row, i) => (
            <div
              key={row.country}
              className="group flex items-center gap-4 rounded-xl p-3 transition-colors hover:bg-muted/40"
            >
              {/* Rank */}
              <span className="w-5 shrink-0 text-center text-sm font-bold text-muted-foreground">
                {i + 1}
              </span>

              {/* Flag + Country */}
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <span className="text-xl leading-none">{row.flag}</span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{row.country}</p>
                  {/* Mini bar */}
                  <div className="mt-1 h-1.5 w-full max-w-[140px] overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary/60 transition-all duration-500 group-hover:bg-primary"
                      style={{ width: `${(row.bookings / maxBookings) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex shrink-0 items-center gap-6 text-right text-sm">
                <div className="hidden sm:block">
                  <p className="font-semibold">{row.bookings.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">bookings</p>
                </div>
                <div className="hidden md:block">
                  <p className="font-semibold">€{row.revenue.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">revenue</p>
                </div>
                <div className="flex items-center gap-1">
                  {row.growth >= 0 ? (
                    <TrendingUp className="size-3.5 text-emerald-500" />
                  ) : (
                    <TrendingDown className="size-3.5 text-destructive" />
                  )}
                  <span
                    className={cn(
                      "text-xs font-semibold",
                      row.growth >= 0 ? "text-emerald-600" : "text-destructive"
                    )}
                  >
                    {row.growth > 0 ? "+" : ""}
                    {row.growth}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
