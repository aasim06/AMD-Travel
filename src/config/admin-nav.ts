import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  BookOpen,
  Package,
  Map,
  FileText,
  Car,
  Users,
  BarChart3,
  Settings,
  Bell,
  CreditCard,
} from "lucide-react";

export type AdminNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
};

export type AdminNavGroup = {
  title: string;
  items: AdminNavItem[];
};

export const adminNavGroups: AdminNavGroup[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    ],
  },
  {
    title: "Operations",
    items: [
      { label: "Bookings", href: "/admin/bookings", icon: BookOpen, badge: "24" },
      { label: "Payments", href: "/admin/payments", icon: CreditCard },
      { label: "Visa Applications", href: "/admin/visa", icon: FileText, badge: "8" },
    ],
  },
  {
    title: "Catalog",
    items: [
      { label: "Umrah Packages", href: "/admin/umrah-packages", icon: Package },
      { label: "Tour Deals", href: "/admin/tour-deals", icon: Map },
      { label: "Car Rentals", href: "/admin/cars", icon: Car },
    ],
  },
  {
    title: "Management",
    items: [
      { label: "Users", href: "/admin/users", icon: Users },
      { label: "Notifications", href: "/admin/notifications", icon: Bell },
      { label: "Site Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

export const adminUser = {
  name: "Admin User",
  email: "admin@amdglobaltravel.com",
  role: "Super Admin",
  avatar: "AU",
};
