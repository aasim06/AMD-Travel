"use client";

import { revenueChartData } from "@/lib/admin/mock-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function RevenueChart() {
  const maxRevenue = Math.max(...revenueChartData.map((d) => d.revenue));

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle>Revenue Overview</CardTitle>
        <CardDescription>Monthly revenue and booking trends</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex h-[280px] items-end gap-3 pt-4">
          {revenueChartData.map((item) => {
            const height = (item.revenue / maxRevenue) * 100;
            return (
              <div key={item.month} className="group flex flex-1 flex-col items-center gap-2">
                <div className="relative w-full">
                  <div
                    className="mx-auto w-full max-w-[48px] rounded-t-lg bg-gradient-to-t from-primary/80 to-primary transition-all duration-300 group-hover:from-primary group-hover:to-emerald-400"
                    style={{ height: `${height * 2}px` }}
                  />
                  <div className="absolute -top-8 left-1/2 hidden -translate-x-1/2 rounded-md bg-foreground px-2 py-1 text-[10px] font-medium text-background group-hover:block">
                    €{(item.revenue / 1000).toFixed(0)}k
                  </div>
                </div>
                <span className="text-[11px] font-medium text-muted-foreground">{item.month}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex items-center justify-center gap-6 border-t pt-4">
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-sm bg-primary" />
            <span className="text-xs text-muted-foreground">Revenue</span>
          </div>
          <div className="text-xs text-muted-foreground">
            Total: <span className="font-semibold text-foreground">€437,000</span> YTD
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
