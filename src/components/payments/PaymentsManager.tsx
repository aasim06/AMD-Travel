"use client";
import React, { useState } from "react";
import PaymentsSummary from "./PaymentsSummary";
import TransactionsTable, { Transaction, initialTransactions } from "./TransactionsTable";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";

const dateFilterOptions = [
  { value: "all", label: "All Dates" },
  { value: "Oct 12", label: "Oct 12, 2026 (Today)" },
  { value: "Oct 11", label: "Oct 11, 2026" },
  { value: "Oct 10", label: "Oct 10, 2026" },
  { value: "Oct 09", label: "Oct 09, 2026" },
];

export default function PaymentsManager() {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [selectedDateFilter, setSelectedDateFilter] = useState(dateFilterOptions[0]);
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);

  // Filter transactions based on Date Filter
  const filteredTransactions = transactions.filter((txn) => {
    if (selectedDateFilter.value === "all") return true;
    return txn.dateTime.includes(selectedDateFilter.value);
  });

  // Handle Export CSV
  const handleExportCSV = () => {
    const headers = [
      "Transaction ID",
      "PNR Reference",
      "Customer Name",
      "Customer Email",
      "Amount Paid",
      "Payment Gateway",
      "Date & Time",
      "Status",
    ];

    const rows = filteredTransactions.map((t) => [
      t.txnId,
      t.pnr,
      `"${t.customerName}"`,
      t.customerEmail,
      `"${t.amount}"`,
      `"${t.gateway}"`,
      `"${t.dateTime}"`,
      t.status,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `payments_report_${selectedDateFilter.value}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      {/* Header Bar with Action Buttons */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
            Payments &amp; Transactions
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Monitor Stripe earnings, successful transactions, pending payouts, and refund logs.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Filter By Date Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDateDropdownOpen((prev) => !prev)}
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.05] transition-colors duration-200 cursor-pointer shadow-theme-xs"
            >
              <svg className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 9v7.5" />
              </svg>
              <span>{selectedDateFilter.label}</span>
              <svg className={`w-4 h-4 ml-2 text-gray-400 transition-transform duration-200 ${isDateDropdownOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
              </svg>
            </button>

            <Dropdown
              isOpen={isDateDropdownOpen}
              onClose={() => setIsDateDropdownOpen(false)}
              className="w-56 p-1 right-0 left-auto"
            >
              {dateFilterOptions.map((opt) => (
                <DropdownItem
                  key={opt.value}
                  onItemClick={() => {
                    setSelectedDateFilter(opt);
                    setIsDateDropdownOpen(false);
                  }}
                  className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors duration-150 ${
                    selectedDateFilter.value === opt.value
                      ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 font-semibold"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-gray-200"
                  }`}
                >
                  {selectedDateFilter.value === opt.value && (
                    <span className="mr-2 text-brand-500">✓</span>
                  )}
                  {opt.label}
                </DropdownItem>
              ))}
            </Dropdown>
          </div>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 transition-colors duration-200 shadow-theme-xs cursor-pointer"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {/* Top Financial Summary Cards */}
        <div className="col-span-12">
          <PaymentsSummary />
        </div>

        {/* Transactions Data Table */}
        <div className="col-span-12">
          <TransactionsTable transactions={filteredTransactions} setTransactions={setTransactions} />
        </div>
      </div>
    </div>
  );
}
