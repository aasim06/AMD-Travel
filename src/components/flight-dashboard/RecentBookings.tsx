"use client";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { initialBookings } from "../bookings/BookingsTable";

export default function RecentBookings() {
  const [bookings, setBookings] = useState<any[]>(initialBookings.slice(0, 5));

  useEffect(() => {
    async function loadBookings() {
      try {
        const res = await fetch("/api/admin/bookings");
        const json = await res.json();
        if (json?.data && json.data.length > 0) {
          const mapped = json.data.slice(0, 5).map((b: any) => ({
            id: b.id,
            pnr: b.pnr,
            passengerName: b.passengers?.[0] ? `${b.passengers[0].firstName} ${b.passengers[0].lastName}` : b.user?.name || "Passenger",
            routeCode: `${b.origin} ➔ ${b.destination}`,
            airline: b.airline,
            amount: `${b.currency === "EUR" ? "€" : "$"}${b.totalAmount.toLocaleString()}`,
            status: b.status === "CONFIRMED" ? "Confirmed" : b.status === "PENDING" ? "Pending" : "Cancelled",
          }));
          setBookings(mapped);
        }
      } catch (err) {
        console.error("Failed to load DB bookings", err);
      }
    }
    loadBookings();
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-5 pt-5 pb-3 sm:px-6 sm:pt-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Recent Bookings
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Preview of the latest 5 ticket reservations.
        </p>
      </div>

      <div className="max-w-full overflow-x-auto mt-2">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-gray-800">
            <TableRow>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap">
                PNR
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap">
                Passenger
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap">
                Route & Airline
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap">
                Amount Paid
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap">
                Status
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {bookings.map((booking) => (
              <TableRow key={booking.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors duration-150">
                <TableCell className="px-5 py-3 whitespace-nowrap">
                  <span className="inline-flex items-center rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                    {booking.pnr}
                  </span>
                </TableCell>
                <TableCell className="px-5 py-3 whitespace-nowrap">
                  <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                    {booking.passengerName}
                  </p>
                </TableCell>
                <TableCell className="px-5 py-3 whitespace-nowrap">
                  <span className="font-medium text-gray-800 text-theme-sm dark:text-gray-300">
                    {booking.routeCode}
                  </span>
                  <span className="ml-2 text-gray-500 text-xs">({booking.airline})</span>
                </TableCell>
                <TableCell className="px-5 py-3 whitespace-nowrap">
                  <span className="font-semibold text-gray-800 text-theme-sm dark:text-white/90">
                    {booking.amount}
                  </span>
                </TableCell>
                <TableCell className="px-5 py-3 whitespace-nowrap">
                  <Badge
                    size="sm"
                    color={
                      booking.status === "Confirmed"
                        ? "success"
                        : booking.status === "Pending"
                        ? "warning"
                        : "error"
                    }
                  >
                    {booking.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
