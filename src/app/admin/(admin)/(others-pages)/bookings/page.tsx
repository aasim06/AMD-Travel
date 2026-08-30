"use client";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import BookingsTable, { Booking } from "@/components/bookings/BookingsTable";
import InquiriesTable from "@/components/bookings/InquiriesTable";
import { useState, useEffect, useCallback } from "react";
import { RefreshCw } from "lucide-react";

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState<"all" | "car" | "umrah" | "flight" | "inquiries">("all");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadLiveBookings = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await fetch("/api/admin/bookings", { cache: "no-store" });
      const json = await res.json();
      if (json?.data && json.data.length > 0) {
        const mapped: Booking[] = json.data.map((b: any, index: number) => {
          const leadPassenger = b.passengers?.[0];
          const passengerName = leadPassenger
            ? `${leadPassenger.firstName} ${leadPassenger.lastName}`.trim()
            : b.user?.name || "Customer";
          const passengerEmail = leadPassenger?.email || b.user?.email || "customer@amdglobaltravel.com";
          const passengerPhone = leadPassenger?.phone || b.user?.phone || "N/A";
          const passportNo = leadPassenger?.passportNo || "N/A";

          return {
            id: b.id || String(index + 100),
            pnr: b.pnr,
            passengerName,
            passengerEmail,
            passengerPhone,
            passportNo,
            routeCode: `${b.origin} ➔ ${b.destination}`,
            airline: b.airline || (b.type === "car" ? "Car Rental" : b.type === "umrah" ? "Umrah Package" : "Flight"),
            flightNo: b.flightNumber || (b.type?.toUpperCase() || "RESERVATION"),
            seatNo: b.type === "car" ? "Car Reservation" : b.type === "umrah" ? "Umrah Pilgrimage" : "Flight Seat",
            travelDate: new Date(b.departureDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            amount: `${b.currency === "EUR" ? "€" : "$"}${b.totalAmount.toLocaleString()}`,
            paymentMethod: b.payment?.gateway || "Online / Card",
            status: b.status === "CONFIRMED" ? "Confirmed" : b.status === "PENDING" ? "Pending" : "Cancelled",
            type: (b.type || "flight").toLowerCase(),
          };
        });
        setBookings(mapped);
      } else {
        setBookings([]);
      }
    } catch (err) {
      console.error("Failed to load live DB bookings", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadLiveBookings();
  }, [loadLiveBookings]);

  const handleStatusChange = async (id: string | number, newStatus: "Confirmed" | "Pending" | "Cancelled") => {
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus.toUpperCase() }),
      });
      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
        );
      }
    } catch (err) {
      console.error("Failed to update booking status:", err);
    }
  };

  const handleDeleteBooking = async (id: string | number) => {
    if (!confirm("Are you sure you want to delete this booking?")) return;
    try {
      const res = await fetch(`/api/admin/bookings?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setBookings((prev) => prev.filter((b) => b.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete booking:", err);
    }
  };

  const flightCount = bookings.filter((b) => b.type === "flight").length;
  const carCount = bookings.filter((b) => b.type === "car").length;
  const umrahCount = bookings.filter((b) => b.type === "umrah").length;

  const filteredBookings = activeTab === "all"
    ? bookings
    : activeTab === "inquiries"
    ? []
    : bookings.filter((b: any) => (b.type || "").toLowerCase() === activeTab);

  return (
    <div>
      <PageBreadcrumb pageTitle="Bookings & Inquiries" />

      {/* Page Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
            All Customer Bookings & Inquiries
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Live PostgreSQL reservations: Flights, Car Rentals, Umrah Packages & Customer Inquiries.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh Button */}
          <button
            onClick={() => loadLiveBookings(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors cursor-pointer shadow-xs"
            title="Refresh live bookings"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-brand-500" : ""}`} />
            <span>{refreshing ? "Syncing..." : "Sync Live DB"}</span>
          </button>

          {/* Tab Switcher */}
          <div className="inline-flex flex-wrap items-center rounded-lg border border-gray-200 bg-white p-1 dark:border-gray-800 dark:bg-gray-900 shrink-0 gap-1">
            <button
              onClick={() => setActiveTab("all")}
              className={`inline-flex items-center justify-center rounded-md px-3 py-1.5 text-xs font-semibold transition-colors duration-200 cursor-pointer gap-1.5 ${
                activeTab === "all"
                  ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
                  : "text-gray-500 hover:text-gray-800 dark:text-gray-400"
              }`}
            >
              <span>All Bookings</span>
              <span className="rounded-full bg-gray-100 dark:bg-gray-800 px-1.5 py-0.2 text-[10px] font-bold">
                {bookings.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("flight")}
              className={`inline-flex items-center justify-center rounded-md px-3 py-1.5 text-xs font-semibold transition-colors duration-200 cursor-pointer gap-1.5 ${
                activeTab === "flight"
                  ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
                  : "text-gray-500 hover:text-gray-800 dark:text-gray-400"
              }`}
            >
              <span>Flight Bookings</span>
              <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                flightCount > 0
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-500"
              }`}>
                {flightCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("car")}
              className={`inline-flex items-center justify-center rounded-md px-3 py-1.5 text-xs font-semibold transition-colors duration-200 cursor-pointer gap-1.5 ${
                activeTab === "car"
                  ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
                  : "text-gray-500 hover:text-gray-800 dark:text-gray-400"
              }`}
            >
              <span>Car Rentals</span>
              <span className="rounded-full bg-gray-100 dark:bg-gray-800 px-1.5 py-0.2 text-[10px] font-bold">
                {carCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("umrah")}
              className={`inline-flex items-center justify-center rounded-md px-3 py-1.5 text-xs font-semibold transition-colors duration-200 cursor-pointer gap-1.5 ${
                activeTab === "umrah"
                  ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
                  : "text-gray-500 hover:text-gray-800 dark:text-gray-400"
              }`}
            >
              <span>Umrah Packages</span>
              <span className="rounded-full bg-gray-100 dark:bg-gray-800 px-1.5 py-0.2 text-[10px] font-bold">
                {umrahCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("inquiries")}
              className={`inline-flex items-center justify-center rounded-md px-3 py-1.5 text-xs font-semibold transition-colors duration-200 cursor-pointer ${
                activeTab === "inquiries"
                  ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
                  : "text-gray-500 hover:text-gray-800 dark:text-gray-400"
              }`}
            >
              Inquiries
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="min-h-[300px] flex items-center justify-center rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
            <p className="text-xs text-gray-400">Loading bookings from database...</p>
          </div>
        </div>
      ) : activeTab === "inquiries" ? (
        <InquiriesTable />
      ) : (
        <BookingsTable
          bookings={filteredBookings}
          activeTab={activeTab}
          onStatusChange={handleStatusChange}
          onDelete={handleDeleteBooking}
        />
      )}
    </div>
  );
}
