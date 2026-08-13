import React from "react";

export default function AdminPortalLoading() {
  return (
    <div className="space-y-6 animate-fade-in p-2">
      {/* Header Title Shimmer */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-6 w-48 rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
          <div className="h-4 w-72 rounded-lg bg-gray-100 dark:bg-gray-800/60 animate-pulse" />
        </div>
        <div className="h-10 w-36 rounded-xl bg-brand-500/30 animate-pulse" />
      </div>

      {/* Top 4 Stat Cards Shimmer */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 rounded-md bg-gray-200 dark:bg-gray-800 animate-pulse" />
              <div className="h-9 w-9 rounded-xl bg-brand-500/20 animate-pulse" />
            </div>
            <div className="h-8 w-20 rounded-lg bg-gray-300 dark:bg-gray-700 animate-pulse" />
            <div className="h-3 w-32 rounded-md bg-gray-100 dark:bg-gray-800 animate-pulse" />
          </div>
        ))}
      </div>

      {/* Data Table Shimmer */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
          <div className="h-10 w-64 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
          <div className="h-10 w-44 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
        </div>

        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5].map((row) => (
            <div
              key={row}
              className="flex items-center justify-between p-3 rounded-xl bg-gray-50/60 dark:bg-white/5"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse shrink-0" />
                <div className="space-y-1.5">
                  <div className="h-4 w-40 rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse" />
                  <div className="h-3 w-28 rounded-md bg-gray-100 dark:bg-gray-800 animate-pulse" />
                </div>
              </div>
              <div className="h-6 w-20 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
              <div className="h-5 w-24 rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
