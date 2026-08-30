import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import FlightsScheduleManager from "@/components/flights/FlightsScheduleManager";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Flights Schedule | AMD Global Travel - Admin Panel",
  description:
    "Monitor live flight schedules, operational statuses, and timings for all routes.",
};

export default function FlightsSchedulePage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Flights Schedule" />
      <FlightsScheduleManager />
    </div>
  );
}
