"use client";
import { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";

const timeframes = ["Today", "Last 7 Days", "This Month", "This Year"];

interface DateRangeFilterProps {
  onFilterChange?: (filter: string) => void;
}

export default function DateRangeFilter({ onFilterChange }: DateRangeFilterProps) {
  const [selected, setSelected] = useState("This Month");
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (label: string) => {
    setSelected(label);
    setIsOpen(false);
    onFilterChange?.(label);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className="dropdown-toggle inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.05] transition-colors"
      >
        <svg
          className="w-4 h-4 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.8}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
          />
        </svg>
        {selected}
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
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
        className="w-44 p-1.5 shadow-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
      >
        {timeframes.map((label) => (
          <DropdownItem
            key={label}
            onItemClick={() => handleSelect(label)}
            className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              selected === label
                ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
                : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
            }`}
          >
            {label}
            {selected === label && (
              <svg
                className="h-4 w-4 text-brand-500"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            )}
          </DropdownItem>
        ))}
      </Dropdown>
    </div>
  );
}
