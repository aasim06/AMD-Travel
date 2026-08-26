"use client";
import React, { useState } from "react";
import FlightsScheduleHeader, { airlineFilters } from "./FlightsScheduleHeader";
import FlightsScheduleTable, { allFlights } from "./FlightsScheduleTable";

export default function FlightsScheduleManager() {
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const [selectedAirline, setSelectedAirline] = useState(airlineFilters[0]);

  // Filter flights dynamically based on Search query & Airline dropdown
  const filteredFlights = allFlights.filter((flight) => {
    const query = search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      flight.code.toLowerCase().includes(query) ||
      flight.airline.toLowerCase().includes(query) ||
      flight.from.toLowerCase().includes(query) ||
      flight.to.toLowerCase().includes(query) ||
      flight.status.toLowerCase().includes(query) ||
      flight.gate.toLowerCase().includes(query);

    const matchesAirline =
      selectedAirline.value === "all" ||
      flight.airline.toLowerCase().includes(selectedAirline.label.toLowerCase()) ||
      flight.airline.toLowerCase().includes(selectedAirline.value.toLowerCase());

    return matchesSearch && matchesAirline;
  });

  return (
    <div>
      <FlightsScheduleHeader
        search={search}
        setSearch={setSearch}
        date={date}
        setDate={setDate}
        selectedAirline={selectedAirline}
        setSelectedAirline={setSelectedAirline}
      />

      {filteredFlights.length > 0 ? (
        <FlightsScheduleTable flights={filteredFlights} />
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-gray-800 font-bold text-xs">
            AMD
          </div>
          <h3 className="mt-4 text-base font-semibold text-gray-800 dark:text-white">
            No flights found
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            No scheduled flights match your search query or selected airline ({selectedAirline.label}).
          </p>
          <button
            onClick={() => {
              setSearch("");
              setSelectedAirline(airlineFilters[0]);
              setDate("");
            }}
            className="mt-4 inline-flex items-center rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
