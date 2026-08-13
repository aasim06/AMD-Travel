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

type FlightStatus = "On Time" | "Delayed" | "Cancelled";

export interface Flight {
  id: number;
  code: string;
  airline: string;
  airlineInitials: string;
  airlineColor: string;
  from: string;
  to: string;
  departure: string;
  arrival: string;
  duration: string;
  terminal: string;
  gate: string;
  status: FlightStatus;
}

export const allFlights: Flight[] = [
  {
    id: 1,
    code: "EK-625",
    airline: "Emirates",
    airlineInitials: "EK",
    airlineColor: "bg-red-600",
    from: "LHE",
    to: "DXB",
    departure: "02:10",
    arrival: "04:30",
    duration: "3h 20m",
    terminal: "T1",
    gate: "G-12",
    status: "On Time",
  },
  {
    id: 2,
    code: "QR-501",
    airline: "Qatar Airways",
    airlineInitials: "QR",
    airlineColor: "bg-purple-700",
    from: "KHI",
    to: "DOH",
    departure: "06:45",
    arrival: "08:55",
    duration: "3h 10m",
    terminal: "T2",
    gate: "G-07",
    status: "Delayed",
  },
  {
    id: 3,
    code: "TK-709",
    airline: "Turkish Airlines",
    airlineInitials: "TK",
    airlineColor: "bg-red-700",
    from: "ISB",
    to: "IST",
    departure: "09:15",
    arrival: "13:40",
    duration: "6h 25m",
    terminal: "T1",
    gate: "G-21",
    status: "On Time",
  },
  {
    id: 4,
    code: "FZ-343",
    airline: "flydubai",
    airlineInitials: "FZ",
    airlineColor: "bg-teal-600",
    from: "LHE",
    to: "DXB",
    departure: "11:30",
    arrival: "13:50",
    duration: "3h 20m",
    terminal: "T2",
    gate: "G-04",
    status: "Cancelled",
  },
  {
    id: 5,
    code: "PK-786",
    airline: "PIA",
    airlineInitials: "PK",
    airlineColor: "bg-green-700",
    from: "KHI",
    to: "LHR",
    departure: "13:00",
    arrival: "18:15",
    duration: "9h 15m",
    terminal: "T1",
    gate: "G-09",
    status: "On Time",
  },
  {
    id: 6,
    code: "G9-412",
    airline: "Air Arabia",
    airlineInitials: "G9",
    airlineColor: "bg-orange-500",
    from: "ISB",
    to: "SHJ",
    departure: "15:20",
    arrival: "17:30",
    duration: "3h 10m",
    terminal: "T3",
    gate: "G-15",
    status: "Delayed",
  },
  {
    id: 7,
    code: "MH-193",
    airline: "Malaysia Airlines",
    airlineInitials: "MH",
    airlineColor: "bg-blue-700",
    from: "KHI",
    to: "KUL",
    departure: "18:05",
    arrival: "06:30",
    duration: "8h 25m",
    terminal: "T2",
    gate: "G-18",
    status: "On Time",
  },
  {
    id: 8,
    code: "SV-722",
    airline: "Saudi Airlines",
    airlineInitials: "SV",
    airlineColor: "bg-green-600",
    from: "LHE",
    to: "JED",
    departure: "21:00",
    arrival: "23:15",
    duration: "4h 15m",
    terminal: "T1",
    gate: "G-03",
    status: "On Time",
  },
  {
    id: 9,
    code: "EK-611",
    airline: "Emirates",
    airlineInitials: "EK",
    airlineColor: "bg-red-600",
    from: "KHI",
    to: "LHR",
    departure: "22:30",
    arrival: "05:50",
    duration: "9h 20m",
    terminal: "T2",
    gate: "G-22",
    status: "Delayed",
  },
  {
    id: 10,
    code: "QR-627",
    airline: "Qatar Airways",
    airlineInitials: "QR",
    airlineColor: "bg-purple-700",
    from: "ISB",
    to: "LHR",
    departure: "23:50",
    arrival: "07:10",
    duration: "9h 20m",
    terminal: "T1",
    gate: "G-11",
    status: "Cancelled",
  },
];

