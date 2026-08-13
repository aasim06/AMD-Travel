import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import TravelersManager from "@/components/travelers/TravelersManager";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Travelers | AMD Global Travel - Admin Panel",
  description:
    "Manage all registered travelers, view their contact info, edit details, and track their flight booking history.",
};

export default function TravelersPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Travelers" />
      <TravelersManager />
    </div>
  );
}

