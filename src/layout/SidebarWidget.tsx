import React from "react";

export default function SidebarWidget() {
  return (
    <div
      className={`mx-auto mb-10 w-full max-w-60 rounded-2xl bg-gray-50 px-4 py-5 text-center dark:bg-white/[0.03] border border-gray-100 dark:border-gray-800`}
    >
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-500 dark:bg-brand-500/10 dark:text-brand-400">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
        </svg>
      </div>
      <h3 className="mb-1 font-semibold text-gray-900 dark:text-white text-base">
        AMD Global Travel
      </h3>
      <p className="mb-4 text-gray-500 text-xs dark:text-gray-400 leading-relaxed">
        Official Flight Booking & Management Panel. Controlling live fares, bookings & website CMS.
      </p>
      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center p-2.5 font-medium text-white rounded-xl bg-brand-500 text-xs hover:bg-brand-600 shadow-theme-xs transition-colors duration-150"
      >
        Visit Website Portal
      </a>
    </div>
  );
}
