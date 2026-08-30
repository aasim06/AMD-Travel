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
import { Trash2, CheckCircle2, Clock, XCircle, Eye, Plane, Car, Moon } from "lucide-react";

export interface Booking {
  id: string | number;
  pnr: string;
  passengerName: string;
  passengerEmail: string;
  passengerPhone?: string;
  passportNo?: string;
  routeCode: string;
  airline: string;
  travelDate: string;
  amount: string;
  paymentMethod: string;
  status: "Confirmed" | "Pending" | "Cancelled";
  seatNo?: string;
  flightNo?: string;
  type?: string;
}

export const initialBookings: Booking[] = [];

const PAGE_SIZE = 8;

interface BookingsTableProps {
  bookings: Booking[];
  activeTab?: string;
  onStatusChange?: (id: string | number, status: "Confirmed" | "Pending" | "Cancelled") => void;
  onDelete?: (id: string | number) => void;
}

export default function BookingsTable({
  bookings,
  activeTab = "all",
  onStatusChange,
  onDelete,
}: BookingsTableProps) {
  const [page, setPage] = useState(1);
  const [viewingBooking, setViewingBooking] = useState<Booking | null>(null);

  const totalPages = Math.max(1, Math.ceil(bookings.length / PAGE_SIZE));
  const paginated = bookings.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      {bookings.length === 0 ? (
        <div className="py-16 text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 mb-3">
            {activeTab === "flight" ? (
              <Plane className="w-7 h-7 text-brand-500" />
            ) : activeTab === "car" ? (
              <Car className="w-7 h-7 text-brand-500" />
            ) : activeTab === "umrah" ? (
              <Moon className="w-7 h-7 text-brand-500" />
            ) : (
              <Eye className="w-7 h-7 text-gray-400" />
            )}
          </div>
          <h3 className="text-base font-semibold text-gray-800 dark:text-white">
            No {activeTab !== "all" ? `${activeTab} bookings` : "bookings"} found
          </h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto mt-1">
            New customer bookings will appear here automatically in real-time.
          </p>
        </div>
      ) : (
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
                  Route & Service
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
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                        {booking.airline}
                      </span>
                      {booking.flightNo && (
                        <span className="text-[10px] text-gray-400 font-mono">
                          {booking.flightNo}
                        </span>
                      )}
                    </div>
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
                    <div className="flex items-center gap-1.5">
                      {/* View details */}
                      <button
                        title="View Full Booking Details"
                        onClick={() => setViewingBooking(booking)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-brand-50 hover:border-brand-200 hover:text-brand-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-brand-500/10 dark:hover:text-brand-400 transition-colors duration-150 cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Confirm status */}
                      {booking.status !== "Confirmed" && onStatusChange && (
                        <button
                          title="Mark as Confirmed"
                          onClick={() => onStatusChange(booking.id, "Confirmed")}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-400 transition-colors duration-150 cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}

                      {/* Cancel status */}
                      {booking.status !== "Cancelled" && onStatusChange && (
                        <button
                          title="Mark as Cancelled"
                          onClick={() => onStatusChange(booking.id, "Cancelled")}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-400 transition-colors duration-150 cursor-pointer"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}

                      {/* Delete */}
                      {onDelete && (
                        <button
                          title="Delete Booking"
                          onClick={() => onDelete(booking.id)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400 transition-colors duration-150 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {bookings.length > 0 && (
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
      )}

      {/* ========================================================================= */}
      {/* BOOKING DETAILS PREVIEW MODAL */}
      {/* ========================================================================= */}
      {viewingBooking && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 font-bold text-[10px]">
                  PNR
                </span>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                    Reservation Details
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    PNR: {viewingBooking.pnr}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingBooking(null)}
                className="rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200 p-1.5 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Ticket Info Card */}
            <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50/70 p-4 dark:border-gray-800 dark:bg-gray-800/40 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase">
                  {viewingBooking.airline} {viewingBooking.flightNo ? `(${viewingBooking.flightNo})` : ""}
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
                  <span className="text-gray-400 block">Contact Email</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200 break-all">{viewingBooking.passengerEmail}</span>
                </div>
                {viewingBooking.passengerPhone && (
                  <div>
                    <span className="text-gray-400 block">Contact Phone</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{viewingBooking.passengerPhone}</span>
                  </div>
                )}
                {viewingBooking.passportNo && (
                  <div>
                    <span className="text-gray-400 block">Passport / ID</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200 font-mono">{viewingBooking.passportNo}</span>
                  </div>
                )}
                <div>
                  <span className="text-gray-400 block">Travel Date</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{viewingBooking.travelDate}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Seat / Reservation</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{viewingBooking.seatNo || "Economy"}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Total Paid</span>
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
                              <div class="logo">AMD Global Travel</div>
                              <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Official Electronic Reservation Pass</div>
                            </div>
                            <div>
                              <div class="pnr">PNR: ${viewingBooking.pnr}</div>
                            </div>
                          </div>

                          <div class="details">
                            <div><div class="label">Passenger Name</div><div class="val">${viewingBooking.passengerName}</div></div>
                            <div><div class="label">Contact Email</div><div class="val">${viewingBooking.passengerEmail}</div></div>
                            <div><div class="label">Carrier & Service</div><div class="val">${viewingBooking.airline} (${viewingBooking.flightNo || "RESERVATION"})</div></div>
                            <div><div class="label">Route</div><div class="val">${viewingBooking.routeCode}</div></div>
                            <div><div class="label">Travel Date</div><div class="val">${viewingBooking.travelDate}</div></div>
                            <div><div class="label">Class / Reservation</div><div class="val">${viewingBooking.seatNo || "Standard"}</div></div>
                            <div><div class="label">Total Paid</div><div class="val" style="color:#16a34a;">${viewingBooking.amount}</div></div>
                            <div><div class="label">Ticket Status</div><div class="val" style="color:#2563eb;">${viewingBooking.status}</div></div>
                          </div>

                          <div class="footer-note">
                            Thank you for choosing AMD Global Travel — Fly Smarter, Travel Further.<br/>
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
