"use client";

import { Skeleton } from "@/components/ui/skeleton";

// Mirrors a single LegRow skeleton (airline logo · duration line · dep/arr times)
function LegRowSkeleton() {
  return (
    <div className="space-y-2.5">
      {/* Leg label: "Mon, 12 Jan · Outbound" */}
      <Skeleton className="h-2.5 w-36" />

      {/* Timeline row */}
      <div className="flex items-center gap-3">

        {/* Departure block */}
        <div className="shrink-0 w-16 space-y-1.5">
          <Skeleton className="h-6 w-14" />   {/* time e.g. 08:45 */}
          <Skeleton className="h-3 w-8" />    {/* IATA code */}
        </div>

        {/* Center: logo + duration line */}
        <div className="flex-1 flex flex-col items-center gap-2 min-w-0">
          {/* Airline logo + divider + duration */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-24 rounded-md" />   {/* airline logo */}
            <div className="h-4 w-px bg-border" />
            <div className="flex flex-col items-center gap-1">
              <Skeleton className="h-3 w-12" />             {/* "7h 30m" */}
              <Skeleton className="h-2 w-16" />             {/* aircraft type */}
            </div>
          </div>

          {/* Flight path: dot — dashed line — plane icon — dashed line — dot */}
          <div className="w-full flex items-center gap-1">
            <Skeleton className="h-2 w-2 rounded-full shrink-0" />
            <Skeleton className="flex-1 h-px" />
            <Skeleton className="h-3.5 w-3.5 rounded-sm shrink-0" />
            <Skeleton className="flex-1 h-px" />
            <Skeleton className="h-2 w-2 rounded-full shrink-0" />
          </div>

          {/* "Non-stop" / "1 stop" label */}
          <Skeleton className="h-2.5 w-14" />
        </div>

        {/* Arrival block */}
        <div className="shrink-0 w-16 space-y-1.5 flex flex-col items-end">
          <Skeleton className="h-6 w-14" />   {/* time */}
          <Skeleton className="h-3 w-8" />    {/* IATA code */}
        </div>

      </div>
    </div>
  );
}

export function FlightSkeleton() {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-card">

      {/* ── Left: Route Details (mirrors FlightCard left panel) ── */}
      <div className="flex-1 p-5 space-y-4 min-w-0">

        {/* Outbound leg */}
        <LegRowSkeleton />

        {/* Dashed divider (mimics border-t border-dashed) */}
        <div className="border-t border-dashed border-border" />

        {/* Baggage & badges row */}
        <div className="flex items-center gap-3 pt-1">
          <Skeleton className="h-3 w-28" />   {/* baggage icons + counts */}
          <Skeleton className="h-3 w-20" />   {/* seats left */}
          <Skeleton className="h-3 w-16 ml-auto" />
        </div>
      </div>

      {/* ── Right: Price & Action (mirrors FlightCard right panel, md:w-52) ── */}
      <div className="md:w-52 shrink-0 border-t md:border-t-0 md:border-l border-border p-5 flex flex-col justify-between items-end">

        {/* Share + Save icon placeholders */}
        <div className="flex items-center gap-2 self-end mb-3">
          <Skeleton className="h-7 w-7 rounded-full" />
          <Skeleton className="h-7 w-7 rounded-full" />
        </div>

        {/* Price block */}
        <div className="w-full flex flex-col items-center gap-1.5">
          <Skeleton className="h-8 w-28" />   {/* "$1,234" */}
          <Skeleton className="h-3 w-20" />   {/* "per person" */}
        </div>

        {/* Select button */}
        <Skeleton className="mt-4 h-10 w-full rounded-xl" />
      </div>

    </div>
  );
}
