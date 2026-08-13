import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import SettingsForm from "@/components/settings/SettingsForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "System Settings | TailAdmin - Next.js Admin Template",
  description: "Manage your system settings and configurations",
};

export default function SettingsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="System Settings" />

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
          System Settings
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage your profile, platform preferences, currency, and API credentials.
        </p>
      </div>

      <div className="w-full">
        <SettingsForm />
      </div>
    </div>
  );
}
