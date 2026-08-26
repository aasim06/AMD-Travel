"use client";
import React, { useState, useEffect } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import DeleteConfirmModal from "../routes/DeleteConfirmModal";

const PAGE_SIZE = 5;

const statusFilters = [
  { value: "ALL", label: "All Statuses" },
  { value: "PENDING", label: "Pending Applications" },
  { value: "PROCESSING", label: "Processing Applications" },
  { value: "APPROVED", label: "Approved Visas" },
  { value: "REJECTED", label: "Rejected Applications" },
];

export default function VisaApplicationsManager() {
  const [applications, setApplications] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [selectedFilter, setSelectedFilter] = useState(statusFilters[0]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [zoomedImage, setZoomedImage] = useState<{ url: string; title: string } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const loadApplications = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/admin/visa", { cache: "no-store" });
      const json = await res.json();
      if (json?.data) {
        setApplications(json.data);
      }
    } catch (err) {
      console.error("Failed to load visa applications", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadApplications();
    const handleFocus = () => loadApplications();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, filterStatus]);

  const handleSelectFilterOption = (filter: typeof statusFilters[0]) => {
    setSelectedFilter(filter);
    setFilterStatus(filter.value);
    setIsFilterOpen(false);
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const upperStatus = newStatus.toUpperCase();

    // ⚡ INSTANT Optimistic UI Update (0ms delay!)
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: upperStatus } : app))
    );
    if (selectedApp && selectedApp.id === id) {
      setSelectedApp((prev: any) => ({ ...prev, status: upperStatus }));
    }

    try {
      await fetch("/api/admin/visa", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: upperStatus }),
      });
    } catch (err) {
      console.error("Failed to update visa status", err);
    }
  };

  const handleSelectApp = async (app: any) => {
    setSelectedApp(app);
    setIsLoadingDetails(true);
    try {
      const res = await fetch(`/api/admin/visa?id=${app.id}`);
      const json = await res.json();
      if (json?.data) {
        // 🔒 If user already closed the modal (prev is null), NEVER re-open it!
        setSelectedApp((prev: any) => {
          if (!prev) return null;
          return prev.id === app.id
            ? { ...json.data, status: prev.status }
            : prev;
        });
      }
    } catch (err) {
      console.error("Failed to load application details", err);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const promptDeleteApp = (id: string) => {
    setDeleteTargetId(id);
  };

  const confirmDeleteApp = async () => {
    if (!deleteTargetId) return;
    const id = deleteTargetId;
    setDeleteTargetId(null);

    setApplications((prev) => prev.filter((app) => app.id !== id));
    if (selectedApp?.id === id) setSelectedApp(null);

    try {
      await fetch(`/api/admin/visa?id=${id}`, { method: "DELETE" });
    } catch (err) {
      console.error("Failed to delete application", err);
      loadApplications();
    }
  };

  const resolveDocImage = (val: string | null | undefined, defaultFallback: string) => {
    if (!val) return defaultFallback;
    if (val.startsWith("data:image") || val.startsWith("http://") || val.startsWith("https://") || val.startsWith("/")) {
      return val;
    }
    return defaultFallback;
  };

  const getInitials = (firstName?: string, surname?: string) => {
    const f = firstName?.[0] || "";
    const s = surname?.[0] || "";
    return (f + s).toUpperCase() || "VA";
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-brand-500",
      "bg-purple-500",
      "bg-emerald-500",
      "bg-rose-500",
      "bg-amber-500",
      "bg-indigo-500",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
    return colors[Math.abs(hash) % colors.length];
  };

  const filtered = applications.filter((app) => {
    const matchesStatus = filterStatus === "ALL" || app.status === filterStatus;
    const matchesSearch =
      app.applicationNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.surname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.passportNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.country?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6">

      {/* Search & Filter Header Bar (Matching Travelers Header Exactly) */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search by Name, Email, Phone, or Passport..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-xs text-gray-800 outline-none focus:border-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
          />
          <svg
            className="absolute left-3.5 top-3 h-4 w-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Filter Dropdown & Refresh Button */}
        <div className="flex items-center gap-3">

          {/* Custom Theme Filter Dropdown */}
          <div className="relative sm:w-56">
            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="dropdown-toggle h-10 w-full inline-flex items-center justify-between gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-gray-700 shadow-xs focus:border-brand-300 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-gray-400 dark:text-gray-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z"
                  />
                </svg>
                {selectedFilter.label}
              </span>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isFilterOpen ? "rotate-180" : ""}`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
              </svg>
            </button>

            <Dropdown
              isOpen={isFilterOpen}
              onClose={() => setIsFilterOpen(false)}
              className="w-full min-w-[200px] p-1.5 z-50"
            >
              {statusFilters.map((filter) => (
                <DropdownItem
                  key={filter.value}
                  onItemClick={() => handleSelectFilterOption(filter)}
                  className={`flex w-full items-center rounded-lg px-3 py-2 text-xs font-medium text-left transition-colors duration-150 cursor-pointer ${selectedFilter.value === filter.value
                      ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 font-semibold"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-gray-200"
                    }`}
                >
                  <span className="mr-2 w-4 shrink-0">
                    {selectedFilter.value === filter.value && (
                      <svg
                        className="w-4 h-4 text-brand-500"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2.5}
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    )}
                  </span>
                  {filter.label}
                </DropdownItem>
              ))}
            </Dropdown>
          </div>

          <button
            type="button"
            onClick={() => loadApplications()}
            disabled={isRefreshing}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-white flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-colors"
          >
            <svg className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-brand-500" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{isRefreshing ? "Refreshing..." : "Refresh Inbox"}</span>
          </button>
        </div>
      </div>

      {/* Main Professional Table Container */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] shadow-xs">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                <th className="px-5 py-4 font-medium text-gray-500 text-xs dark:text-gray-400 whitespace-nowrap">Applicant</th>
                <th className="px-5 py-4 font-medium text-gray-500 text-xs dark:text-gray-400 whitespace-nowrap">App Reference</th>
                <th className="px-5 py-4 font-medium text-gray-500 text-xs dark:text-gray-400 whitespace-nowrap">Destination &amp; Plan</th>
                <th className="px-5 py-4 font-medium text-gray-500 text-xs dark:text-gray-400 whitespace-nowrap">Passport Number</th>
                <th className="px-5 py-4 font-medium text-gray-500 text-xs dark:text-gray-400 whitespace-nowrap">Status</th>
                <th className="px-5 py-4 font-medium text-gray-500 text-xs dark:text-gray-400 whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {paginated.length > 0 ? (
                paginated.map((app) => (
                  <tr
                    key={app.id}
                    className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors duration-150"
                  >
                    {/* Applicant Avatar & Details */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${getAvatarColor(app.firstName + app.surname)} shrink-0`}>
                          <span className="text-sm font-semibold text-white">
                            {getInitials(app.firstName, app.surname)}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-sm dark:text-white/90">
                            {app.firstName} {app.surname}
                          </p>
                          <span className="text-gray-500 text-xs dark:text-gray-400">
                            {app.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* App Reference */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="font-mono font-semibold text-brand-600 dark:text-brand-400 text-xs">
                        {app.applicationNo}
                      </span>
                    </td>

                    {/* Destination & Plan */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <p className="font-semibold text-gray-800 text-xs dark:text-gray-200">
                        {app.country}
                      </p>
                      <span className="text-gray-500 text-xs dark:text-gray-400">
                        {app.visaType} ({app.visaPlan})
                      </span>
                    </td>

                    {/* Passport Number */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="font-mono font-semibold text-gray-800 dark:text-gray-200 text-xs">
                        {app.passportNo}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${app.status === "APPROVED"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300"
                            : app.status === "PROCESSING"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300"
                              : app.status === "REJECTED"
                                ? "bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300"
                          }`}
                      >
                        {app.status}
                      </span>
                    </td>

                    {/* Actions Icons */}
                    <td className="px-5 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* View Details Eye Icon Button */}
                        <button
                          title="View Details & Documents"
                          onClick={() => handleSelectApp(app)}
                          className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-brand-50 hover:border-brand-200 hover:text-brand-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-brand-500/10 dark:hover:text-brand-400 transition-colors duration-150 cursor-pointer"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12s3.375-6.75 9.75-6.75S21.75 12 21.75 12s-3.375 6.75-9.75 6.75S2.25 12 2.25 12Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          </svg>
                        </button>

                        {/* Delete Application Trash Icon Button */}
                        <button
                          title="Delete Application"
                          onClick={() => promptDeleteApp(app.id)}
                          className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 transition-colors duration-150 cursor-pointer"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-gray-500 dark:text-gray-400 text-xs">
                    No visa applications found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 px-5 py-4 dark:border-gray-800 sm:px-6">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            Showing{" "}
            <span className="font-semibold text-gray-700 dark:text-gray-300">
              {filtered.length > 0 ? (page - 1) * PAGE_SIZE + 1 : 0}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-gray-700 dark:text-gray-300">
              {Math.min(page * PAGE_SIZE, filtered.length)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-700 dark:text-gray-300">
              {filtered.length}
            </span>{" "}
            applications
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.05] transition-colors duration-150 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`inline-flex items-center justify-center w-8 h-8 rounded-lg border text-xs font-semibold transition-colors duration-150 cursor-pointer ${p === page
                    ? "border-brand-500 bg-brand-500 text-white shadow-xs"
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.05]"
                  }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.05] transition-colors duration-150 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal (Matching Pic 1 Exactly) */}
      <DeleteConfirmModal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={confirmDeleteApp}
        title="Delete Application"
        description="Are you sure you want to delete this visa application? This action cannot be undone."
      />

      {/* Modal Details View */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900 border border-gray-200 dark:border-gray-800 max-h-[92vh] overflow-y-auto">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
              <div>
                <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider font-mono">
                  APPLICATION #{selectedApp.applicationNo}
                </span>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white font-outfit">
                  {selectedApp.firstName} {selectedApp.surname} &apos;s Visa Application
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Applicant Details Grid */}
            <div className="mt-5 grid grid-cols-2 gap-y-4 gap-x-6 text-xs bg-gray-50/70 dark:bg-gray-800/40 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
              <div>
                <span className="text-gray-400 block font-medium">Destination Country</span>
                <span className="font-bold text-gray-900 dark:text-gray-100">{selectedApp.country}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">Visa Type &amp; Plan</span>
                <span className="font-bold text-gray-900 dark:text-gray-100">{selectedApp.visaType} ({selectedApp.visaPlan})</span>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">Father &amp; Mother Name</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{selectedApp.fatherName} / {selectedApp.motherName}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">Contact Email &amp; Phone</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{selectedApp.email} ({selectedApp.phone})</span>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">Passport Number</span>
                <span className="font-bold font-mono text-brand-600 dark:text-brand-400">{selectedApp.passportNo}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">Passport Expiry</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {selectedApp.expiryDate ? new Date(selectedApp.expiryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                </span>
              </div>
            </div>

            {/* Document Scans & Images */}
            <div className="mt-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3 font-mono flex items-center gap-2">
                <span>Uploaded Documents &amp; Passport Scans:</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* 1. Passport Front Page */}
                {(() => {
                  const src = resolveDocImage(
                    selectedApp.passportFront,
                    "https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&q=80"
                  );
                  return (
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                          Passport Front Page
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono truncate max-w-[120px]">
                          {selectedApp.passportFront || "passport_front.jpg"}
                        </span>
                      </div>
                      <div
                        onClick={() => setZoomedImage({ url: src, title: "Passport Front Page" })}
                        className="relative group rounded-lg overflow-hidden border border-gray-100 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 h-36 flex items-center justify-center cursor-pointer"
                      >
                        <img
                          src={src}
                          alt="Passport Front"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            type="button"
                            className="rounded bg-white px-3.5 py-1.5 text-xs font-bold text-gray-800 shadow-md hover:bg-gray-100 cursor-pointer"
                          >
                            Click to Enlarge
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* 2. Passport Back Page */}
                {(() => {
                  const src = resolveDocImage(
                    selectedApp.passportBack,
                    "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&q=80"
                  );
                  return (
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                          Passport Back Page
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono truncate max-w-[120px]">
                          {selectedApp.passportBack || "passport_back.jpg"}
                        </span>
                      </div>
                      <div
                        onClick={() => setZoomedImage({ url: src, title: "Passport Back Page" })}
                        className="relative group rounded-lg overflow-hidden border border-gray-100 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 h-36 flex items-center justify-center cursor-pointer"
                      >
                        <img
                          src={src}
                          alt="Passport Back"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            type="button"
                            className="rounded bg-white px-3.5 py-1.5 text-xs font-bold text-gray-800 shadow-md hover:bg-gray-100 cursor-pointer"
                          >
                            Click to Enlarge
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* 3. Passport Size Photo */}
                {(() => {
                  const src = resolveDocImage(
                    selectedApp.passportPhoto,
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80"
                  );
                  return (
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                          📷 Passport Size Photo
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono truncate max-w-[120px]">
                          {selectedApp.passportPhoto || "passport_photo.jpg"}
                        </span>
                      </div>
                      <div
                        onClick={() => setZoomedImage({ url: src, title: "Passport Size Photo" })}
                        className="relative group rounded-lg overflow-hidden border border-gray-100 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 h-36 flex items-center justify-center cursor-pointer"
                      >
                        <img
                          src={src}
                          alt="Passport Photo"
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            type="button"
                            className="rounded bg-white px-3.5 py-1.5 text-xs font-bold text-gray-800 shadow-md hover:bg-gray-100 cursor-pointer"
                          >
                            Click to Enlarge
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* 4. Additional Document */}
                {(() => {
                  const src = resolveDocImage(
                    selectedApp.additionalDoc,
                    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80"
                  );
                  return (
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                          📋 Additional Document
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono truncate max-w-[120px]">
                          {selectedApp.additionalDoc || "additional_doc.jpg"}
                        </span>
                      </div>
                      <div
                        onClick={() => setZoomedImage({ url: src, title: "Additional Document" })}
                        className="relative group rounded-lg overflow-hidden border border-gray-100 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 h-36 flex items-center justify-center cursor-pointer"
                      >
                        <img
                          src={src}
                          alt="Additional Document"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            type="button"
                            className="rounded bg-white px-3.5 py-1.5 text-xs font-bold text-gray-800 shadow-md hover:bg-gray-100 cursor-pointer"
                          >
                            Click to Enlarge
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()}

              </div>
            </div>

            {/* Status Change Controls */}
            <div className="mt-6 rounded-xl bg-gray-50 dark:bg-gray-800/50 p-4 border border-gray-200 dark:border-gray-700/60">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-3 font-outfit">
                Update Application Decision:
              </span>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedApp.id, "APPROVED")}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all cursor-pointer ${selectedApp.status === "APPROVED"
                      ? "bg-emerald-600 text-white ring-2 ring-emerald-400 ring-offset-2 scale-105 shadow-md"
                      : "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white dark:bg-emerald-500/20 dark:text-emerald-300"
                    }`}
                >
                  <span className={`h-2 w-2 rounded-full ${selectedApp.status === "APPROVED" ? "bg-white animate-pulse" : "bg-emerald-500"}`} />
                  Approve Visa
                </button>

                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedApp.id, "PROCESSING")}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all cursor-pointer ${selectedApp.status === "PROCESSING"
                      ? "bg-blue-600 text-white ring-2 ring-blue-400 ring-offset-2 scale-105 shadow-md"
                      : "bg-blue-500/10 text-blue-600 hover:bg-blue-500 hover:text-white dark:bg-blue-500/20 dark:text-blue-300"
                    }`}
                >
                  <span className={`h-2 w-2 rounded-full ${selectedApp.status === "PROCESSING" ? "bg-white animate-pulse" : "bg-blue-500"}`} />
                  Set Processing
                </button>

                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedApp.id, "REJECTED")}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all cursor-pointer ${selectedApp.status === "REJECTED"
                      ? "bg-rose-600 text-white ring-2 ring-rose-400 ring-offset-2 scale-105 shadow-md"
                      : "bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white dark:bg-rose-500/20 dark:text-rose-300"
                    }`}
                >
                  <span className={`h-2 w-2 rounded-full ${selectedApp.status === "REJECTED" ? "bg-white animate-pulse" : "bg-rose-500"}`} />
                  Reject Application
                </button>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="rounded-xl bg-brand-500 px-6 py-2.5 text-xs font-bold text-white shadow-theme-xs hover:bg-brand-600 transition-colors cursor-pointer font-outfit"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Lightbox Fullscreen Zoom Modal */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 p-4 sm:p-6 backdrop-blur-xl"
          onClick={() => setZoomedImage(null)}
        >
          <div
            className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border border-white/15 bg-gray-900/95 p-5 sm:p-6 shadow-2xl backdrop-blur-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <span className="rounded-lg bg-brand-500/20 px-2.5 py-1 text-[11px] font-bold text-brand-400 font-mono uppercase tracking-wider border border-brand-500/30">
                  Document Preview
                </span>
                <h4 className="text-base font-bold text-white font-outfit">{zoomedImage.title}</h4>
              </div>
              <button
                type="button"
                onClick={() => setZoomedImage(null)}
                className="rounded-full p-2 text-gray-400 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
                title="Close Lightbox"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Image Preview Box */}
            <div className="relative flex-1 min-h-0 flex items-center justify-center rounded-2xl bg-black/60 p-3 border border-white/5 shadow-inner overflow-hidden">
              <img
                src={zoomedImage.url}
                alt={zoomedImage.title}
                className="max-h-[68vh] w-auto max-w-full object-contain rounded-xl shadow-2xl transition-transform duration-300"
              />
            </div>

            {/* Bottom Action Footer */}
            <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-4">
              <span className="text-xs text-gray-400 font-mono hidden sm:inline">
                High-Resolution Original Scan
              </span>
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setZoomedImage(null)}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-gray-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer font-outfit"
                >
                  Close
                </button>
                <a
                  href={zoomedImage.url}
                  download={`${zoomedImage.title.toLowerCase().replace(/\s+/g, "_")}.jpg`}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-brand-500/25 transition-all cursor-pointer font-outfit"
                >
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  <span>Download High-Res File</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
