"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import { TooltipProvider } from "@/components/ui/tooltip";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-muted/30">
        {/* Desktop sidebar */}
        <div className="hidden lg:block">
          <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
        </div>

        <div
          className={cn(
            "flex min-h-screen flex-col transition-all duration-300",
            collapsed ? "lg:pl-[68px]" : "lg:pl-[260px]"
          )}
        >
          <AdminHeader sidebarCollapsed={collapsed} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </TooltipProvider>
  );
}
