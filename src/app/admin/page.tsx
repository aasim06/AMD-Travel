import {
  Euro,
  BookOpen,
  Users,
  TrendingUp,
  Plane,
  Package,
  FileText,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { StatCard } from "@/components/admin/stat-card";
import { RevenueChart } from "@/components/admin/revenue-chart";
import { BookingsTable } from "@/components/admin/bookings-table";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  dashboardStats,
  recentBookings,
  topDestinations,
} from "@/lib/admin/mock-data";

const statIcons = [Euro, BookOpen, Users, TrendingUp];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Dashboard"
        description="Welcome back! Here's what's happening with your travel business."
        actions={
          <Button asChild>
            <Link href="/admin/bookings">
              <Plus className="size-4" />
              New Booking
            </Link>
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((stat, i) => {
          const Icon = statIcons[i];
          return (
            <StatCard
              key={stat.label}
              {...stat}
              icon={<Icon className="size-5" />}
            />
          );
        })}
      </div>

      {/* Charts + Destinations */}
      <div className="grid gap-6 lg:grid-cols-3">
        <RevenueChart />

        <Card>
          <CardHeader>
            <CardTitle>Top Destinations</CardTitle>
            <CardDescription>Most booked destinations this month</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {topDestinations.map((dest) => (
              <div key={dest.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{dest.name}</span>
                  <span className="text-muted-foreground">{dest.bookings} bookings</span>
                </div>
                <Progress value={dest.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Manage Bookings", href: "/admin/bookings", icon: BookOpen, count: "24 pending" },
          { label: "Umrah Packages", href: "/admin/umrah-packages", icon: Package, count: "4 packages" },
          { label: "Visa Applications", href: "/admin/visa", icon: FileText, count: "8 pending" },
          { label: "View Analytics", href: "/admin/analytics", icon: TrendingUp, count: "Full report" },
        ].map((action) => (
          <Link key={action.href} href={action.href}>
            <Card className="group cursor-pointer transition-all hover:border-primary/30 hover:shadow-md">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <action.icon className="size-5" />
                </div>
                <div>
                  <p className="font-heading text-sm font-semibold">{action.label}</p>
                  <p className="text-xs text-muted-foreground">{action.count}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Bookings */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Bookings</CardTitle>
            <CardDescription>Latest transactions across all services</CardDescription>
          </div>
          <Badge variant="outline" className="hidden sm:flex">
            <Plane className="mr-1 size-3" />
            Live
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <BookingsTable bookings={recentBookings} showViewAll />
        </CardContent>
      </Card>
    </div>
  );
}
