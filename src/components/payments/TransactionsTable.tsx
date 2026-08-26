"use client";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";

export interface Transaction {
  id: number;
  txnId: string;
  pnr: string;
  customerName: string;
  customerEmail: string;
  amount: string;
  gateway: string;
  dateTime: string;
  status: "Successful" | "Pending" | "Refunded";
  flightRoute?: string;
  airline?: string;
}

export const initialTransactions: Transaction[] = [
  {
    id: 1,
    txnId: "TXN-98421",
    pnr: "AMD-9842",
    customerName: "Mohammad Asim Ameer",
    customerEmail: "asim.ameer@example.com",
    amount: "$1,100.00",
    gateway: "Stripe / Credit Card",
    dateTime: "Oct 12, 2026 - 14:30",
    status: "Successful",
    flightRoute: "Lahore (LHE) ➔ London (LHR)",
    airline: "Emirates (EK-623)",
  },
  {
    id: 2,
    txnId: "TXN-87310",
    pnr: "AMD-8731",
    customerName: "Sara Ahmed",
    customerEmail: "sara.ahmed@example.com",
    amount: "$480.00",
    gateway: "PayPal",
    dateTime: "Oct 12, 2026 - 12:15",
    status: "Pending",
    flightRoute: "Karachi (KHI) ➔ Dubai (DXB)",
    airline: "flydubai (FZ-334)",
  },
  {
    id: 3,
    txnId: "TXN-56124",
    pnr: "AMD-5612",
    customerName: "John Doe",
    customerEmail: "john.doe@example.com",
    amount: "$820.00",
    gateway: "Bank Transfer",
    dateTime: "Oct 11, 2026 - 09:45",
    status: "Successful",
    flightRoute: "Islamabad (ISB) ➔ Istanbul (IST)",
    airline: "Turkish Airlines (TK-715)",
  },
  {
    id: 4,
    txnId: "TXN-33291",
    pnr: "AMD-3329",
    customerName: "Ali Raza",
    customerEmail: "ali.raza@example.com",
    amount: "$620.00",
    gateway: "Stripe / Credit Card",
    dateTime: "Oct 11, 2026 - 08:20",
    status: "Refunded",
    flightRoute: "Lahore (LHE) ➔ Jeddah (JED)",
    airline: "Saudi Airlines (SV-722)",
  },
  {
    id: 5,
    txnId: "TXN-19283",
    pnr: "AMD-1928",
    customerName: "Emily Chen",
    customerEmail: "emily.chen@example.com",
    amount: "$740.00",
    gateway: "Stripe / Google Pay",
    dateTime: "Oct 10, 2026 - 18:05",
    status: "Successful",
    flightRoute: "Karachi (KHI) ➔ Kuala Lumpur (KUL)",
    airline: "Malaysia Airlines (MH-198)",
  },
  {
    id: 6,
    txnId: "TXN-44519",
    pnr: "AMD-4451",
    customerName: "Hassan Tariq",
    customerEmail: "hassan.tariq@example.com",
    amount: "$560.00",
    gateway: "Credit Card",
    dateTime: "Oct 10, 2026 - 15:40",
    status: "Pending",
    flightRoute: "Islamabad (ISB) ➔ Doha (DOH)",
    airline: "Qatar Airways (QR-633)",
  },
  {
    id: 7,
    txnId: "TXN-77628",
    pnr: "AMD-7762",
    customerName: "Zainab Malik",
    customerEmail: "zainab.malik@example.com",
    amount: "$390.00",
    gateway: "Stripe / Credit Card",
    dateTime: "Oct 09, 2026 - 11:10",
    status: "Successful",
    flightRoute: "Lahore (LHE) ➔ Sharjah (SHJ)",
    airline: "Air Arabia (G9-541)",
  },
];

const PAGE_SIZE = 5;

interface TransactionsTableProps {
  transactions?: Transaction[];
  setTransactions?: React.Dispatch<React.SetStateAction<Transaction[]>>;
}

