import React from "react";

export default function GlobalLoading() {
  return (
    <div className="w-full min-h-screen bg-slate-50 animate-fade-in">
      {/* Hero Banner Skeleton */}
      <div className="w-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 py-12 lg:py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="max-w-2xl space-y-4">
            <div className="h-8 w-48 rounded-full bg-slate-700/60 animate-pulse" />
            <div className="h-10 w-3/4 rounded-2xl bg-slate-700/60 animate-pulse" />
            <div className="h-6 w-1/2 rounded-xl bg-slate-700/40 animate-pulse" />
            <div className="h-14 w-full rounded-2xl bg-slate-700/80 animate-pulse mt-6" />
          </div>
        </div>
      </div>

      {/* Main Grid Skeleton */}
      <div className="container mx-auto px-4 max-w-7xl py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="h-7 w-48 rounded-xl bg-slate-200 animate-pulse" />
          <div className="h-8 w-32 rounded-full bg-slate-200 animate-pulse" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-4"
            >
              <div className="h-44 w-full rounded-xl bg-slate-200 animate-pulse" />
              <div className="h-5 w-3/4 rounded-lg bg-slate-200 animate-pulse" />
              <div className="h-4 w-1/2 rounded-md bg-slate-100 animate-pulse" />
              <div className="pt-2 flex items-center justify-between">
                <div className="h-6 w-20 rounded-lg bg-slate-200 animate-pulse" />
                <div className="h-9 w-28 rounded-xl bg-orange-200/60 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
