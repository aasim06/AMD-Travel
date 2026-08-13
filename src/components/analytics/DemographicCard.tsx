"use client";
import { useState } from "react";
import { MoreDotIcon } from "@/icons";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";

const routes = [
  {
    from: "LHE",
    to: "LHR",
    label: "Lahore → London",
    searches: "4,821",
    percent: 85,
  },
  {
    from: "KHI",
    to: "DXB",
    label: "Karachi → Dubai",
    searches: "3,540",
    percent: 72,
  },
  {
    from: "ISB",
    to: "IST",
    label: "Islamabad → Istanbul",
    searches: "2,190",
    percent: 55,
  },
  {
    from: "LHE",
    to: "JED",
    label: "Lahore → Jeddah",
    searches: "1,870",
    percent: 43,
  },
  {
    from: "KHI",
    to: "KUL",
    label: "Karachi → Kuala Lumpur",
    searches: "1,230",
    percent: 30,
  },
];

export default function DemographicCard() {
  const [isOpen, setIsOpen] = useState(false);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="flex justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Top Popular Flight Routes
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Most searched routes via SerpAPI this month
          </p>
        </div>

        <div className="relative inline-block">
          <button onClick={toggleDropdown} className="dropdown-toggle">
            <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
          </button>
          <Dropdown
            isOpen={isOpen}
            onClose={closeDropdown}
            className="w-40 p-2"
          >
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              View More
            </DropdownItem>
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              Delete
            </DropdownItem>
          </Dropdown>
        </div>
      </div>

      {/* Route list */}
      <div className="mt-6 space-y-5">
        {routes.map((route) => (
          <div key={route.from + route.to} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Route code badge */}
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-brand-50 dark:bg-brand-500/10 shrink-0">
                <span className="text-xs font-bold text-brand-600 dark:text-brand-400 leading-none text-center">
                  {route.from}
                  <br />
                  {route.to}
                </span>
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-theme-sm dark:text-white/90">
                  {route.label}
                </p>
                <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                  {route.searches} Searches
                </span>
              </div>
            </div>

            <div className="flex w-full max-w-[140px] items-center gap-3">
              <div className="relative block h-2 w-full max-w-[100px] rounded-sm bg-gray-200 dark:bg-gray-800">
                <div
                  className="absolute left-0 top-0 flex h-full items-center justify-center rounded-sm bg-brand-500 text-xs font-medium text-white"
                  style={{ width: `${route.percent}%` }}
                ></div>
              </div>
              <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                {route.percent}%
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
