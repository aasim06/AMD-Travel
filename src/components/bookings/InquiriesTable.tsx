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

interface Inquiry {
  id: number;
  inquiryId: string;
  customerName: string;
  customerEmail: string;
  subject: string;
  dateReceived: string;
  priority: "High" | "Medium" | "Low";
  status: "Open" | "In Progress" | "Resolved";
  message: string;
  reply?: string;
}

const initialInquiries: Inquiry[] = [
  {
    id: 1,
    inquiryId: "INQ-4521",
    customerName: "Ayesha Khan",
    customerEmail: "ayesha.khan@example.com",
    subject: "Baggage allowance inquiry",
    dateReceived: "Oct 10, 2026",
    priority: "Low",
    status: "Resolved",
    message:
      "Hi, I have booked a flight with Emirates (EK-623). Can you please clarify if 25kg checked baggage is included for Economy class passengers?",
    reply:
      "Dear Ayesha, yes, 25kg checked baggage along with 7kg cabin bag is included in your ticket.",
  },
  {
    id: 2,
    inquiryId: "INQ-4532",
    customerName: "Omer Farooq",
    customerEmail: "omer.farooq@example.com",
    subject: "Flight change request",
    dateReceived: "Oct 11, 2026",
    priority: "High",
    status: "Open",
    message:
      "Assalam-o-Alaikum, I need to reschedule my flight from Karachi to Dubai (FZ-334) due to an urgent family emergency. Please advise on date change options and fare difference.",
  },
  {
    id: 3,
    inquiryId: "INQ-4545",
    customerName: "Sana Rizvi",
    customerEmail: "sana.rizvi@example.com",
    subject: "Payment issue on checkout",
    dateReceived: "Oct 12, 2026",
    priority: "High",
    status: "In Progress",
    message:
      "My credit card was charged $820.00 on checkout, but I did not receive the e-ticket confirmation PNR email. Kindly verify the payment status.",
  },
  {
    id: 4,
    inquiryId: "INQ-4560",
    customerName: "Hamza Ali",
    customerEmail: "hamza.ali@example.com",
    subject: "Meal selection not updating",
    dateReceived: "Oct 12, 2026",
    priority: "Medium",
    status: "Open",
    message:
      "I attempted to select Halal Asian Vegetarian Meal for my ticket, but the system shows 'Pending'. Can you manually assign it?",
  },
  {
    id: 5,
    inquiryId: "INQ-4572",
    customerName: "Nida Jamil",
    customerEmail: "nida.jamil@example.com",
    subject: "Wheelchair assistance required",
    dateReceived: "Oct 13, 2026",
    priority: "High",
    status: "Resolved",
    message:
      "My elderly mother is traveling on this booking. Please arrange wheelchair assistance at Islamabad Airport during boarding.",
    reply:
      "Dear Nida, wheelchair SSR request has been added to your PNR. Airport ground staff will assist upon arrival.",
  },
  {
    id: 6,
    inquiryId: "INQ-4581",
    customerName: "Tariq Mahmood",
    customerEmail: "tariq.mahmood@example.com",
    subject: "Group booking discount",
    dateReceived: "Oct 14, 2026",
    priority: "Medium",
    status: "In Progress",
    message:
      "We are a group of 12 passengers traveling to Jeddah for Umrah. Are group discounts available for Saudia flights?",
  },
  {
    id: 7,
    inquiryId: "INQ-4590",
    customerName: "Fatima Noor",
    customerEmail: "fatima.noor@example.com",
    subject: "Missing miles points",
    dateReceived: "Oct 15, 2026",
    priority: "Low",
    status: "Open",
    message:
      "I completed my trip last week but the frequent flyer miles have not been credited to my loyalty account yet.",
  },
];

const PAGE_SIZE = 5;

