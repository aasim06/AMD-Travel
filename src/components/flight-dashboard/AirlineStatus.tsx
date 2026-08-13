"use client";
import React from "react";
import Badge from "../ui/badge/Badge";

const airlines = [
  { name: "Emirates", status: "On Time", code: "EK", iconColor: "text-brand-500", bgColor: "bg-brand-50" },
  { name: "Qatar Airways", status: "Delayed", code: "QR", iconColor: "text-warning-500", bgColor: "bg-warning-50" },
  { name: "Turkish Airlines", status: "On Time", code: "TK", iconColor: "text-success-500", bgColor: "bg-success-50" },
  { name: "Saudi Airlines", status: "Cancelled", code: "SV", iconColor: "text-error-500", bgColor: "bg-error-50" },
  { name: "PIA", status: "On Time", code: "PK", iconColor: "text-brand-500", bgColor: "bg-brand-50" },
];

export default function AirlineStatus() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6 h-full flex flex-col">
      <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
        Quick Airline Status
      </h3>
      <div className="flex flex-col gap-4 flex-1 justify-center">
        {airlines.map((airline) => (
          <div key={airline.name} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${airline.bgColor} ${airline.iconColor} font-bold text-sm dark:bg-opacity-10`}>
                {airline.code}
              </div>
              <div>
                <h5 className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {airline.name}
                </h5>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Operating normally
                </span>
              </div>
            </div>
            <Badge
              size="sm"
              color={
                airline.status === "On Time"
                  ? "success"
                  : airline.status === "Delayed"
                  ? "warning"
                  : "error"
              }
            >
              {airline.status}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
