import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import UmrahPackagesForm from "@/components/umrah/UmrahPackagesForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Umrah Packages | AMD Global Travel Admin",
  description: "Create and manage live Umrah Packages synced with main website.",
};

export default function AdminUmrahPackagesPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Umrah Packages" />

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
          Umrah Packages Control Panel
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Create, edit, and manage live Umrah Packages displayed on the public website.
        </p>
      </div>

      <div className="w-full">
        <UmrahPackagesForm />
      </div>
    </div>
  );
}
