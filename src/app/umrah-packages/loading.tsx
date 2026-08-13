import React from "react";

export default function UmrahLoading() {
  return (
    <div className="w-full min-h-screen bg-slate-50">
      {/* Hero Banner Shimmer */}
      <div className="w-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 py-12 lg:py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="max-w-xl space-y-4">
            <div className="h-6 w-36 rounded-full bg-amber-400/20 animate-pulse" />
            <div className="h-10 w-4/5 rounded-2xl bg-slate-700/60 animate-pulse" />
            <div className="h-5 w-2/3 rounded-xl bg-slate-700/40 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Filter Bar Shimmer */}
      <div className="container mx-auto px-4 max-w-7xl py-6 flex items-center gap-3">
        <div className="h-9 w-20 rounded-full bg-slate-200 animate-pulse" />
        <div className="h-9 w-24 rounded-full bg-slate-200 animate-pulse" />
        <div className="h-9 w-24 rounded-full bg-slate-200 animate-pulse" />
        <div className="h-9 w-24 rounded-full bg-slate-200 animate-pulse" />
      </div>

      {/* Packages Grid Shimmer */}
      <div className="container mx-auto px-4 max-w-7xl pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4"
            >
              <div className="h-48 w-full rounded-xl bg-slate-200 animate-pulse" />
              <div className="h-6 w-3/4 rounded-lg bg-slate-200 animate-pulse" />
              <div className="h-4 w-1/2 rounded-md bg-slate-100 animate-pulse" />
              <div className="h-16 w-full rounded-xl bg-slate-100 animate-pulse" />
              <div className="pt-2 flex items-center justify-between">
                <div className="h-7 w-24 rounded-lg bg-slate-200 animate-pulse" />
                <div className="h-10 w-32 rounded-xl bg-emerald-300/40 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
