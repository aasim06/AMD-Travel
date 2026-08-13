"use client";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import BookingsTable, { initialBookings, Booking } from "@/components/bookings/BookingsTable";
import InquiriesTable from "@/components/bookings/InquiriesTable";
import { useState, useEffect } from "react";

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState<"bookings" | "inquiries">("bookings");
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
            passengerName: b.passengers?.[0] ? `${b.passengers[0].firstName} ${b.passengers[0].lastName}` : b.user?.name || "Passenger",
            passengerEmail: b.passengers?.[0]?.email || b.user?.email || "customer@amdglobaltravel.com",
            routeCode: `${b.origin} ➔ ${b.destination}`,
            airline: b.airline,
            flightNo: b.flightNumber || "EK-204",
            seatNo: "14A (Economy)",
            travelDate: new Date(b.departureDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            amount: `${b.currency === "EUR" ? "€" : "$"}${b.totalAmount.toLocaleString()}`,
            paymentMethod: b.payment?.gateway || "Stripe",
            status: b.status === "CONFIRMED" ? "Confirmed" : b.status === "PENDING" ? "Pending" : "Cancelled",
          }));
          setBookings(mapped);
        }
      } catch (err) {
        console.error("Failed to load live DB bookings", err);
      }
    }
    loadLiveBookings();
  }, []);

  return (
    <div>
      <PageBreadcrumb pageTitle="Bookings & Inquiries" />

      {/* Page Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
            Flight Bookings & Inquiries
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Monitor confirmed ticket reservations, payment statuses, and customer inquiries.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="inline-flex items-center rounded-lg border border-gray-200 bg-white p-1 dark:border-gray-800 dark:bg-gray-900 shrink-0">
          <button
            onClick={() => setActiveTab("bookings")}
            className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors duration-200 ${
              activeTab === "bookings"
                ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
                : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            Flight Bookings
          </button>
          <button
            onClick={() => setActiveTab("inquiries")}
            className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors duration-200 ${
              activeTab === "inquiries"
                ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
                : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            Customer Inquiries
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === "bookings" ? (
        <BookingsTable bookings={bookings} />
      ) : (
        <InquiriesTable />
      )}
    </div>
  );
}
