"use client";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import RoutesTable, { Route, initialRoutes } from "@/components/routes/RoutesTable";
import RouteModal, { airportOptions } from "@/components/routes/RouteModal";
import DeleteConfirmModal from "@/components/routes/DeleteConfirmModal";
import { useState } from "react";

export default function RoutesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [routes, setRoutes] = useState<Route[]>(initialRoutes);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
  const [routeToDelete, setRouteToDelete] = useState<number | null>(null);

  const handleOpenNew = () => {
    setEditingRoute(null);
    setIsModalOpen(true);
  };

  const handleEdit = (route: Route) => {
    setEditingRoute(route);
    setIsModalOpen(true);
  };

  const handleSaveRoute = (routeData: any) => {
    const originLabel = airportOptions.find((a) => a.code === routeData.origin)?.label || "";
    const destLabel = airportOptions.find((a) => a.code === routeData.destination)?.label || "";

    const formatCity = (label: string) => label.split(" — ")[0] || "";
    const formatAirport = (label: string) => label.split(" — ")[1]?.replace(/\s\([A-Z]{3}\)$/, "") || "";

    if (editingRoute) {
      // Update existing route
      setRoutes(
        routes.map((r) =>
          r.id === editingRoute.id
            ? {
                ...r,
                originCode: routeData.origin,
                originCity: formatCity(originLabel),
                originAirport: formatAirport(originLabel),
                destCode: routeData.destination,
                destCity: formatCity(destLabel),
                destAirport: formatAirport(destLabel),
                code: `${routeData.origin}-${routeData.destination}`,
                baseFare: routeData.baseFare.includes("$") ? routeData.baseFare : `$${routeData.baseFare}`,
                airlines: routeData.airlines,
                status: routeData.status,
              }
            : r
        )
      );
    } else {
      // Add new route
      const newRoute: Route = {
        id: Math.max(0, ...routes.map((r) => r.id)) + 1,
        code: `${routeData.origin}-${routeData.destination}`,
        originCode: routeData.origin,
        originCity: formatCity(originLabel),
        originAirport: formatAirport(originLabel),
        destCode: routeData.destination,
        destCity: formatCity(destLabel),
        destAirport: formatAirport(destLabel),
        airlines: routeData.airlines,
        baseFare: routeData.baseFare.includes("$") ? routeData.baseFare : `$${routeData.baseFare}`,
        status: routeData.status,
      };
      setRoutes([newRoute, ...routes]);
    }
    
    setIsModalOpen(false);
    setEditingRoute(null);
  };

  const handleDeleteRoute = (id: number) => {
    setRouteToDelete(id);
  };

  const confirmDelete = () => {
    if (routeToDelete !== null) {
      setRoutes(routes.filter((route) => route.id !== routeToDelete));
      setRouteToDelete(null);
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Add / Edit Routes" />

      {/* Page Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
            Flight Routes Management
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage flight routes, origins, destinations, base fares, and active
            statuses.
          </p>
        </div>

        {/* Add New Route Button */}
        <button
          onClick={handleOpenNew}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 h-11 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 transition-colors duration-200 shrink-0"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          Add New Route
        </button>
      </div>

      {/* Routes Table */}
      <RoutesTable routes={routes} onEdit={handleEdit} onDelete={handleDeleteRoute} />

      {/* Add / Edit Route Modal */}
      <RouteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveRoute}
        editData={
          editingRoute
            ? {
                origin: editingRoute.originCode,
                destination: editingRoute.destCode,
                baseFare: editingRoute.baseFare.replace(/[^0-9.]/g, ""), // strip $ and commas for input
                airlines: editingRoute.airlines,
                status: editingRoute.status,
              }
            : null
        }
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={routeToDelete !== null}
        onClose={() => setRouteToDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
