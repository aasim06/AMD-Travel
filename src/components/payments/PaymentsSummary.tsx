"use client";
import React from "react";
import Badge from "../ui/badge/Badge";
import { ArrowDownIcon, ArrowUpIcon } from "@/icons";

export default function PaymentsSummary() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
      {/* Total Gross Revenue */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 flex flex-col justify-between">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-md shadow-emerald-200 dark:shadow-emerald-900/30">
          <svg className="w-6 h-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Total Gross Revenue</span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              $54,200.00
            </h4>
          </div>
          <Badge color="success">
            <ArrowUpIcon />
            15.2%
          </Badge>
        </div>
      </div>

      {/* Successful Transactions Count */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 flex flex-col justify-between">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 shadow-md shadow-blue-200 dark:shadow-blue-900/30">
          <svg className="w-6 h-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Successful Transactions</span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              1,180
            </h4>
          </div>
          <Badge color="success">
            <ArrowUpIcon />
            10.4%
          </Badge>
        </div>
      </div>

      {/* Refunded / Failed Amount */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 flex flex-col justify-between">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-rose-400 to-rose-600 shadow-md shadow-rose-200 dark:shadow-rose-900/30">
          <svg className="w-6 h-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Refunded / Failed Amount</span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              $1,450.00
            </h4>
          </div>
          <Badge color="error">
            <ArrowDownIcon />
            -2.1%
          </Badge>
        </div>
      </div>
    </div>
  );
}
