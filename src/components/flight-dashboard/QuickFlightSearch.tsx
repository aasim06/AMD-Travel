"use client";
import { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";

const airports = [
  { code: "LHE", city: "Lahore" },
  { code: "KHI", city: "Karachi" },
  { code: "ISB", city: "Islamabad" },
  { code: "LHR", city: "London" },
  { code: "DXB", city: "Dubai" },
  { code: "DOH", city: "Doha" },
  { code: "IST", city: "Istanbul" },
  { code: "JED", city: "Jeddah" },
  { code: "KUL", city: "Kuala Lumpur" },
];

const mockFlightResults = [
  {
    airline: "Emirates",
    code: "EK-612",
    departure: "08:30",
    arrival: "13:45",
    duration: "8h 15m",
    fare: "$1,100",
    seats: 12,
    status: "Available",
  },
  {
    airline: "Qatar Airways",
    code: "QR-711",
    departure: "14:15",
    arrival: "20:30",
    duration: "9h 15m",
    fare: "$980",
    seats: 5,
    status: "Low Seats",
  },
  {
    airline: "PIA",
    code: "PK-785",
    departure: "22:00",
    arrival: "05:30",
    duration: "10h 30m",
    fare: "$620",
    seats: 24,
    status: "Available",
  },
];

// Reusable airport custom dropdown
function AirportDropdown({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (code: string) => void;
  label: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selected = airports.find((a) => a.code === value);

  return (
    <div className="flex-1">
      <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">
        {label}
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen((o) => !o)}
          className="dropdown-toggle h-11 w-full inline-flex items-center justify-between gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 shadow-theme-xs focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:focus:border-brand-500"
        >
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
            <span className="truncate">
              <span className="font-bold text-brand-600 dark:text-brand-400">
                {selected?.code}
              </span>
              <span className="ml-1.5 text-gray-500 dark:text-gray-400">
                — {selected?.city}
              </span>
            </span>
          </span>
          <svg
            className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180 text-brand-500" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>

        <Dropdown
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          className="w-full max-h-60 overflow-y-auto p-1.5 shadow-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 !z-[9999]"
        >
          {airports.map((airport) => {
            const isSelected = airport.code === value;
            return (
              <DropdownItem
                key={airport.code}
                onItemClick={() => {
                  onChange(airport.code);
                  setIsOpen(false);
                }}
                className={`flex items-center justify-between w-full rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  isSelected
                    ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <span className="inline-flex h-7 w-10 items-center justify-center rounded-lg bg-gray-100 text-xs font-bold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                    {airport.code}
                  </span>
                  <span className="font-medium">{airport.city}</span>
                </span>
                {isSelected && (
                  <svg className="h-4 w-4 text-brand-500 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                )}
              </DropdownItem>
            );
          })}
        </Dropdown>
      </div>
    </div>
  );
}

export default function QuickFlightSearch() {
  const [origin, setOrigin] = useState("LHE");
  const [destination, setDestination] = useState("LHR");
  const [date, setDate] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = () => {
    if (!origin || !destination) return;
    setIsLoading(true);
    setShowResults(false);

    setTimeout(() => {
      setIsLoading(false);
      setShowResults(true);
    }, 800);
  };

  const swapRoutes = () => {
    setOrigin(destination);
    setDestination(origin);
    setShowResults(false);
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Quick Flight Lookup
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Search live fare availability without leaving the dashboard
        </p>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        {/* Origin Dropdown */}
        <AirportDropdown value={origin} onChange={(c) => { setOrigin(c); setShowResults(false); }} label="From" />

        {/* Swap Button */}
        <button
          type="button"
          onClick={swapRoutes}
          className="flex h-11 w-11 shrink-0 self-end items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-brand-500/10 dark:hover:text-brand-400 transition-colors duration-150"
          title="Swap Origin & Destination"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
          </svg>
        </button>

        {/* Destination Dropdown */}
        <AirportDropdown value={destination} onChange={(c) => { setDestination(c); setShowResults(false); }} label="To" />

        {/* Date */}
        <div className="flex-1">
          <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">
            Travel Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-11 w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>

        {/* Search Button */}
        <button
          type="button"
          onClick={handleSearch}
          disabled={isLoading}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 disabled:opacity-70 disabled:cursor-not-allowed transition-colors duration-150 shrink-0"
        >
          {isLoading ? (
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          )}
          Search
        </button>
      </div>

      {/* Results */}
      {showResults && (
        <div className="mt-5 overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800">
          <div className="bg-gray-50 dark:bg-gray-900/50 px-4 py-2.5 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
              {origin} ✈ {destination} — {mockFlightResults.length} flights found
            </span>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {mockFlightResults.map((flight, i) => (
              <div
                key={i}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-500/10">
                    <svg className="w-5 h-5 text-brand-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                      {flight.airline}
                      <span className="ml-2 text-xs font-normal text-gray-400">({flight.code})</span>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {flight.departure} → {flight.arrival} · {flight.duration}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <span className="block text-base font-bold text-gray-800 dark:text-white/90">
                      {flight.fare}
                    </span>
                    <span className="text-xs text-gray-400">{flight.seats} seats left</span>
                  </div>

                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                      flight.status === "Available"
                        ? "bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-400"
                        : "bg-warning-50 text-warning-700 dark:bg-warning-500/10 dark:text-warning-400"
                    }`}
                  >
                    {flight.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