export default function InquiriesTable() {
  const [inquiries, setInquiries] = useState<Inquiry[]>(initialInquiries);
  const [page, setPage] = useState(1);
  const [viewingInquiry, setViewingInquiry] = useState<Inquiry | null>(null);
  const [replyText, setReplyText] = useState("");

  const totalPages = Math.ceil(inquiries.length / PAGE_SIZE);
  const paginated = inquiries.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  // Toggle status (Open -> In Progress -> Resolved -> Open)
  const handleToggleStatus = (id: number) => {
    setInquiries((prev) =>
      prev.map((inq) => {
        if (inq.id === id) {
          const nextStatus: "Open" | "In Progress" | "Resolved" =
            inq.status === "Open"
              ? "In Progress"
              : inq.status === "In Progress"
              ? "Resolved"
              : "Open";
          return { ...inq, status: nextStatus };
        }
        return inq;
      })
    );
  };

  // Open Preview Modal
  const handleOpenPreview = (inquiry: Inquiry) => {
    setViewingInquiry(inquiry);
    setReplyText(inquiry.reply || "");
  };

  // Send Reply and Update Status to Resolved
  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewingInquiry || !replyText.trim()) return;

    setInquiries((prev) =>
      prev.map((inq) =>
        inq.id === viewingInquiry.id
          ? { ...inq, reply: replyText, status: "Resolved" }
          : inq
      )
    );

    setViewingInquiry((prev) =>
      prev ? { ...prev, reply: replyText, status: "Resolved" } : null
    );
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          {/* Header */}
          <TableHeader className="border-b border-gray-100 dark:border-gray-800">
            <TableRow>
              <TableCell
                isHeader
                className="px-5 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
              >
                Inquiry ID
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
              >
                Customer
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
              >
                Subject
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
              >
                Date Received
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
              >
                Priority
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
              >
                Status
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>

          {/* Body */}
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {paginated.map((inquiry) => (
              <TableRow
                key={inquiry.id}
                className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors duration-150"
              >
                {/* Inquiry ID */}
                <TableCell className="px-5 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                    {inquiry.inquiryId}
                  </span>
                </TableCell>

                {/* Customer */}
                <TableCell className="px-5 py-4 whitespace-nowrap">
                  <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                    {inquiry.customerName}
                  </p>
                  <span className="text-gray-400 text-theme-xs dark:text-gray-500">
                    {inquiry.customerEmail}
                  </span>
                </TableCell>

                {/* Subject */}
                <TableCell className="px-5 py-4 whitespace-nowrap">
                  <span className="font-medium text-gray-800 text-theme-sm dark:text-gray-300">
                    {inquiry.subject}
                  </span>
                </TableCell>

                {/* Date */}
                <TableCell className="px-5 py-4 whitespace-nowrap">
                  <span className="text-gray-600 text-theme-sm dark:text-gray-400">
                    {inquiry.dateReceived}
                  </span>
                </TableCell>

                {/* Priority */}
                <TableCell className="px-5 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      inquiry.priority === "High"
                        ? "bg-error-50 text-error-600 dark:bg-error-500/10 dark:text-error-400"
                        : inquiry.priority === "Medium"
                        ? "bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-400"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                    }`}
                  >
                    {inquiry.priority}
                  </span>
                </TableCell>

                {/* Status */}
                <TableCell className="px-5 py-4 whitespace-nowrap">
                  <Badge
                    size="sm"
                    color={
                      inquiry.status === "Resolved"
                        ? "success"
                        : inquiry.status === "In Progress"
                        ? "warning"
                        : "error"
                    }
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full inline-block mr-1 ${
                        inquiry.status === "Resolved"
                          ? "bg-success-500"
                          : inquiry.status === "In Progress"
                          ? "bg-warning-500"
                          : "bg-error-500"
                      }`}
                    />
                    {inquiry.status}
                  </Badge>
                </TableCell>

                {/* Actions */}
                <TableCell className="px-5 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {/* View Preview Button */}
                    <button
                      title="View & Reply Inquiry"
                      onClick={() => handleOpenPreview(inquiry)}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-brand-50 hover:border-brand-200 hover:text-brand-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-brand-500/10 dark:hover:text-brand-400 transition-colors duration-150 cursor-pointer"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.8}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                        />
                      </svg>
                    </button>

                    {/* Quick Toggle Status */}
                    <button
                      title="Toggle Status"
                      onClick={() => handleToggleStatus(inquiry.id)}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-success-50 hover:border-success-200 hover:text-success-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-success-500/10 dark:hover:text-success-400 transition-colors duration-150 cursor-pointer"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.8}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                        />
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
            {Math.min(page * PAGE_SIZE, inquiries.length)}
          </span>{" "}
          of{" "}
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {inquiries.length}
          </span>{" "}
          inquiries
        </p>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.05] transition-colors duration-150 cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* INQUIRY PREVIEW & REPLY MODAL */}
      {/* ========================================================================= */}
      {viewingInquiry && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 font-bold text-xs">
                  {viewingInquiry.inquiryId}
                </span>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                    {viewingInquiry.subject}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    From: {viewingInquiry.customerName} ({viewingInquiry.customerEmail})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingInquiry(null)}
                className="rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200 p-1.5 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Badges */}
            <div className="mt-4 flex items-center gap-2 text-xs">
              <span className="font-semibold text-gray-500 dark:text-gray-400">Status:</span>
              <Badge
                size="sm"
                color={
                  viewingInquiry.status === "Resolved"
                    ? "success"
                    : viewingInquiry.status === "In Progress"
                    ? "warning"
                    : "error"
                }
              >
                {viewingInquiry.status}
              </Badge>
              <span className="ml-3 font-semibold text-gray-500 dark:text-gray-400">Priority:</span>
              <span
                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                  viewingInquiry.priority === "High"
                    ? "bg-error-50 text-error-600 dark:bg-error-500/10 dark:text-error-400"
                    : viewingInquiry.priority === "Medium"
                    ? "bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-400"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                }`}
              >
                {viewingInquiry.priority}
              </span>
              <span className="ml-auto text-gray-400">{viewingInquiry.dateReceived}</span>
            </div>

            {/* Customer Message Box */}
            <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50/70 p-4 dark:border-gray-800 dark:bg-gray-800/40">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                Customer Message
              </h4>
              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                "{viewingInquiry.message}"
              </p>
            </div>

            {/* Support Reply Section */}
            <form onSubmit={handleSendReply} className="mt-4 flex flex-col gap-3">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Support Reply / Response Note
              </label>
              <textarea
                rows={3}
                required
                placeholder="Type your response to the customer..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-transparent px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:text-white"
              />

              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">Quick Status Change:</span>
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(viewingInquiry.id)}
                    className="rounded-lg border border-gray-300 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  >
                    Toggle Status
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setViewingInquiry(null)}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-brand-500 px-5 py-2 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600"
                  >
                    Send Reply & Resolve
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