const PAGE_SIZE = 5;

const statusConfig: Record<
  FlightStatus,
  { color: "success" | "warning" | "error"; dot: string }
> = {
  "On Time": { color: "success", dot: "bg-success-500" },
  Delayed: { color: "warning", dot: "bg-warning-500" },
  Cancelled: { color: "error", dot: "bg-error-500" },
};

interface FlightsScheduleTableProps {
  flights?: Flight[];
}

export default function FlightsScheduleTable({
  flights = allFlights,
}: FlightsScheduleTableProps) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(flights.length / PAGE_SIZE));
  const paginated = flights.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
                Flight / Airline
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
              >
                Route
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
              >
                Departure
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
              >
                Arrival
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
              >
                Duration
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
              >
                Terminal / Gate
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
              >
                Status
              </TableCell>
            </TableRow>
          </TableHeader>

          {/* Body */}
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {paginated.map((flight) => (
              <TableRow
                key={flight.id}
                className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors duration-150"
              >
                {/* Flight / Airline */}
                <TableCell className="px-5 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    {/* Airline initials badge */}
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-lg ${flight.airlineColor} shrink-0`}
                    >
                      <span className="text-xs font-bold text-white">
                        {flight.airlineInitials}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-theme-sm dark:text-white/90">
                        {flight.code}
                      </p>
                      <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                        {flight.airline}
                      </span>
                    </div>
                  </div>
                </TableCell>

                {/* Route */}
                <TableCell className="px-5 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-800 text-theme-sm dark:text-white/90">
                      {flight.from}
                    </span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4 text-brand-500"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                    </svg>
                    <span className="font-semibold text-gray-800 text-theme-sm dark:text-white/90">
                      {flight.to}
                    </span>
                  </div>
                </TableCell>

                {/* Departure */}
                <TableCell className="px-5 py-4 text-gray-700 text-theme-sm dark:text-gray-300 whitespace-nowrap">
                  <span className="font-medium">{flight.departure}</span>
                </TableCell>

                {/* Arrival */}
                <TableCell className="px-5 py-4 text-gray-700 text-theme-sm dark:text-gray-300 whitespace-nowrap">
                  <span className="font-medium">{flight.arrival}</span>
                </TableCell>

                {/* Duration */}
                <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400 whitespace-nowrap">
                  {flight.duration}
                </TableCell>

                {/* Terminal / Gate */}
                <TableCell className="px-5 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                      {flight.terminal}
                    </span>
                    <span className="text-gray-400 text-theme-xs">/</span>
                    <span className="inline-flex items-center rounded-md bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                      {flight.gate}
                    </span>
                  </div>
                </TableCell>

                {/* Status */}
                <TableCell className="px-5 py-4 whitespace-nowrap">
                  <Badge
                    size="sm"
                    color={statusConfig[flight.status].color}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${statusConfig[flight.status].dot} inline-block mr-1`}
                    />
                    {flight.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-gray-100 px-5 py-4 dark:border-gray-800 sm:px-6">
        {/* Result count */}
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Showing{" "}
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {(page - 1) * PAGE_SIZE + 1}
          </span>{" "}
          to{" "}
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {Math.min(page * PAGE_SIZE, flights.length)}
          </span>{" "}
          of{" "}
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {flights.length}
          </span>{" "}
          flights
        </p>

        {/* Page controls */}
        <div className="flex items-center gap-1">
          {/* Prev */}
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.05] dark:hover:text-gray-200 transition-colors duration-150"
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

          {/* Page numbers */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`inline-flex items-center justify-center w-9 h-9 rounded-lg border text-sm font-medium transition-colors duration-150 ${
                p === page
                  ? "border-brand-500 bg-brand-500 text-white"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.05]"
              }`}
            >
              {p}
            </button>
          ))}

          {/* Next */}
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.05] dark:hover:text-gray-200 transition-colors duration-150"
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
