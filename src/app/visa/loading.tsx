import React from "react";

export default function VisaLoading() {
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

      {/* Notice Bar Shimmer */}
      <div className="bg-amber-50 border-b border-amber-100 py-3">
        <div className="container mx-auto px-4 max-w-7xl flex items-center gap-2">
          <div className="h-4 w-4 rounded-full bg-amber-200 animate-pulse shrink-0" />
          <div className="h-4 w-2/3 rounded-md bg-amber-200/60 animate-pulse" />
        </div>
      </div>

      {/* Form Container Shimmer */}
      <div className="container mx-auto px-4 max-w-5xl py-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div className="h-8 w-64 rounded-xl bg-slate-200 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-12 w-full rounded-xl bg-slate-100 animate-pulse" />
            <div className="h-12 w-full rounded-xl bg-slate-100 animate-pulse" />
            <div className="h-12 w-full rounded-xl bg-slate-100 animate-pulse" />
            <div className="h-12 w-full rounded-xl bg-slate-100 animate-pulse" />
          </div>
          <div className="h-32 w-full rounded-2xl bg-slate-100 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
