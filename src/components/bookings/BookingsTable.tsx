"use client";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";

export interface Booking {
  id: number;
  pnr: string;
  passengerName: string;
  passengerEmail: string;
  routeCode: string;
  airline: string;
  travelDate: string;
  amount: string;
  paymentMethod: string;
  status: "Confirmed" | "Pending" | "Cancelled";
  seatNo?: string;
  flightNo?: string;
}

export const initialBookings: Booking[] = [];

const PAGE_SIZE = 5;

interface BookingsTableProps {
  bookings: Booking[];
}

export default function BookingsTable({ bookings }: BookingsTableProps) {
  const [page, setPage] = useState(1);
  const [viewingBooking, setViewingBooking] = useState<Booking | null>(null);

  const totalPages = Math.ceil(bookings.length / PAGE_SIZE);
  const paginated = bookings.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          {/* Header */}
          <TableHeader className="border-b border-gray-100 dark:border-gray-800">
            <TableRow>
              <TableCell
                isHeader
                className="px-5 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
              >
                Booking ID / PNR
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
              >
                Passenger
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
              >
                Route & Airline
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
              >
                Travel Date
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
              >
                Total Paid
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
              >
                Status
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>

          {/* Body */}
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {paginated.map((booking) => (
              <TableRow
                key={booking.id}
                className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors duration-150"
              >
                {/* PNR */}
                <TableCell className="px-5 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                    {booking.pnr}
                  </span>
                </TableCell>

                {/* Passenger */}
                <TableCell className="px-5 py-4 whitespace-nowrap">
                  <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                    {booking.passengerName}
                  </p>
                  <span className="text-gray-400 text-theme-xs dark:text-gray-500">
                    {booking.passengerEmail}
                  </span>
                </TableCell>

                {/* Route & Airline */}
                <TableCell className="px-5 py-4 whitespace-nowrap">
                  <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                    {booking.routeCode}
                  </p>
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 mt-1 dark:bg-gray-800 dark:text-gray-300">
                    {booking.airline}
                  </span>
                </TableCell>

                {/* Travel Date */}
                <TableCell className="px-5 py-4 whitespace-nowrap">
                  <span className="text-gray-600 text-theme-sm dark:text-gray-300">
                    {booking.travelDate}
                  </span>
                </TableCell>

                {/* Amount Paid */}
                <TableCell className="px-5 py-4 whitespace-nowrap">
                  <span className="font-semibold text-gray-800 text-theme-sm dark:text-white/90">
                    {booking.amount}
                  </span>
                  <span className="block text-gray-400 text-theme-xs dark:text-gray-500">
                    via {booking.paymentMethod}
                  </span>
                </TableCell>

                {/* Status */}
                <TableCell className="px-5 py-4 whitespace-nowrap">
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
                    <span
                      className={`w-1.5 h-1.5 rounded-full inline-block mr-1 ${
                        booking.status === "Confirmed"
                          ? "bg-success-500"
                          : booking.status === "Pending"
                          ? "bg-warning-500"
                          : "bg-error-500"
                      }`}
                    />
                    {booking.status}
                  </Badge>
                </TableCell>

                {/* Actions */}
                <TableCell className="px-5 py-4 whitespace-nowrap">
                  <button
                    title="View Booking Preview"
                    onClick={() => setViewingBooking(booking)}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-brand-50 hover:border-brand-200 hover:text-brand-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-brand-500/10 dark:hover:text-brand-400 transition-colors duration-150 cursor-pointer"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.8}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                      />
                    </svg>
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-gray-100 px-5 py-4 dark:border-gray-800 sm:px-6">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Showing{" "}
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {(page - 1) * PAGE_SIZE + 1}
          </span>{" "}
          to{" "}
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {Math.min(page * PAGE_SIZE, bookings.length)}
          </span>{" "}
          of{" "}
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {bookings.length}
          </span>{" "}
          bookings
        </p>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.05] transition-colors duration-150 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`inline-flex items-center justify-center w-9 h-9 rounded-lg border text-sm font-medium transition-colors duration-150 cursor-pointer ${
                p === page
                  ? "border-brand-500 bg-brand-500 text-white"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.05]"
              }`}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.05] transition-colors duration-150 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BOOKING DETAILS PREVIEW MODAL */}
      {/* ========================================================================= */}
      {viewingBooking && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 font-bold text-xs">
                  ✈
                </span>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                    Flight Booking Details
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    PNR: {viewingBooking.pnr}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingBooking(null)}
                className="rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200 p-1.5 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Ticket Info Card */}
            <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50/70 p-4 dark:border-gray-800 dark:bg-gray-800/40 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase">
                  {viewingBooking.airline} ({viewingBooking.flightNo || "EK-623"})
                </span>
                <Badge
                  size="sm"
                  color={
                    viewingBooking.status === "Confirmed"
                      ? "success"
                      : viewingBooking.status === "Pending"
                      ? "warning"
                      : "error"
                  }
                >
                  {viewingBooking.status}
                </Badge>
              </div>

              <h4 className="text-base font-bold text-gray-800 dark:text-white">
                {viewingBooking.routeCode}
              </h4>

              <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <span className="text-gray-400 block">Passenger Name</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{viewingBooking.passengerName}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Email</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{viewingBooking.passengerEmail}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Travel Date</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{viewingBooking.travelDate}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Seat / Cabin</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{viewingBooking.seatNo || "12B (Economy)"}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Total Amount</span>
                  <span className="font-bold text-success-600 dark:text-success-400 text-sm">{viewingBooking.amount}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Payment Method</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">via {viewingBooking.paymentMethod}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-5 flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => {
                  const printWin = window.open("", "_blank");
                  if (!printWin) return;
                  printWin.document.write(`
                    <html>
                      <head>
                        <title>E-Ticket_${viewingBooking.pnr}</title>
                        <style>
                          body { font-family: 'Outfit', sans-serif; padding: 40px; color: #1e293b; }
                          .ticket-box { border: 2px solid #3b82f6; border-radius: 16px; padding: 30px; max-width: 650px; margin: auto; }
                          .header { display: flex; justify-content: space-between; border-bottom: 2px dashed #cbd5e1; padding-bottom: 20px; }
                          .logo { font-size: 22px; font-weight: bold; color: #1e3a8a; }
                          .pnr { font-size: 20px; font-weight: bold; color: #2563eb; background: #eff6ff; padding: 6px 14px; border-radius: 8px; }
                          .details { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 25px; }
                          .label { font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: bold; }
                          .val { font-size: 14px; font-weight: bold; color: #0f172a; margin-top: 2px; }
                          .footer-note { margin-top: 30px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; }
                        </style>
                      </head>
                      <body>
                        <div class="ticket-box">
                          <div class="header">
                            <div>
                              <div class="logo">✈️ AMD Global Travel</div>
                              <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Official Electronic Flight Pass</div>
                            </div>
                            <div>
                              <div class="pnr">PNR: ${viewingBooking.pnr}</div>
                            </div>
                          </div>

                          <div class="details">
                            <div><div class="label">Passenger Name</div><div class="val">${viewingBooking.passengerName}</div></div>
                            <div><div class="label">Contact Email</div><div class="val">${viewingBooking.passengerEmail}</div></div>
                            <div><div class="label">Airline & Flight</div><div class="val">${viewingBooking.airline} (${viewingBooking.flightNo || "EK-204"})</div></div>
                            <div><div class="label">Route</div><div class="val">${viewingBooking.routeCode}</div></div>
                            <div><div class="label">Travel Date</div><div class="val">${viewingBooking.travelDate}</div></div>
                            <div><div class="label">Seat / Class</div><div class="val">${viewingBooking.seatNo || "14B (Economy)"}</div></div>
                            <div><div class="label">Total Paid</div><div class="val" style="color:#16a34a;">${viewingBooking.amount}</div></div>
                            <div><div class="label">Ticket Status</div><div class="val" style="color:#2563eb;">${viewingBooking.status}</div></div>
                          </div>

                          <div class="footer-note">
                            Thank you for booking with AMD Global Travel — Fly Smarter, Travel Further.<br/>
                            Support: support@amdglobaltravel.com | Helpline: +92 300 0000000
                          </div>
                        </div>
                        <script>window.print();</script>
                      </body>
                    </html>
                  `);
                  printWin.document.close();
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-brand-500 bg-brand-50 px-4 py-2 text-xs font-bold text-brand-600 hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400 cursor-pointer transition-colors"
              >
                📥 Download E-Ticket PDF
              </button>

              <button
                type="button"
                onClick={() => setViewingBooking(null)}
                className="rounded-lg bg-brand-500 px-5 py-2 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
