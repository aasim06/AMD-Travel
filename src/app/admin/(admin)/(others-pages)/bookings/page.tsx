"use client";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import BookingsTable, { initialBookings, Booking } from "@/components/bookings/BookingsTable";
import InquiriesTable from "@/components/bookings/InquiriesTable";
import { useState, useEffect } from "react";

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState<"all" | "car" | "umrah" | "flight" | "inquiries">("all");
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);

  useEffect(() => {
    async function loadLiveBookings() {
      try {
        const res = await fetch("/api/admin/bookings");
        const json = await res.json();
        if (json?.data && json.data.length > 0) {
          const mapped: Booking[] = json.data.map((b: any, index: number) => ({
            id: b.id || index + 100,
            pnr: b.pnr,
            passengerName: b.passengers?.[0] ? `${b.passengers[0].firstName} ${b.passengers[0].lastName}` : b.user?.name || "Customer",
            passengerEmail: b.passengers?.[0]?.email || b.user?.email || "customer@amdglobaltravel.com",
            routeCode: `${b.origin} ➔ ${b.destination}`,
            airline: b.airline || (b.type === "car" ? "Car Rental" : b.type === "umrah" ? "Umrah Package" : "Flight"),
            flightNo: b.flightNumber || (b.type?.toUpperCase() || "RESERVATION"),
            seatNo: b.type === "car" ? "Car Reservation" : b.type === "umrah" ? "Umrah Pilgrimage" : "Flight Seat",
            travelDate: new Date(b.departureDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            amount: `${b.currency === "EUR" ? "€" : "$"}${b.totalAmount.toLocaleString()}`,
            paymentMethod: b.payment?.gateway || "WhatsApp / Stripe",
            status: b.status === "CONFIRMED" ? "Confirmed" : b.status === "PENDING" ? "Pending" : "Cancelled",
            type: b.type || "flight",
          }));
          setBookings(mapped);
        }
      } catch (err) {
        console.error("Failed to load live DB bookings", err);
      }
    }
    loadLiveBookings();
  }, []);

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
            Monitor confirmed reservations, car rentals, Umrah packages, and customer inquiries.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="inline-flex flex-wrap items-center rounded-lg border border-gray-200 bg-white p-1 dark:border-gray-800 dark:bg-gray-900 shrink-0 gap-1">
          <button
            onClick={() => setActiveTab("all")}
            className={`inline-flex items-center justify-center rounded-md px-3 py-1.5 text-xs font-semibold transition-colors duration-200 cursor-pointer ${
              activeTab === "all"
                ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
                : "text-gray-500 hover:text-gray-800 dark:text-gray-400"
            }`}
          >
            All Bookings ({bookings.length})
          </button>

          <button
            onClick={() => setActiveTab("car")}
            className={`inline-flex items-center justify-center rounded-md px-3 py-1.5 text-xs font-semibold transition-colors duration-200 cursor-pointer ${
              activeTab === "car"
                ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
                : "text-gray-500 hover:text-gray-800 dark:text-gray-400"
            }`}
          >
            Car Rentals
          </button>

          <button
            onClick={() => setActiveTab("umrah")}
            className={`inline-flex items-center justify-center rounded-md px-3 py-1.5 text-xs font-semibold transition-colors duration-200 cursor-pointer ${
              activeTab === "umrah"
                ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
                : "text-gray-500 hover:text-gray-800 dark:text-gray-400"
            }`}
          >
            Umrah Packages
          </button>

          <button
            onClick={() => setActiveTab("flight")}
            className={`inline-flex items-center justify-center rounded-md px-3 py-1.5 text-xs font-semibold transition-colors duration-200 cursor-pointer ${
              activeTab === "flight"
                ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
                : "text-gray-500 hover:text-gray-800 dark:text-gray-400"
            }`}
          >
            Flight Bookings
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

      {/* Main Content Area */}
      {activeTab === "inquiries" ? (
        <InquiriesTable />
      ) : (
        <BookingsTable bookings={filteredBookings} />
      )}
    </div>
  );
}

