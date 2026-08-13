import type { Metadata } from "next";
import FlightMetrics from "@/components/flight-dashboard/FlightMetrics";
import RevenueChart from "@/components/flight-dashboard/RevenueChart";
import AirlineStatus from "@/components/flight-dashboard/AirlineStatus";
import RecentBookings from "@/components/flight-dashboard/RecentBookings";
import TopRoutesWidget from "@/components/flight-dashboard/TopRoutesWidget";
import ActionItemsWidget from "@/components/flight-dashboard/ActionItemsWidget";
import QuickFlightSearch from "@/components/flight-dashboard/QuickFlightSearch";
import DateRangeFilter from "@/components/flight-dashboard/DateRangeFilter";

export const metadata: Metadata = {
  title: "Flight Booking Dashboard | AMD Global Travel Admin",
  description: "Main Flight Booking System Dashboard Overview",
};

export default function FlightDashboard() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">

      {/* Dashboard Header with Date Filter */}
      <div className="col-span-12 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
            Flight Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Overview of bookings, revenue, and real-time operations.
          </p>
        </div>
        <DateRangeFilter />
      </div>

      {/* Top Metric Cards */}
      <div className="col-span-12">
        <FlightMetrics />
      </div>

      {/* Action Required Widget */}
      <div className="col-span-12">
        <ActionItemsWidget />
      </div>

      {/* Quick Flight Lookup */}
      <div className="col-span-12">
        <QuickFlightSearch />
      </div>

      {/* Revenue Chart + Top Routes side by side */}
      <div className="col-span-12 xl:col-span-8">
        <RevenueChart />
      </div>
      <div className="col-span-12 xl:col-span-4">
        <TopRoutesWidget />
      </div>

      {/* Airline Status + Recent Bookings */}
      <div className="col-span-12 xl:col-span-4">
        <AirlineStatus />
      </div>
      <div className="col-span-12 xl:col-span-8">
        <RecentBookings />
      </div>

    </div>
  );
}
