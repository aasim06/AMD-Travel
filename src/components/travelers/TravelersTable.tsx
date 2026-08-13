"use client";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

export interface Traveler {
  id: number;
  name: string;
  email: string;
  initials: string;
  avatarColor: string;
  phone: string;
  passportNumber?: string;
  nationality?: string;
  totalBookings: number;
  totalSpent: string;
  joinedDate: string;
  recentBookings?: {
    id: string;
    route: string;
    flightNo: string;
    date: string;
    status: "Confirmed" | "Completed" | "Cancelled";
    amount: string;
  }[];
}

interface TravelersTableProps {
  travelers: Traveler[];
  onViewTraveler: (traveler: Traveler) => void;
  onEditTraveler: (traveler: Traveler) => void;
  onDeleteTraveler: (id: number) => void;
}

const PAGE_SIZE = 5;

export default function TravelersTable({
  travelers,
  onViewTraveler,
  onEditTraveler,
  onDeleteTraveler,
}: TravelersTableProps) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(travelers.length / PAGE_SIZE));
  const paginated = travelers.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      {/* Table */}
      <div className="max-w-full overflow-x-auto">
        <Table>
          {/* Header */}
          <TableHeader className="border-b border-gray-100 dark:border-gray-800">
            <TableRow>
              <TableCell
                isHeader
                className="px-5 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
              >
                Traveler
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
              >
                Phone Number
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
              >
                Total Bookings
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
              >
                Total Spent
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
              >
                Joined Date
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
            {paginated.length > 0 ? (
              paginated.map((traveler) => (
                <TableRow
                  key={traveler.id}
                  className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors duration-150"
                >
                  {/* Traveler Name & Avatar */}
                  <TableCell className="px-5 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex items-center justify-center w-10 h-10 rounded-full ${traveler.avatarColor} shrink-0`}
                      >
                        <span className="text-sm font-semibold text-white">
                          {traveler.initials}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-theme-sm dark:text-white/90">
                          {traveler.name}
                        </p>
                        <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                          {traveler.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Phone */}
                  <TableCell className="px-5 py-4 text-gray-600 text-theme-sm dark:text-gray-300 whitespace-nowrap">
                    {traveler.phone}
                  </TableCell>

                  {/* Total Bookings */}
                  <TableCell className="px-5 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                          traveler.totalBookings === 0
                            ? "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                            : traveler.totalBookings >= 7
                            ? "bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-400"
                            : "bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400"
                        }`}
                      >
                        {traveler.totalBookings}
                      </span>
                      <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                        {traveler.totalBookings === 1 ? "flight" : "flights"}
                      </span>
                    </div>
                  </TableCell>

                  {/* Total Spent */}
                  <TableCell className="px-5 py-4 whitespace-nowrap">
                    <span className="font-semibold text-gray-800 text-theme-sm dark:text-white/90">
                      {traveler.totalSpent}
                    </span>
                    <span className="block text-gray-400 text-theme-xs dark:text-gray-500">
                      via Stripe
                    </span>
                  </TableCell>

                  {/* Joined Date */}
                  <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400 whitespace-nowrap">
                    {traveler.joinedDate}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="px-5 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {/* View Details / Preview Modal */}
                      <button
                        title="View Preview & Booking History"
                        onClick={() => onViewTraveler(traveler)}
                        className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-brand-50 hover:border-brand-200 hover:text-brand-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-brand-500/10 dark:hover:text-brand-400 transition-colors duration-150 cursor-pointer"
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
                            d="M2.25 12s3.375-6.75 9.75-6.75S21.75 12 21.75 12s-3.375 6.75-9.75 6.75S2.25 12 2.25 12Z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                          />
                        </svg>
                      </button>

                      {/* Edit Traveler */}
                      <button
                        title="Edit Traveler"
                        onClick={() => onEditTraveler(traveler)}
                        className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.05] dark:hover:text-gray-200 transition-colors duration-150 cursor-pointer"
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
                            d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                          />
                        </svg>
                      </button>

                      {/* Delete Traveler */}
                      <button
                        title="Delete Traveler"
                        onClick={() => onDeleteTraveler(traveler.id)}
                        className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-error-50 hover:border-error-200 hover:text-error-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-error-500/10 dark:hover:text-error-400 transition-colors duration-150 cursor-pointer"
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
                            d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                          />
                        </svg>
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="px-5 py-10 text-center text-gray-500 dark:text-gray-400">
                  No travelers found matching your criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-gray-100 px-5 py-4 dark:border-gray-800 sm:px-6">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Showing{" "}
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {travelers.length > 0 ? (page - 1) * PAGE_SIZE + 1 : 0}
          </span>{" "}
          to{" "}
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {Math.min(page * PAGE_SIZE, travelers.length)}
          </span>{" "}
          of{" "}
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {travelers.length}
          </span>{" "}
          travelers
        </p>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.05] transition-colors duration-150 cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

