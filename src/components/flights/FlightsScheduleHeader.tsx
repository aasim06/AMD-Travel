"use client";
import { useState } from "react";
import Input from "../form/input/InputField";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";

export const airlineFilters = [
  { value: "all", label: "All Airlines" },
  { value: "emirates", label: "Emirates" },
  { value: "qatar", label: "Qatar Airways" },
  { value: "turkish", label: "Turkish Airlines" },
  { value: "flydubai", label: "flydubai" },
  { value: "saudi", label: "Saudi Airlines" },
  { value: "malaysia", label: "Malaysia Airlines" },
  { value: "pia", label: "PIA" },
  { value: "airarabia", label: "Air Arabia" },
];

interface FlightsScheduleHeaderProps {
  search: string;
  setSearch: (val: string) => void;
  date: string;
  setDate: (val: string) => void;
  selectedAirline: typeof airlineFilters[0];
  setSelectedAirline: (filter: typeof airlineFilters[0]) => void;
}

export default function FlightsScheduleHeader({
  search,
  setSearch,
  date,
  setDate,
  selectedAirline,
  setSelectedAirline,
}: FlightsScheduleHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  function toggleDropdown() {
    setIsOpen((prev) => !prev);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  function selectFilter(filter: typeof airlineFilters[0]) {
    setSelectedAirline(filter);
    closeDropdown();
  }

  return (
    <div className="mb-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
          Flights Schedule &amp; Timings
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Monitor live flight schedules and operational statuses.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">

          {/* Search Input */}
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
              <svg
                className="w-[18px] h-[18px] text-gray-500 dark:text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-4.35-4.35m0 0A7.5 7.5 0 1 0 4.5 4.5a7.5 7.5 0 0 0 10.65 10.65Z"
                />
              </svg>
            </span>
            <Input
              type="text"
              placeholder="Search by flight code or route..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Custom Airline Dropdown */}
          <div className="relative sm:w-52">
            <button
              onClick={toggleDropdown}
              className="dropdown-toggle h-11 w-full inline-flex items-center justify-between gap-2 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-700 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
            >
              <span className="flex items-center gap-2">
                {/* Plane icon */}
                <svg
                  className="w-4 h-4 text-gray-400 dark:text-gray-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5Z" />
                </svg>
                {selectedAirline.label}
              </span>
              {/* Chevron */}
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Panel */}
            <Dropdown
              isOpen={isOpen}
              onClose={closeDropdown}
              className="w-full min-w-[200px] p-1"
            >
              {airlineFilters.map((filter) => (
                <DropdownItem
                  key={filter.value}
                  onItemClick={() => selectFilter(filter)}
                  className={`flex w-full items-center rounded-lg px-3 py-2 text-sm font-normal text-left transition-colors duration-150 ${
                    selectedAirline.value === filter.value
                      ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-gray-200"
                  }`}
                >
                  <span className="mr-2 w-4 shrink-0">
                    {selectedAirline.value === filter.value && (
                      <svg
                        className="w-4 h-4 text-brand-500"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2.5}
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    )}
                  </span>
                  {filter.label}
                </DropdownItem>
              ))}
            </Dropdown>
          </div>

          {/* Date Picker */}
          <div className="sm:w-48">
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* Search Button */}
          <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 h-11 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 transition-colors duration-200 shrink-0">
            <svg
              className="w-4 h-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-4.35-4.35m0 0A7.5 7.5 0 1 0 4.5 4.5a7.5 7.5 0 0 0 10.65 10.65Z"
              />
            </svg>
            Search
          </button>

        </div>
      </div>
    </div>
  );
}
