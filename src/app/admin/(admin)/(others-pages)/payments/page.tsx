import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PaymentsManager from "@/components/payments/PaymentsManager";

export default function PaymentsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Payments & Transactions" />
      <PaymentsManager />
    </div>
  );
}

