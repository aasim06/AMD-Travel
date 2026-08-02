"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { bookingTypeBreakdown } from "@/lib/admin/mock-data";
import { cn } from "@/lib/utils";

export function AnalyticsDonutChart() {
  const [hovered, setHovered] = useState<number | null>(null);

  const total = bookingTypeBreakdown.reduce((sum, d) => sum + d.count, 0);
  const totalRevenue = bookingTypeBreakdown.reduce((sum, d) => sum + d.revenue, 0);

  // Build SVG arc paths
  const cx = 80;
  const cy = 80;
  const r = 60;
  const innerR = 38;
  const gap = 2; // gap between segments in degrees

  function polarToCartesian(angle: number, radius: number) {
    const rad = ((angle - 90) * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(rad),
      y: cy + radius * Math.sin(rad),
    };
  }

  function buildArc(startAngle: number, endAngle: number, outer: number, inner: number) {
    const start = polarToCartesian(startAngle, outer);
    const end = polarToCartesian(endAngle, outer);
    const iStart = polarToCartesian(startAngle, inner);
    const iEnd = polarToCartesian(endAngle, inner);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    return [
      `M ${start.x} ${start.y}`,
      `A ${outer} ${outer} 0 ${largeArc} 1 ${end.x} ${end.y}`,
      `L ${iEnd.x} ${iEnd.y}`,
      `A ${inner} ${inner} 0 ${largeArc} 0 ${iStart.x} ${iStart.y}`,
      "Z",
    ].join(" ");
  }

  let cumulative = 0;
  const segments = bookingTypeBreakdown.map((item, i) => {
    const startAngle = cumulative + (i === 0 ? 0 : gap / 2);
    const slice = (item.count / total) * 360;
    const endAngle = cumulative + slice - (i === bookingTypeBreakdown.length - 1 ? 0 : gap / 2);
    cumulative += slice;

    const isHovered = hovered === i;
    const outerR = isHovered ? r + 5 : r;

    return {
      ...item,
      path: buildArc(startAngle, endAngle, outerR, innerR),
      midAngle: startAngle + (endAngle - startAngle) / 2,
    };
  });

  const activeItem = hovered !== null ? bookingTypeBreakdown[hovered] : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking Mix</CardTitle>
        <CardDescription>Revenue breakdown by service type</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          {/* SVG donut */}
          <div className="relative shrink-0">
            <svg width="160" height="160" viewBox="0 0 160 160" className="overflow-visible">
              {segments.map((seg, i) => (
                <path
                  key={seg.type}
                  d={seg.path}
                  fill={seg.color}
                  className="cursor-pointer transition-all duration-200"
                  style={{ opacity: hovered === null || hovered === i ? 1 : 0.4 }}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                />
              ))}
            </svg>

            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              {activeItem ? (
                <>
                  <p className="text-[11px] font-medium text-muted-foreground leading-tight max-w-[60px] text-center">
                    {activeItem.type}
                  </p>
                  <p className="font-heading text-lg font-bold leading-tight">
                    {activeItem.percentage}%
                  </p>
                </>
              ) : (
                <>
                  <p className="text-[10px] text-muted-foreground">Total</p>
                  <p className="font-heading text-lg font-bold">{total.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">bookings</p>
                </>
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="w-full space-y-2">
            {bookingTypeBreakdown.map((item, i) => (
              <div
                key={item.type}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 transition-colors",
                  hovered === i ? "bg-muted" : "hover:bg-muted/50"
                )}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              >
                <div
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="min-w-0 flex-1 truncate text-xs font-medium">{item.type}</span>
                <div className="text-right">
                  <p className="text-xs font-semibold">{item.percentage}%</p>
                  <p className="text-[10px] text-muted-foreground">
                    €{(item.revenue / 1000).toFixed(0)}k
                  </p>
                </div>
              </div>
            ))}

            <div className="border-t pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Total Revenue</span>
                <span className="font-semibold">
                  €{(totalRevenue / 1000).toFixed(0)}k
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
