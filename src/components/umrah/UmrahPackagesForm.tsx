"use client";
import React, { useState, useEffect } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import DeleteConfirmModal from "../routes/DeleteConfirmModal";

const PAGE_SIZE = 5;

const categoryFilters = [
  { value: "ALL", label: "All Categories" },
  { value: "Economy", label: "Economy Packages" },
  { value: "Standard", label: "Standard Packages" },
  { value: "Premium", label: "Premium Packages" },
  { value: "Luxury", label: "Luxury Packages" },
];

const categoryFormOptions = [
  { value: "Economy", label: "Economy" },
  { value: "Standard", label: "Standard" },
  { value: "Premium", label: "Premium" },
  { value: "Luxury", label: "Luxury" },
];

export default function UmrahPackagesForm() {
  const [dbPackages, setDbPackages] = useState<any[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [selectedFilter, setSelectedFilter] = useState(categoryFilters[0]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [selectedPkgDetails, setSelectedPkgDetails] = useState<any | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State & Custom Dropdown State
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<"Economy" | "Standard" | "Premium" | "Luxury">("Economy");
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  const [newDestination, setNewDestination] = useState("Makkah & Madinah, Saudi Arabia");
  const [newPrice, setNewPrice] = useState("");
  const [newOriginalPrice, setNewOriginalPrice] = useState("");
  const [newDuration, setNewDuration] = useState("");
  const [newDepartureCity, setNewDepartureCity] = useState("Frankfurt, Germany");
  const [newGroupSize, setNewGroupSize] = useState("Up to 25 People");
  const [newMakkahNights, setNewMakkahNights] = useState("5");
  const [newMadinahNights, setNewMadinahNights] = useState("4");
  const [newMakkahHotel, setNewMakkahHotel] = useState("Al Safwah Royale Orchid ★★★");
  const [newMadinahHotel, setNewMadinahHotel] = useState("Dallah Taibah ★★★");
  const [newBadge, setNewBadge] = useState("Live Package");
  const [newIncludes, setNewIncludes] = useState("Return Flights, Hotel, Transfers, Visa");
  const [newImage, setNewImage] = useState("https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800&q=80");
  const [newDescription, setNewDescription] = useState("");
  const [isAddingPkg, setIsAddingPkg] = useState(false);

  const loadDbPackages = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/admin/cms/packages?type=UMRAH", { cache: "no-store" });
      const json = await res.json();
      if (json?.data) {
        setDbPackages(json.data);
      }
    } catch (err) {
      console.error("Failed to load Umrah packages", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadDbPackages();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, filterCategory]);

  const handleSelectFilterOption = (filter: typeof categoryFilters[0]) => {
    setSelectedFilter(filter);
    setFilterCategory(filter.value);
    setIsFilterOpen(false);
  };

  const handleCreatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newPrice) return;
    setIsAddingPkg(true);

    try {
      await fetch("/api/admin/cms/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          type: "UMRAH",
          category: newCategory,
          destination: newDestination || "Makkah & Madinah, Saudi Arabia",
          price: parseFloat(newPrice),
          originalPrice: newOriginalPrice ? parseFloat(newOriginalPrice) : Math.round(parseFloat(newPrice) * 1.3),
          durationDays: newDuration || `${Number(newMakkahNights) + Number(newMadinahNights)} Days / ${Number(newMakkahNights) + Number(newMadinahNights) - 1} Nights`,
          groupSize: newGroupSize,
          departureCity: newDepartureCity,
          makkahNights: Number(newMakkahNights),
          madinahNights: Number(newMadinahNights),
          makkahHotel: newMakkahHotel,
          madinahHotel: newMadinahHotel,
          badge: newBadge,
          includes: newIncludes,
          description: newDescription || "Exclusive luxury Umrah package with 5-star hotels & 24/7 guides.",
          image: newImage,
        }),
      });

      setNewTitle("");
      setNewPrice("");
      setNewOriginalPrice("");
      setNewDuration("");
      setNewDescription("");
      setShowAddModal(false);
      loadDbPackages();
    } catch (err) {
      console.error("Failed to create package:", err);
    } finally {
      setIsAddingPkg(false);
    }
  };

  const confirmDeletePackage = async () => {
    if (!deleteTargetId) return;
    const id = deleteTargetId;
    setDeleteTargetId(null);
    setDbPackages((prev) => prev.filter((p) => p.id !== id));

    try {
      await fetch(`/api/admin/cms/packages?id=${id}`, { method: "DELETE" });
    } catch (err) {
      console.error("Failed to delete package:", err);
      loadDbPackages();
    }
  };

  const getInitials = (title: string) => {
    const words = title.trim().split(" ");
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return title.substring(0, 2).toUpperCase() || "UP";
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-amber-500",
      "bg-emerald-500",
      "bg-brand-500",
      "bg-purple-500",
      "bg-indigo-500",
      "bg-rose-500",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
    return colors[Math.abs(hash) % colors.length];
  };

  const filtered = dbPackages.filter((pkg) => {
    const matchesCategory = filterCategory === "ALL" || pkg.category === filterCategory;
    const matchesSearch =
      pkg.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.destination?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.makkahHotel?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.madinahHotel?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6">
      
      {/* Top Header & Search / Filter Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search Umrah packages by title, hotel, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-xl border border-gray-200 bg-white py-2 pl-10 pr-4 text-xs font-normal text-gray-800 shadow-xs outline-none focus:border-brand-300 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
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

        {/* Filter Dropdown, Refresh & Add Package Buttons */}
        <div className="flex items-center gap-3">
          
          {/* Custom Theme Category Dropdown */}
          <div className="relative sm:w-56">
            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="dropdown-toggle h-10 w-full inline-flex items-center justify-between gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-normal text-gray-700 shadow-xs focus:border-brand-300 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 cursor-pointer"
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
              {categoryFilters.map((filter) => (
                <DropdownItem
                  key={filter.value}
                  onItemClick={() => handleSelectFilterOption(filter)}
                  className={`flex w-full items-center rounded-lg px-3 py-2 text-xs font-normal text-left transition-colors duration-150 cursor-pointer ${
                    selectedFilter.value === filter.value
                      ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 font-medium"
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
            onClick={() => loadDbPackages()}
            disabled={isRefreshing}
            className="h-10 inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-xs font-normal text-gray-700 shadow-xs hover:bg-gray-50 hover:text-gray-900 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <svg className={`w-3.5 h-3.5 text-gray-400 dark:text-gray-500 ${isRefreshing ? "animate-spin text-brand-500" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="h-10 inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 text-xs font-medium text-white shadow-theme-xs hover:bg-brand-600 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span>+ Add Package</span>
          </button>
        </div>
      </div>

      {/* Main Theme Table Container */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] shadow-xs">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                <th className="px-5 py-4 font-medium text-gray-500 text-xs dark:text-gray-400 whitespace-nowrap">Package Details</th>
                <th className="px-5 py-4 font-medium text-gray-500 text-xs dark:text-gray-400 whitespace-nowrap">Nights &amp; Hotels</th>
                <th className="px-5 py-4 font-medium text-gray-500 text-xs dark:text-gray-400 whitespace-nowrap">Departure &amp; Group</th>
                <th className="px-5 py-4 font-medium text-gray-500 text-xs dark:text-gray-400 whitespace-nowrap">Price</th>
                <th className="px-5 py-4 font-medium text-gray-500 text-xs dark:text-gray-400 whitespace-nowrap">Status Tag</th>
                <th className="px-5 py-4 font-medium text-gray-500 text-xs dark:text-gray-400 whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {paginated.length > 0 ? (
                paginated.map((pkg) => (
                  <tr key={pkg.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors duration-150">
                    
                    {/* Package Title & Category */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${getAvatarColor(pkg.title)} shrink-0`}>
                          <span className="text-xs font-semibold text-white">
                            {getInitials(pkg.title)}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-sm dark:text-white/90 max-w-xs truncate">
                            {pkg.title}
                          </p>
                          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 mt-0.5">
                            🕌 {pkg.category || "Economy"}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Nights & Hotels */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <p className="font-medium text-gray-800 text-xs dark:text-gray-200">
                        {pkg.makkahNights || 5}N Makkah / {pkg.madinahNights || 4}N Madinah
                      </p>
                      <span className="text-gray-500 text-xs dark:text-gray-400 block max-w-xs truncate font-normal">
                        🏢 {pkg.makkahHotel || pkg.destination}
                      </span>
                    </td>

                    {/* Departure & Group */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <p className="font-medium text-gray-800 text-xs dark:text-gray-200">
                        ✈️ {pkg.departureCity || "Frankfurt, Germany"}
                      </p>
                      <span className="text-gray-500 text-xs dark:text-gray-400 font-normal">
                        👥 {pkg.groupSize || "Up to 25 People"}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                        ${pkg.price}
                      </span>
                      {pkg.originalPrice && (
                        <span className="text-gray-400 line-through text-xs ml-1.5 font-mono">
                          ${pkg.originalPrice}
                        </span>
                      )}
                    </td>

                    {/* Status Tag */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300">
                        {pkg.badge || "Live Package"}
                      </span>
                    </td>

                    {/* Action Icon Buttons */}
                    <td className="px-5 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          title="View Details"
                          onClick={() => setSelectedPkgDetails(pkg)}
                          className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-brand-50 hover:border-brand-200 hover:text-brand-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-brand-500/10 dark:hover:text-brand-400 transition-colors duration-150 cursor-pointer"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12s3.375-6.75 9.75-6.75S21.75 12 21.75 12s-3.375 6.75-9.75 6.75S2.25 12 2.25 12Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          </svg>
                        </button>

                        <button
                          title="Delete Package"
                          onClick={() => setDeleteTargetId(pkg.id)}
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
                    No Umrah packages found matching your criteria.
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
            packages
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

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={confirmDeletePackage}
        title="Delete Umrah Package"
        description="Are you sure you want to delete this Umrah package? This action cannot be undone."
      />

      {/* View Package Details Modal */}
      {selectedPkgDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900 border border-gray-200 dark:border-gray-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
              <div>
                <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider font-mono">
                  UMRAH PACKAGE DETAILS
                </span>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white font-outfit">
                  {selectedPkgDetails.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPkgDetails(null)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mt-5 space-y-4 text-xs">
              <div className="rounded-xl overflow-hidden h-48 border border-gray-200 dark:border-gray-800">
                <img
                  src={selectedPkgDetails.image || "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800&q=80"}
                  alt={selectedPkgDetails.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800/40 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                <div>
                  <span className="text-gray-400 block font-medium">Category &amp; Badge</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{selectedPkgDetails.category} ({selectedPkgDetails.badge})</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Offer Price</span>
                  <span className="font-bold text-emerald-600 font-mono text-sm">${selectedPkgDetails.price}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Makkah Hotel</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">{selectedPkgDetails.makkahHotel} ({selectedPkgDetails.makkahNights} Nights)</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Madinah Hotel</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">{selectedPkgDetails.madinahHotel} ({selectedPkgDetails.madinahNights} Nights)</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Departure &amp; Group Size</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">{selectedPkgDetails.departureCity} • {selectedPkgDetails.groupSize}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Includes Services</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">{selectedPkgDetails.includes}</span>
                </div>
              </div>

              {selectedPkgDetails.description && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-800">
                  <span className="text-gray-400 block font-medium mb-1">Package Description</span>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{selectedPkgDetails.description}</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedPkgDetails(null)}
                className="rounded-xl bg-brand-500 px-6 py-2.5 text-xs font-bold text-white shadow-theme-xs hover:bg-brand-600 transition-colors cursor-pointer font-outfit"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Package Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900 border border-gray-200 dark:border-gray-800 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white font-outfit">
                + Configure &amp; Add New Umrah Package
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreatePackage} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                
                {/* Title */}
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">Package Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. 14 Days Executive 5-Star Umrah Special 2026"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-normal text-gray-800 shadow-theme-xs outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 transition-colors"
                  />
                </div>

                {/* Theme Custom Category Dropdown */}
                <div className="relative">
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">Category Filter</label>
                  <button
                    type="button"
                    onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                    className="dropdown-toggle h-10 w-full inline-flex items-center justify-between gap-2 rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-normal text-gray-800 shadow-theme-xs outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 cursor-pointer transition-colors"
                  >
                    <span>{newCategory}</span>
                    <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isCategoryDropdownOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
                    </svg>
                  </button>

                  <Dropdown
                    isOpen={isCategoryDropdownOpen}
                    onClose={() => setIsCategoryDropdownOpen(false)}
                    className="w-full p-1 z-50"
                  >
                    {categoryFormOptions.map((opt) => (
                      <DropdownItem
                        key={opt.value}
                        onItemClick={() => {
                          setNewCategory(opt.value as any);
                          setIsCategoryDropdownOpen(false);
                        }}
                        className={`flex w-full items-center rounded-lg px-3 py-2 text-xs font-normal transition-colors cursor-pointer ${
                          newCategory === opt.value
                            ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 font-medium"
                            : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
                        }`}
                      >
                        <span className="mr-2 w-4 shrink-0">
                          {newCategory === opt.value && (
                            <svg className="w-4 h-4 text-brand-500" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                            </svg>
                          )}
                        </span>
                        {opt.label}
                      </DropdownItem>
                    ))}
                  </Dropdown>
                </div>

                {/* Badge Tag */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">Badge Tag</label>
                  <input
                    type="text"
                    placeholder="e.g. Live Package / Top Rated"
                    value={newBadge}
                    onChange={(e) => setNewBadge(e.target.value)}
                    className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-normal text-gray-800 shadow-theme-xs outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 transition-colors"
                  />
                </div>

                {/* Offer Price */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">Offer Price ($ / €) *</label>
                  <input
                    type="number"
                    placeholder="e.g. 1850"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-normal text-gray-800 shadow-theme-xs outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 transition-colors"
                  />
                </div>

                {/* Original Price */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">Original Price ($ / €)</label>
                  <input
                    type="number"
                    placeholder="e.g. 2450"
                    value={newOriginalPrice}
                    onChange={(e) => setNewOriginalPrice(e.target.value)}
                    className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-normal text-gray-800 shadow-theme-xs outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 transition-colors"
                  />
                </div>

                {/* Makkah Nights */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">Makkah Nights</label>
                  <input
                    type="number"
                    value={newMakkahNights}
                    onChange={(e) => setNewMakkahNights(e.target.value)}
                    className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-normal text-gray-800 shadow-theme-xs outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 transition-colors"
                  />
                </div>

                {/* Madinah Nights */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">Madinah Nights</label>
                  <input
                    type="number"
                    value={newMadinahNights}
                    onChange={(e) => setNewMadinahNights(e.target.value)}
                    className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-normal text-gray-800 shadow-theme-xs outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 transition-colors"
                  />
                </div>

                {/* Makkah Hotel */}
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">Makkah Hotel &amp; Stars</label>
                  <input
                    type="text"
                    value={newMakkahHotel}
                    onChange={(e) => setNewMakkahHotel(e.target.value)}
                    className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-normal text-gray-800 shadow-theme-xs outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 transition-colors"
                  />
                </div>

                {/* Madinah Hotel */}
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">Madinah Hotel &amp; Stars</label>
                  <input
                    type="text"
                    value={newMadinahHotel}
                    onChange={(e) => setNewMadinahHotel(e.target.value)}
                    className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-normal text-gray-800 shadow-theme-xs outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 transition-colors"
                  />
                </div>

                {/* Departure City */}
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">Departure City</label>
                  <input
                    type="text"
                    value={newDepartureCity}
                    onChange={(e) => setNewDepartureCity(e.target.value)}
                    className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-normal text-gray-800 shadow-theme-xs outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 transition-colors"
                  />
                </div>

                {/* Includes CSV */}
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">Includes Tags (CSV)</label>
                  <input
                    type="text"
                    value={newIncludes}
                    onChange={(e) => setNewIncludes(e.target.value)}
                    className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-normal text-gray-800 shadow-theme-xs outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 transition-colors"
                  />
                </div>

                {/* Cover Image URL */}
                <div className="sm:col-span-4">
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">Cover Image URL</label>
                  <input
                    type="text"
                    value={newImage}
                    onChange={(e) => setNewImage(e.target.value)}
                    className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-normal text-gray-800 shadow-theme-xs outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 font-mono transition-colors"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingPkg || !newTitle || !newPrice}
                  className="rounded-xl bg-brand-500 px-6 py-2.5 text-xs font-semibold text-white shadow-theme-xs hover:bg-brand-600 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {isAddingPkg ? "Saving..." : "Save Umrah Package"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
