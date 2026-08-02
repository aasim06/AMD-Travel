import { Download, TrendingUp, TrendingDown } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnalyticsBarChart } from "@/components/admin/analytics-bar-chart";
import { AnalyticsDonutChart } from "@/components/admin/analytics-donut-chart";
import { AnalyticsFunnel } from "@/components/admin/analytics-funnel";
import { AnalyticsGeoTable } from "@/components/admin/analytics-geo-table";
import { AnalyticsRoutesTable } from "@/components/admin/analytics-routes-table";
import { analyticsKpis } from "@/lib/admin/mock-data";
import { cn } from "@/lib/utils";

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Analytics"
        description="Deep dive into revenue, bookings, and growth metrics."
        breadcrumbs={[{ label: "Analytics" }]}
        actions={
          <>
            <Badge variant="outline" className="hidden gap-1.5 sm:flex">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live data
            </Badge>
            <Button variant="outline" size="sm">
              <Download className="size-4" />
              Export Report
            </Button>
          </>
        }
      />

      {/* KPI Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {analyticsKpis.map((kpi) => {
          const isPositive = kpi.change >= 0;
          return (
            <Card
              key={kpi.label}
              className="relative overflow-hidden transition-shadow hover:shadow-md"
            >
              {/* Subtle accent bar on top */}
              <div
                className={cn(
                  "absolute inset-x-0 top-0 h-0.5",
                  isPositive ? "bg-emerald-500/60" : "bg-red-500/60"
                )}
              />
              <CardContent className="p-5">
                <p className="text-sm font-medium text-muted-foreground">{kpi.label}</p>
                <p className="mt-1 font-heading text-2xl font-bold tracking-tight">
                  {kpi.value}
                </p>
                <div className="mt-2 flex items-center gap-1.5">
                  {isPositive ? (
                    <TrendingUp className="size-3.5 text-emerald-600" />
                  ) : (
                    <TrendingDown className="size-3.5 text-red-500" />
                  )}
                  <span
                    className={cn(
                      "text-xs font-semibold",
                      isPositive ? "text-emerald-600" : "text-red-500"
                    )}
                  >
                    {isPositive ? "+" : ""}
                    {kpi.change}%
                  </span>
                  <span className="text-xs text-muted-foreground">{kpi.changeLabel}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Revenue Bar Chart + Donut */}
      <div className="grid gap-6 lg:grid-cols-3">
        <AnalyticsBarChart />
        <AnalyticsDonutChart />
      </div>

      {/* Funnel + Top Routes */}
      <div className="grid gap-6 lg:grid-cols-3">
        <AnalyticsFunnel />
        <AnalyticsRoutesTable />
      </div>

      {/* Geographic breakdown — full width */}
      <AnalyticsGeoTable />
    </div>
  );
}
