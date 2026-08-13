import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import VisaApplicationsManager from "@/components/visa/VisaApplicationsManager";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Visa Applications | AMD Global Travel Admin",
  description: "Review and process submitted customer visa applications.",
};

export default function AdminVisaPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Visa Applications" />

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90 font-outfit">
          Visa Applications Inbox
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Review customer submitted visa applications, verify passport documents, and issue approval decisions.
        </p>
      </div>

      <div className="w-full">
        <VisaApplicationsManager />
      </div>
    </div>
  );
}
