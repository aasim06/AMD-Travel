"use client";
import { useState } from "react";
import Input from "../form/input/InputField";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";

export const bookingFilters = [
  { value: "all", label: "All Travelers" },
  { value: "5plus", label: "5+ Bookings" },
  { value: "3to5", label: "3 – 5 Bookings" },
  { value: "1to2", label: "1 – 2 Bookings" },
  { value: "none", label: "No Bookings Yet" },
];

interface TravelersHeaderProps {
  search: string;
  setSearch: (val: string) => void;
  selectedFilter: typeof bookingFilters[0];
  setSelectedFilter: (filter: typeof bookingFilters[0]) => void;
  onAddTraveler: () => void;
}

export default function TravelersHeader({
  search,
  setSearch,
  selectedFilter,
  setSelectedFilter,
  onAddTraveler,
}: TravelersHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  function selectFilter(filter: typeof bookingFilters[0]) {
    setSelectedFilter(filter);
    closeDropdown();
  }

  return (
    <div className="mb-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
          Registered Travelers &amp; Customers
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage all registered travelers, view their contact info, edit details, and track their flight booking history.
        </p>
      </div>

      {/* Search & Action Bar */}
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
              placeholder="Search by Name, Email, Phone, or Passport..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Custom Filter Dropdown */}
          <div className="relative sm:w-56">
            <button
              onClick={toggleDropdown}
              className="dropdown-toggle h-11 w-full inline-flex items-center justify-between gap-2 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-700 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
            >
              <span className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-gray-400 dark:text-gray-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z"
                  />
                </svg>
                {selectedFilter.label}
              </span>
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

            <Dropdown
              isOpen={isOpen}
              onClose={closeDropdown}
              className="w-full min-w-[200px] p-1"
            >
              {bookingFilters.map((filter) => (
                <DropdownItem
                  key={filter.value}
                  onItemClick={() => selectFilter(filter)}
                  className={`flex w-full items-center rounded-lg px-3 py-2 text-sm font-normal text-left transition-colors duration-150 ${
                    selectedFilter.value === filter.value
                      ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-gray-200"
                  }`}
                >
                  <span className="mr-2 w-4 shrink-0">
                    {selectedFilter.value === filter.value && (
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

          {/* Add Traveler Button */}
          <button
            onClick={onAddTraveler}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 h-11 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 transition-colors duration-200 shrink-0 cursor-pointer"
          >
            <svg
              className="w-4 h-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            + Add Traveler
          </button>

        </div>
      </div>
    </div>
  );
}

