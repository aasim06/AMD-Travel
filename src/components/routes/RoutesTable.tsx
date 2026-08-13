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

export interface Route {
  id: number;
  code: string;
  originCity: string;
  originAirport: string;
  originCode: string;
  destCity: string;
  destAirport: string;
  destCode: string;
  airlines: string[];
  baseFare: string;
  status: "Active" | "Inactive";
}

export const initialRoutes: Route[] = [
  {
    id: 1,
    code: "LHE-LHR",
    originCity: "Lahore",
    originAirport: "Allama Iqbal International",
    originCode: "LHE",
    destCity: "London",
    destAirport: "Heathrow Airport",
    destCode: "LHR",
    airlines: ["Emirates", "PIA"],
    baseFare: "$1,100.00",
    status: "Active",
  },
  {
    id: 2,
    code: "KHI-DXB",
    originCity: "Karachi",
    originAirport: "Jinnah International",
    originCode: "KHI",
    destCity: "Dubai",
    destAirport: "Dubai International",
    destCode: "DXB",
    airlines: ["Emirates", "flydubai"],
    baseFare: "$480.00",
    status: "Active",
  },
  {
    id: 3,
    code: "ISB-IST",
    originCity: "Islamabad",
    originAirport: "Islamabad International",
    originCode: "ISB",
    destCity: "Istanbul",
    destAirport: "Istanbul Airport",
    destCode: "IST",
    airlines: ["Turkish Airlines"],
    baseFare: "$820.00",
    status: "Active",
  },
  {
    id: 4,
    code: "LHE-JED",
    originCity: "Lahore",
    originAirport: "Allama Iqbal International",
    originCode: "LHE",
    destCity: "Jeddah",
    destAirport: "King Abdulaziz International",
    destCode: "JED",
    airlines: ["Saudi Airlines", "PIA"],
    baseFare: "$620.00",
    status: "Active",
  },
  {
    id: 5,
    code: "KHI-KUL",
    originCity: "Karachi",
    originAirport: "Jinnah International",
    originCode: "KHI",
    destCity: "Kuala Lumpur",
    destAirport: "KLIA Airport",
    destCode: "KUL",
    airlines: ["Malaysia Airlines"],
    baseFare: "$740.00",
    status: "Inactive",
  },
  {
    id: 6,
    code: "ISB-DOH",
    originCity: "Islamabad",
    originAirport: "Islamabad International",
    originCode: "ISB",
    destCity: "Doha",
    destAirport: "Hamad International",
    destCode: "DOH",
    airlines: ["Qatar Airways"],
    baseFare: "$560.00",
    status: "Active",
  },
  {
    id: 7,
    code: "LHE-SHJ",
    originCity: "Lahore",
    originAirport: "Allama Iqbal International",
    originCode: "LHE",
    destCity: "Sharjah",
    destAirport: "Sharjah International",
    destCode: "SHJ",
    airlines: ["Air Arabia"],
    baseFare: "$390.00",
    status: "Active",
  },
  {
    id: 8,
    code: "KHI-MED",
    originCity: "Karachi",
    originAirport: "Jinnah International",
    originCode: "KHI",
    destCity: "Madinah",
    destAirport: "Prince Mohammad bin Abdulaziz",
    destCode: "MED",
    airlines: ["Saudi Airlines"],
    baseFare: "$540.00",
    status: "Inactive",
  },
];

const PAGE_SIZE = 5;

interface RoutesTableProps {
  routes: Route[];
  onEdit?: (route: Route) => void;
  onDelete?: (id: number) => void;
}

export default function RoutesTable({ routes, onEdit, onDelete }: RoutesTableProps) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(routes.length / PAGE_SIZE);
  const paginated = routes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
                Route Code
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
              >
                Origin
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
              >
                Destination
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
              >
                Operating Airlines
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
              >
                Base Fare
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
            {paginated.map((route) => (
              <TableRow
                key={route.id}
                className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors duration-150"
              >
                {/* Route Code */}
                <TableCell className="px-5 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                      {route.originCode}
                    </span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                    </svg>
                    <span className="inline-flex items-center rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                      {route.destCode}
                    </span>
                  </div>
                </TableCell>

                {/* Origin */}
                <TableCell className="px-5 py-4 whitespace-nowrap">
                  <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                    {route.originCity}
                  </p>
                  <span className="text-gray-400 text-theme-xs dark:text-gray-500">
                    {route.originAirport}
                  </span>
                </TableCell>

                {/* Destination */}
                <TableCell className="px-5 py-4 whitespace-nowrap">
                  <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                    {route.destCity}
                  </p>
                  <span className="text-gray-400 text-theme-xs dark:text-gray-500">
                    {route.destAirport}
                  </span>
                </TableCell>

                {/* Airlines */}
                <TableCell className="px-5 py-4 whitespace-nowrap">
                  <div className="flex flex-wrap gap-1">
                    {route.airlines.map((airline) => (
                      <span
                        key={airline}
                        className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                      >
                        {airline}
                      </span>
                    ))}
                  </div>
                </TableCell>

                {/* Base Fare */}
                <TableCell className="px-5 py-4 whitespace-nowrap">
                  <span className="font-semibold text-gray-800 text-theme-sm dark:text-white/90">
                    {route.baseFare}
                  </span>
                  <span className="block text-gray-400 text-theme-xs dark:text-gray-500">
                    per person
                  </span>
                </TableCell>

                {/* Status */}
                <TableCell className="px-5 py-4 whitespace-nowrap">
                  <Badge
                    size="sm"
                    color={route.status === "Active" ? "success" : "error"}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full inline-block mr-1 ${
                        route.status === "Active"
                          ? "bg-success-500"
                          : "bg-error-500"
                      }`}
                    />
                    {route.status}
                  </Badge>
                </TableCell>

                {/* Actions */}
                <TableCell className="px-5 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {/* Edit */}
                    <button
                      title="Edit Route"
                      onClick={() => onEdit?.(route)}
                      className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-brand-50 hover:border-brand-200 hover:text-brand-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-brand-500/10 dark:hover:text-brand-400 transition-colors duration-150"
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
                          d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125"
                        />
                      </svg>
                    </button>

                    {/* Delete */}
                    <button
                      title="Delete Route"
                      onClick={() => onDelete?.(route.id)}
                      className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-error-50 hover:border-error-200 hover:text-error-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-error-500/10 dark:hover:text-error-400 transition-colors duration-150"
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
            {Math.min(page * PAGE_SIZE, routes.length)}
          </span>{" "}
          of{" "}
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {routes.length}
          </span>{" "}
          routes
        </p>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.05] transition-colors duration-150"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

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

          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.05] transition-colors duration-150"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