export default function TransactionsTable({
  transactions: propTransactions,
  setTransactions: propSetTransactions,
}: TransactionsTableProps) {
  const [internalTransactions, setInternalTransactions] = useState<Transaction[]>(initialTransactions);

  const transactions = propTransactions ?? internalTransactions;
  const setTransactions = propSetTransactions ?? setInternalTransactions;
  const [page, setPage] = useState(1);

  // Modals state
  const [viewingInvoice, setViewingInvoice] = useState<Transaction | null>(null);
  const [refundTxn, setRefundTxn] = useState<Transaction | null>(null);

  const totalPages = Math.max(1, Math.ceil(transactions.length / PAGE_SIZE));
  const paginated = transactions.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  // Execute Refund
  const handleConfirmRefund = () => {
    if (!refundTxn) return;
    setTransactions((prev) =>
      prev.map((t) => (t.id === refundTxn.id ? { ...t, status: "Refunded" } : t))
    );
    setRefundTxn(null);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">

      {/* Embedded CSS for Clean Print PDF Export */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-invoice-modal,
          #printable-invoice-modal * {
            visibility: visible !important;
          }
          #printable-invoice-modal {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 20px !important;
            background: #ffffff !important;
            color: #000000 !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="max-w-full overflow-x-auto">
        <Table>
          {/* Header */}
          <TableHeader className="border-b border-gray-100 dark:border-gray-800">
            <TableRow>
              <TableCell isHeader className="px-5 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap">
                Transaction ID
              </TableCell>
              <TableCell isHeader className="px-5 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap">
                Customer Info
              </TableCell>
              <TableCell isHeader className="px-5 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap">
                Amount Paid
              </TableCell>
              <TableCell isHeader className="px-5 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap">
                Payment Gateway
              </TableCell>
              <TableCell isHeader className="px-5 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap">
                Date & Time
              </TableCell>
              <TableCell isHeader className="px-5 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap">
                Status
              </TableCell>
              <TableCell isHeader className="px-5 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap">
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>

          {/* Body */}
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {paginated.map((txn) => (
              <TableRow
                key={txn.id}
                className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors duration-150"
              >
                {/* Transaction ID & PNR */}
                <TableCell className="px-5 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                    {txn.txnId}
                  </span>
                  <span className="block mt-1 text-xs font-medium text-brand-600 dark:text-brand-400">
                    Ref: {txn.pnr}
                  </span>
                </TableCell>

                {/* Customer Info */}
                <TableCell className="px-5 py-4 whitespace-nowrap">
                  <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                    {txn.customerName}
                  </p>
                  <span className="text-gray-400 text-theme-xs dark:text-gray-500">
                    {txn.customerEmail}
                  </span>
                </TableCell>

                {/* Amount */}
                <TableCell className="px-5 py-4 whitespace-nowrap">
                  <span className="font-semibold text-gray-800 text-theme-sm dark:text-white/90">
                    {txn.amount}
                  </span>
                </TableCell>

                {/* Gateway */}
                <TableCell className="px-5 py-4 whitespace-nowrap">
                  <span className="text-gray-600 text-theme-sm dark:text-gray-300">
                    {txn.gateway}
                  </span>
                </TableCell>

                {/* Date & Time */}
                <TableCell className="px-5 py-4 whitespace-nowrap">
                  <span className="text-gray-600 text-theme-sm dark:text-gray-400">
                    {txn.dateTime}
                  </span>
                </TableCell>

                {/* Status */}
                <TableCell className="px-5 py-4 whitespace-nowrap">
                  <Badge
                    size="sm"
                    color={
                      txn.status === "Successful"
                        ? "success"
                        : txn.status === "Pending"
                        ? "warning"
                        : "error"
                    }
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full inline-block mr-1 ${
                        txn.status === "Successful"
                          ? "bg-success-500"
                          : txn.status === "Pending"
                          ? "bg-warning-500"
                          : "bg-error-500"
                      }`}
                    />
                    {txn.status}
                  </Badge>
                </TableCell>

                {/* Actions */}
                <TableCell className="px-5 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {/* View Invoice */}
                    <button
                      title="View Invoice"
                      onClick={() => setViewingInvoice(txn)}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-brand-50 hover:border-brand-200 hover:text-brand-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-brand-500/10 dark:hover:text-brand-400 transition-colors duration-150 cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                      </svg>
                    </button>

                    {/* Issue Refund */}
                    <button
                      title="Issue Refund"
                      disabled={txn.status === "Refunded"}
                      onClick={() => setRefundTxn(txn)}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-error-50 hover:border-error-200 hover:text-error-600 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-error-500/10 dark:hover:text-error-400 transition-colors duration-150 cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
                      </svg>
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-gray-100 px-5 py-4 dark:border-gray-800 sm:px-6">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Showing{" "}
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {(page - 1) * PAGE_SIZE + 1}
          </span>{" "}
          to{" "}
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {Math.min(page * PAGE_SIZE, transactions.length)}
          </span>{" "}
          of{" "}
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {transactions.length}
          </span>{" "}
          transactions
        </p>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.05] transition-colors duration-150 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`inline-flex items-center justify-center w-9 h-9 rounded-lg border text-sm font-medium transition-colors duration-150 cursor-pointer ${
                p === page
                  ? "border-brand-500 bg-brand-500 text-white"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.05]"
              }`}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.05] transition-colors duration-150 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. VIEW INVOICE MODAL (WITH DEDICATED PRINT / PDF FORMATTING) */}
      {/* ========================================================================= */}
      {viewingInvoice && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div
            id="printable-invoice-modal"
            className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900 border border-gray-200 dark:border-gray-800 max-h-[90vh] overflow-y-auto"
          >
            {/* Screen-Only Header Close Button */}
            <div className="no-print flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                  Tax Invoice & Payment Receipt
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingInvoice(null)}
                className="rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200 p-1.5 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Print & Screen Printable Invoice Content */}
            <div className="py-3 text-gray-800 dark:text-gray-100">
              {/* Agency Logo & Document Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start pb-5 border-b border-gray-200 dark:border-gray-700 gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-brand-500 flex items-center justify-center text-white font-bold text-xl shrink-0">
                    AMD
                  </div>
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                      AMD Global Travel
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Official Flight Booking & Management
                    </p>
                    <p className="text-[11px] text-gray-400 mt-1">
                      Lahore / Karachi, Pakistan | Support: support@amdglobaltravel.com
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="inline-block rounded-md bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/20 px-3 py-1 text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                    TAX INVOICE / RECEIPT
                  </span>
                  <h3 className="mt-2 text-base font-bold text-gray-900 dark:text-white font-mono">
                    {viewingInvoice.txnId}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Date: {viewingInvoice.dateTime}
                  </p>
                </div>
              </div>

              {/* Billed To & PNR Reference Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-5 border-b border-gray-200 dark:border-gray-700 text-xs">
                <div>
                  <h4 className="font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Billed To Customer
                  </h4>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {viewingInvoice.customerName}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400">
                    {viewingInvoice.customerEmail}
                  </p>
                </div>

                <div className="sm:text-right">
                  <h4 className="font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Booking Reference
                  </h4>
                  <p className="text-sm font-mono font-bold text-brand-600 dark:text-brand-400">
                    PNR: {viewingInvoice.pnr}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400">
                    Gateway: {viewingInvoice.gateway}
                  </p>
                  <div className="mt-1">
                    <Badge
                      size="sm"
                      color={
                        viewingInvoice.status === "Successful"
                          ? "success"
                          : viewingInvoice.status === "Pending"
                          ? "warning"
                          : "error"
                      }
                    >
                      STATUS: {viewingInvoice.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Itemized Line Items Table */}
              <div className="my-5 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-4 py-3">Description</th>
                      <th className="px-4 py-3">Operating Airline</th>
                      <th className="px-4 py-3 text-right">Amount Paid</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
                    <tr>
                      <td className="px-4 py-3.5 font-semibold">
                        {viewingInvoice.flightRoute || "Flight Reservation Ticket"}
                        <span className="block text-[11px] font-normal text-gray-400 mt-0.5">
                          Confirmed E-Ticket • PNR Ref: {viewingInvoice.pnr}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-medium">
                        {viewingInvoice.airline || "Emirates"}
                      </td>
                      <td className="px-4 py-3.5 text-right font-bold text-gray-900 dark:text-white text-sm">
                        {viewingInvoice.amount}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Total Paid Summary Banner */}
              <div className="flex justify-between items-center py-4 border-t border-b border-gray-200 dark:border-gray-700 my-5 bg-gray-50/50 dark:bg-gray-800/30 px-4 rounded-xl">
                <div className="text-xs">
                  <p className="font-bold text-gray-700 dark:text-gray-300">
                    Payment Verification
                  </p>
                  <p className="text-gray-400 text-[11px]">
                    Verified electronically via {viewingInvoice.gateway}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-gray-400 block">
                    Total Net Amount
                  </span>
                  <span className="text-2xl font-black text-brand-600 dark:text-brand-400">
                    {viewingInvoice.amount}
                  </span>
                </div>
              </div>

              {/* Printable Footer Signature Stamp */}
              <div className="pt-2 flex justify-between items-end text-[11px] text-gray-500 dark:text-gray-400">
                <div>
                  <p className="font-semibold text-gray-700 dark:text-gray-300">
                    AMD Global Travel Services Ltd.
                  </p>
                  <p className="text-[10px] text-gray-400">
                    Thank you for choosing AMD Global Travel! Have a safe trip.
                  </p>
                </div>
                <div className="text-right">
                  <div className="border-b border-gray-400 dark:border-gray-600 w-32 mb-1 ml-auto"></div>
                  <p className="font-semibold text-gray-600 dark:text-gray-400">
                    Authorized Signatory
                  </p>
                </div>
              </div>
            </div>

            {/* Screen-Only Action Buttons */}
            <div className="no-print mt-6 flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setViewingInvoice(null)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="rounded-lg bg-brand-500 px-5 py-2 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 flex items-center gap-1.5 cursor-pointer"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231a1.125 1.125 0 0 1-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.085 48.085 0 0 0-4.86-.391M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.087 48.087 0 0 1 4.86-.391m0 0a48.077 48.077 0 0 1 4.5 0m-4.5 0V5.25A2.25 2.25 0 0 1 11.25 3h1.5A2.25 2.25 0 0 1 15 5.25v2.25"
                  />
                </svg>
                Print / Save PDF Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. ISSUE REFUND CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {refundTxn && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-error-50 text-error-600 dark:bg-error-500/10 dark:text-error-400 mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Issue Refund for {refundTxn.txnId}?
            </h3>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Are you sure you want to refund <strong className="text-gray-800 dark:text-white">{refundTxn.amount}</strong> to {refundTxn.customerName}? This will process a chargeback via {refundTxn.gateway}.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setRefundTxn(null)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRefund}
                className="rounded-lg bg-error-600 px-5 py-2 text-sm font-medium text-white shadow-theme-xs hover:bg-error-700 cursor-pointer"
              >
                Confirm & Refund
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
