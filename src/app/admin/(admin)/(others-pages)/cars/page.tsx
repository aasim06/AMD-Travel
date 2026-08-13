import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import CarsManagerForm from "@/components/cars/CarsManagerForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rent a Car | AMD Global Travel Admin",
  description: "Create and manage live car rentals synced with main website.",
};

export default function AdminCarsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Rent a Car" />

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
          Rent a Car Control Panel
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Create, edit, and manage vehicle rental listings displayed on the public website.
        </p>
      </div>

      <div className="w-full">
        <CarsManagerForm />
      </div>
    </div>
  );
}
