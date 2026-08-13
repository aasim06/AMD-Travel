import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import CmsForm from "@/components/cms/CmsForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Website Content Management | TailAdmin - Next.js Admin Template",
  description: "Manage public website content, hero sections, and featured routes",
};

export default function CmsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Website CMS" />

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
          Website Content Management
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage public website assets, hero section background, featured/best routes, and contact details.
        </p>
      </div>

      <div className="w-full">
        <CmsForm />
      </div>
    </div>
  );
}
