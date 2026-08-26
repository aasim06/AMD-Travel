"use client";

import React, { useState, useEffect } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import CarsManagerForm from "@/components/cars/CarsManagerForm";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import DeleteConfirmModal from "@/components/routes/DeleteConfirmModal";
import { Car, Tag, ExternalLink } from "lucide-react";

const PAGE_SIZE = 5;

const statusFilters = [
  { value: "ALL", label: "All Statuses" },
  { value: "CONFIRMED", label: "Confirmed Bookings" },
  { value: "PENDING", label: "Pending Bookings" },
  { value: "CANCELLED", label: "Cancelled Bookings" },
];

export default function AdminCarsPage() {
  const [activeTab, setActiveTab] = useState<"reservations" | "manage">("reservations");
  const [carBookings, setCarBookings] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [selectedFilter, setSelectedFilter] = useState(statusFilters[0]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const [viewingBooking, setViewingBooking] = useState<any | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const loadCarBookings = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/admin/bookings", { cache: "no-store" });
      const json = await res.json();
      if (json?.data) {
        const filtered = json.data.filter((b: any) => (b.type || "").toLowerCase() === "car");
        setCarBookings(filtered);
      }
    } catch (err) {
      console.error("Failed to fetch car bookings", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadCarBookings();
    const handleFocus = () => loadCarBookings();
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
    setCarBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: upperStatus } : b))
    );
    if (viewingBooking && viewingBooking.id === id) {
      setViewingBooking((prev: any) => (prev ? { ...prev, status: upperStatus } : null));
    }

    try {
      await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: upperStatus }),
      });
    } catch (err) {
      console.error("Failed to update car booking status", err);
      loadCarBookings();
    }
  };

  const promptDeleteBooking = (id: string) => {
    setDeleteTargetId(id);
  };

  const confirmDeleteBooking = async () => {
    if (!deleteTargetId) return;
    const id = deleteTargetId;
    setDeleteTargetId(null);

    setCarBookings((prev) => prev.filter((b) => b.id !== id));
    if (viewingBooking?.id === id) setViewingBooking(null);

    try {
      await fetch(`/api/admin/bookings?id=${id}`, { method: "DELETE" });
    } catch (err) {
      console.error("Failed to delete car booking", err);
      loadCarBookings();
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "RC";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
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

  const filteredBookings = carBookings.filter((b) => {
    const matchesStatus = filterStatus === "ALL" || b.status === filterStatus;
    const q = searchQuery.toLowerCase();
    const driverName = b.passengers?.[0] ? `${b.passengers[0].firstName} ${b.passengers[0].lastName}` : b.user?.name || "";
    const pnr = b.pnr || "";
    const carName = b.destination || "";
    const phone = b.passengers?.[0]?.phone || b.user?.phone || "";
    const email = b.passengers?.[0]?.email || b.user?.email || "";
    const matchesSearch =
      driverName.toLowerCase().includes(q) ||
      pnr.toLowerCase().includes(q) ||
      carName.toLowerCase().includes(q) ||
      phone.includes(q) ||
      email.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / PAGE_SIZE));
  const paginatedBookings = filteredBookings.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Rent a Car" />

      {/* Page Header with Tabs */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90 font-outfit">
            Rent a Car Control Panel
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            View customer vehicle reservations and manage rental fleet listings.
          </p>
        </div>

        {/* Tab Switcher Buttons */}
        <div className="inline-flex items-center p-1 bg-gray-100 dark:bg-gray-800/80 rounded-2xl border border-gray-200 dark:border-gray-700/60 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("reservations")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "reservations"
                ? "bg-white text-brand-600 shadow-xs dark:bg-gray-900 dark:text-white"
                : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            <Car className="w-4 h-4 text-brand-500" />
            <span>Customer Reservations ({carBookings.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("manage")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "manage"
                ? "bg-white text-brand-600 shadow-xs dark:bg-gray-900 dark:text-white"
                : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            <Tag className="w-4 h-4 text-emerald-500" />
            <span>Manage Fleet Vehicles</span>
          </button>
        </div>
      </div>

      {/* Content Body */}
      {activeTab === "reservations" ? (
        <div className="space-y-6">

          {/* Search & Filter Header Bar (Matching Visa Applications Inbox Header Exactly) */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search by Driver, PNR, Car Model, Phone..."
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
                      className={`flex w-full items-center rounded-lg px-3 py-2 text-xs font-medium text-left transition-colors duration-150 cursor-pointer ${
                        selectedFilter.value === filter.value
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
                onClick={() => loadCarBookings()}
                disabled={isRefreshing}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-white flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-colors"
              >
                <svg className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-brand-500" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>{isRefreshing ? "Refreshing..." : "Refresh Bookings"}</span>
              </button>
            </div>
          </div>

          {/* Main Professional Table Container (Matching Visa Applications Table Exactly) */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] shadow-xs">
            <div className="max-w-full overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                    <th className="px-5 py-4 font-medium text-gray-500 text-xs dark:text-gray-400 whitespace-nowrap">Driver Details</th>
                    <th className="px-5 py-4 font-medium text-gray-500 text-xs dark:text-gray-400 whitespace-nowrap">Booking Reference / PNR</th>
                    <th className="px-5 py-4 font-medium text-gray-500 text-xs dark:text-gray-400 whitespace-nowrap">Vehicle &amp; Category</th>
                    <th className="px-5 py-4 font-medium text-gray-500 text-xs dark:text-gray-400 whitespace-nowrap">Pickup Location &amp; Dates</th>
                    <th className="px-5 py-4 font-medium text-gray-500 text-xs dark:text-gray-400 whitespace-nowrap">Total Rental Price</th>
                    <th className="px-5 py-4 font-medium text-gray-500 text-xs dark:text-gray-400 whitespace-nowrap">Status</th>
                    <th className="px-5 py-4 font-medium text-gray-500 text-xs dark:text-gray-400 whitespace-nowrap text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {paginatedBookings.length > 0 ? (
                    paginatedBookings.map((b) => {
                      const driver = b.passengers?.[0] || {};
                      const driverName = driver.firstName ? `${driver.firstName} ${driver.lastName}` : b.user?.name || "Customer Driver";
                      const driverPhone = driver.phone || b.user?.phone || "N/A";
                      const driverEmail = driver.email || b.user?.email || "";
                      const pickupDateStr = new Date(b.departureDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
                      const returnDateStr = b.returnDate ? new Date(b.returnDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "N/A";

                      return (
                        <tr
                          key={b.id}
                          className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors duration-150"
                        >
                          {/* Driver Avatar & Details */}
                          <td className="px-5 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${getAvatarColor(driverName)} shrink-0`}>
                                <span className="text-sm font-semibold text-white">
                                  {getInitials(driverName)}
                                </span>
                              </div>
                              <div>
                                <p className="font-semibold text-gray-800 text-sm dark:text-white/90">
                                  {driverName}
                                </p>
                                <span className="text-gray-500 text-xs dark:text-gray-400 block font-mono">
                                  {driverPhone} {driverEmail ? `• ${driverEmail}` : ""}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* PNR Code */}
                          <td className="px-5 py-4 whitespace-nowrap">
                            <span className="font-mono font-semibold text-brand-600 dark:text-brand-400 text-xs">
                              {b.pnr}
                            </span>
                            <span className="text-[10px] text-gray-400 block mt-0.5">
                              {new Date(b.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </td>

                          {/* Vehicle Name & Category */}
                          <td className="px-5 py-4 whitespace-nowrap">
                            <p className="font-semibold text-gray-800 text-xs dark:text-gray-200">
                              {b.destination}
                            </p>
                            <span className="text-gray-500 text-xs dark:text-gray-400">
                              {b.flightNumber || "Car Rental"}
                            </span>
                          </td>

                          {/* Pickup Location & Dates */}
                          <td className="px-5 py-4 whitespace-nowrap">
                            <p className="font-semibold text-gray-800 text-xs dark:text-gray-200">
                              {b.origin}
                            </p>
                            <span className="text-gray-500 text-xs dark:text-gray-400">
                              {pickupDateStr} — {returnDateStr}
                            </span>
                          </td>

                          {/* Total Rental Price */}
                          <td className="px-5 py-4 whitespace-nowrap">
                            <span className="font-mono font-bold text-gray-800 dark:text-gray-200 text-xs block">
                              {b.currency === "EUR" ? "€" : "$"}{b.totalAmount}
                            </span>
                            <span className="text-[10px] text-gray-400 uppercase">
                              {b.payment?.gateway || "Pay on Arrival"}
                            </span>
                          </td>

                          {/* Status Badge */}
                          <td className="px-5 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                b.status === "CONFIRMED"
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300"
                                  : b.status === "PENDING"
                                    ? "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300"
                                    : "bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300"
                              }`}
                            >
                              {b.status || "CONFIRMED"}
                            </span>
                          </td>

                          {/* Actions Icons */}
                          <td className="px-5 py-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* View Details Eye Icon Button */}
                              <button
                                title="View Car Reservation Details"
                                onClick={() => setViewingBooking(b)}
                                className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-brand-50 hover:border-brand-200 hover:text-brand-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-brand-500/10 dark:hover:text-brand-400 transition-colors duration-150 cursor-pointer"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12s3.375-6.75 9.75-6.75S21.75 12 21.75 12s-3.375 6.75-9.75 6.75S2.25 12 2.25 12Z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                </svg>
                              </button>

                              {/* Delete Application Trash Icon Button */}
                              <button
                                title="Delete Car Reservation"
                                onClick={() => promptDeleteBooking(b.id)}
                                className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 transition-colors duration-150 cursor-pointer"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-5 py-10 text-center text-gray-500 dark:text-gray-400 text-xs">
                        No vehicle reservations found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer (Matching Visa Applications Pagination Exactly) */}
            <div className="flex items-center justify-between border-t border-gray-100 px-5 py-4 dark:border-gray-800 sm:px-6">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                Showing{" "}
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  {filteredBookings.length > 0 ? (page - 1) * PAGE_SIZE + 1 : 0}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  {Math.min(page * PAGE_SIZE, filteredBookings.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  {filteredBookings.length}
                </span>{" "}
                reservations
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
                    className={`inline-flex items-center justify-center w-8 h-8 rounded-lg border text-xs font-semibold transition-colors duration-150 cursor-pointer ${
                      p === page
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

        </div>
      ) : (
        /* MANAGE FLEET VEHICLES TAB */
        <div className="w-full">
          <CarsManagerForm />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={confirmDeleteBooking}
        title="Delete Car Reservation"
        description="Are you sure you want to delete this car reservation? This action cannot be undone."
      />

      {/* Modal Details View (Matching Visa Application Modal View Exactly) */}
      {viewingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900 border border-gray-200 dark:border-gray-800 max-h-[92vh] overflow-y-auto">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
              <div>
                <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider font-mono">
                  PNR #{viewingBooking.pnr}
                </span>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white font-outfit">
                  {viewingBooking.passengers?.[0] ? `${viewingBooking.passengers[0].firstName} ${viewingBooking.passengers[0].lastName}` : viewingBooking.user?.name || "Customer"} &apos;s Car Reservation
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingBooking(null)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Reservation Details Grid */}
            <div className="mt-5 grid grid-cols-2 gap-y-4 gap-x-6 text-xs bg-gray-50/70 dark:bg-gray-800/40 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
              <div>
                <span className="text-gray-400 block font-medium">Vehicle &amp; Category</span>
                <span className="font-bold text-gray-900 dark:text-gray-100">{viewingBooking.destination}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">Rental Package / Category</span>
                <span className="font-bold text-gray-900 dark:text-gray-100">{viewingBooking.flightNumber || "Standard Rental"}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">Lead Driver Name</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {viewingBooking.passengers?.[0] ? `${viewingBooking.passengers[0].firstName} ${viewingBooking.passengers[0].lastName}` : viewingBooking.user?.name || "Customer Driver"}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">Contact Phone &amp; Email</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200 font-mono">
                  {viewingBooking.passengers?.[0]?.phone || viewingBooking.user?.phone || "N/A"} ({viewingBooking.passengers?.[0]?.email || viewingBooking.user?.email || "No Email"})
                </span>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">Pickup Location</span>
                <span className="font-bold font-mono text-brand-600 dark:text-brand-400">{viewingBooking.origin}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">Rental Dates</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {new Date(viewingBooking.departureDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  {viewingBooking.returnDate ? ` → ${new Date(viewingBooking.returnDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}` : ""}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">Total Rental Price</span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                  {viewingBooking.currency === "EUR" ? "€" : "$"}{viewingBooking.totalAmount}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">Payment Gateway / Method</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200 uppercase">
                  {viewingBooking.payment?.gateway || "Pay on Arrival"}
                </span>
              </div>
            </div>

            {/* Status Change Controls */}
            <div className="mt-6 rounded-xl bg-gray-50 dark:bg-gray-800/50 p-4 border border-gray-200 dark:border-gray-700/60">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-3 font-outfit">
                Update Reservation Decision:
              </span>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(viewingBooking.id, "CONFIRMED")}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                    viewingBooking.status === "CONFIRMED"
                      ? "bg-emerald-600 text-white ring-2 ring-emerald-400 ring-offset-2 scale-105 shadow-md"
                      : "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white dark:bg-emerald-500/20 dark:text-emerald-300"
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${viewingBooking.status === "CONFIRMED" ? "bg-white animate-pulse" : "bg-emerald-500"}`} />
                  Approve / Confirm Booking
                </button>

                <button
                  type="button"
                  onClick={() => handleUpdateStatus(viewingBooking.id, "PENDING")}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                    viewingBooking.status === "PENDING"
                      ? "bg-amber-600 text-white ring-2 ring-amber-400 ring-offset-2 scale-105 shadow-md"
                      : "bg-amber-500/10 text-amber-600 hover:bg-amber-500 hover:text-white dark:bg-amber-500/20 dark:text-amber-300"
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${viewingBooking.status === "PENDING" ? "bg-white animate-pulse" : "bg-amber-500"}`} />
                  Set Pending
                </button>

                <button
                  type="button"
                  onClick={() => handleUpdateStatus(viewingBooking.id, "CANCELLED")}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                    viewingBooking.status === "CANCELLED"
                      ? "bg-rose-600 text-white ring-2 ring-rose-400 ring-offset-2 scale-105 shadow-md"
                      : "bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white dark:bg-rose-500/20 dark:text-rose-300"
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${viewingBooking.status === "CANCELLED" ? "bg-white animate-pulse" : "bg-rose-500"}`} />
                  Cancel Reservation
                </button>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="mt-6 flex items-center justify-between">
              {viewingBooking.passengers?.[0]?.phone ? (
                <a
                  href={`https://wa.me/${viewingBooking.passengers[0].phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hi ${viewingBooking.passengers[0].firstName}! Regarding your Car Reservation ${viewingBooking.pnr} for ${viewingBooking.destination}...`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-colors"
                >
                  <span>Chat on WhatsApp</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : (
                <div />
              )}

              <button
                type="button"
                onClick={() => setViewingBooking(null)}
                className="rounded-xl bg-brand-500 px-6 py-2.5 text-xs font-bold text-white shadow-theme-xs hover:bg-brand-600 transition-colors cursor-pointer font-outfit"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
