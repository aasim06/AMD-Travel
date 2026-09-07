"use client";
import React, { useState, useEffect, useCallback } from "react";
import FlightsScheduleHeader, { airlineFilters } from "./FlightsScheduleHeader";
import FlightsScheduleTable, { allFlights, Flight } from "./FlightsScheduleTable";

export default function FlightsScheduleManager() {
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const [selectedAirline, setSelectedAirline] = useState(airlineFilters[0]);
  const [flights, setFlights] = useState<Flight[]>(allFlights);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  // Fetch live flight data from Amadeus GDS backend endpoint
  const fetchSchedules = useCallback(async (isForceRefresh = false) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (date) params.set("date", date);
      if (selectedAirline.value !== "all") params.set("airline", selectedAirline.value);
      if (isForceRefresh) params.set("refresh", "true");

      const res = await fetch(`/api/admin/flights/schedules?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch schedules [${res.status}]`);
      }

      const data = await res.json();
      if (data.success && Array.isArray(data.flights) && data.flights.length > 0) {
        setFlights(data.flights);
        setLastUpdated(data.lastUpdated || new Date().toISOString());
      }
    } catch (err: any) {
      console.warn("[Amadeus Schedule Manager] Error fetching live schedules:", err);
      setError(err?.message || "Failed to connect to Amadeus live GDS");
    } finally {
      setLoading(false);
    }
  }, [date, selectedAirline]);

  // Initial load on mount and when date or airline filter changes
  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  // Client-side search filtering across live flights
  const filteredFlights = flights.filter((flight) => {
    const query = search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      flight.code.toLowerCase().includes(query) ||
      flight.airline.toLowerCase().includes(query) ||
      flight.from.toLowerCase().includes(query) ||
      flight.to.toLowerCase().includes(query) ||
      flight.status.toLowerCase().includes(query) ||
      flight.gate.toLowerCase().includes(query) ||
      flight.terminal.toLowerCase().includes(query);

    const matchesAirline =
      selectedAirline.value === "all" ||
      flight.airline.toLowerCase().includes(selectedAirline.label.toLowerCase()) ||
      flight.airline.toLowerCase().includes(selectedAirline.value.toLowerCase()) ||
      flight.airlineInitials.toLowerCase() === selectedAirline.value.toLowerCase();

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
        loading={loading}
        onRefresh={() => fetchSchedules(true)}
        lastUpdated={lastUpdated}
        totalLiveCount={flights.length}
      />

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center justify-between">
          <span>⚠️ {error}. Displaying active backup schedules.</span>
          <button
            onClick={() => fetchSchedules(true)}
            className="font-bold underline hover:text-amber-950 cursor-pointer"
          >
            Retry Amadeus Sync
          </button>
        </div>
      )}

      {loading && flights.length === 0 ? (
        <FlightsScheduleTable flights={[]} loading={true} />
      ) : filteredFlights.length > 0 ? (
        <FlightsScheduleTable flights={filteredFlights} loading={loading} />
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-gray-800 font-bold text-xs">
            AMD
          </div>
          <h3 className="mt-4 text-base font-semibold text-gray-800 dark:text-white">
            No live flights found
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

