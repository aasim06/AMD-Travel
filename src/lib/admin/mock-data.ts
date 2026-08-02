export type BookingStatus = "confirmed" | "pending" | "cancelled" | "completed";
export type BookingType = "flight" | "umrah" | "tour" | "visa" | "car";

export interface Booking {
  id: string;
  customer: string;
  email: string;
  type: BookingType;
  destination: string;
  amount: number;
  currency: string;
  status: BookingStatus;
  date: string;
}

export interface StatMetric {
  label: string;
  value: string;
  change: number;
  changeLabel: string;
}

export const dashboardStats: StatMetric[] = [
  { label: "Total Revenue", value: "€284,520", change: 12.5, changeLabel: "vs last month" },
  { label: "Total Bookings", value: "1,847", change: 8.2, changeLabel: "vs last month" },
  { label: "Active Users", value: "3,291", change: 5.1, changeLabel: "vs last month" },
  { label: "Conversion Rate", value: "4.8%", change: -0.3, changeLabel: "vs last month" },
];

export const revenueChartData = [
  { month: "Jan", revenue: 42000, bookings: 210 },
  { month: "Feb", revenue: 38000, bookings: 185 },
  { month: "Mar", revenue: 51000, bookings: 260 },
  { month: "Apr", revenue: 47000, bookings: 240 },
  { month: "May", revenue: 62000, bookings: 310 },
  { month: "Jun", revenue: 58000, bookings: 290 },
  { month: "Jul", revenue: 71000, bookings: 355 },
  { month: "Aug", revenue: 68000, bookings: 340 },
];

export const recentBookings: Booking[] = [
  {
    id: "BK-2024-1847",
    customer: "Ahmed Hassan",
    email: "ahmed.h@email.com",
    type: "umrah",
    destination: "Makkah & Madinah",
    amount: 2499,
    currency: "EUR",
    status: "confirmed",
    date: "2026-08-02",
  },
  {
    id: "BK-2024-1846",
    customer: "Sarah Johnson",
    email: "sarah.j@email.com",
    type: "flight",
    destination: "DXB → LHR",
    amount: 689,
    currency: "EUR",
    status: "pending",
    date: "2026-08-02",
  },
  {
    id: "BK-2024-1845",
    customer: "Mohammed Ali",
    email: "m.ali@email.com",
    type: "visa",
    destination: "Saudi Arabia",
    amount: 189,
    currency: "EUR",
    status: "confirmed",
    date: "2026-08-01",
  },
  {
    id: "BK-2024-1844",
    customer: "Fatima Khan",
    email: "fatima.k@email.com",
    type: "tour",
    destination: "Istanbul, Turkey",
    amount: 1299,
    currency: "EUR",
    status: "completed",
    date: "2026-08-01",
  },
  {
    id: "BK-2024-1843",
    customer: "James Wilson",
    email: "j.wilson@email.com",
    type: "car",
    destination: "Dubai Airport",
    amount: 245,
    currency: "EUR",
    status: "confirmed",
    date: "2026-07-31",
  },
  {
    id: "BK-2024-1842",
    customer: "Aisha Rahman",
    email: "aisha.r@email.com",
    type: "flight",
    destination: "JFK → DXB",
    amount: 1120,
    currency: "EUR",
    status: "cancelled",
    date: "2026-07-31",
  },
];

export const allBookings: Booking[] = [
  ...recentBookings,
  {
    id: "BK-2024-1841",
    customer: "Omar Farooq",
    email: "omar.f@email.com",
    type: "umrah",
    destination: "Makkah & Madinah",
    amount: 3199,
    currency: "EUR",
    status: "confirmed",
    date: "2026-07-30",
  },
  {
    id: "BK-2024-1840",
    customer: "Emily Chen",
    email: "emily.c@email.com",
    type: "tour",
    destination: "Maldives",
    amount: 4599,
    currency: "EUR",
    status: "pending",
    date: "2026-07-30",
  },
  {
    id: "BK-2024-1839",
    customer: "Yusuf Ibrahim",
    email: "yusuf.i@email.com",
    type: "visa",
    destination: "UAE",
    amount: 149,
    currency: "EUR",
    status: "completed",
    date: "2026-07-29",
  },
];

export const bookingTypeLabels: Record<BookingType, string> = {
  flight: "Flight",
  umrah: "Umrah",
  tour: "Tour Deal",
  visa: "Visa",
  car: "Car Rental",
};

export const bookingStatusColors: Record<BookingStatus, "success" | "warning" | "destructive" | "muted"> = {
  confirmed: "success",
  pending: "warning",
  cancelled: "destructive",
  completed: "muted",
};

export interface PackageItem {
  id: string;
  name: string;
  destination: string;
  price: number;
  duration: string;
  status: "active" | "draft" | "archived";
  bookings: number;
}

export const umrahPackages: PackageItem[] = [
  { id: "UM-001", name: "Economy Umrah", destination: "Makkah & Madinah", price: 1499, duration: "7 Days", status: "active", bookings: 142 },
  { id: "UM-002", name: "Premium Umrah", destination: "Makkah & Madinah", price: 2499, duration: "10 Days", status: "active", bookings: 89 },
  { id: "UM-003", name: "Luxury Umrah", destination: "Makkah & Madinah", price: 4999, duration: "14 Days", status: "active", bookings: 34 },
  { id: "UM-004", name: "Ramadan Special", destination: "Makkah & Madinah", price: 3299, duration: "12 Days", status: "draft", bookings: 0 },
];

export const tourDeals: PackageItem[] = [
  { id: "TD-001", name: "Istanbul Explorer", destination: "Turkey", price: 899, duration: "5 Days", status: "active", bookings: 67 },
  { id: "TD-002", name: "Maldives Paradise", destination: "Maldives", price: 4599, duration: "7 Days", status: "active", bookings: 23 },
  { id: "TD-003", name: "Dubai City Break", destination: "UAE", price: 699, duration: "4 Days", status: "active", bookings: 112 },
  { id: "TD-004", name: "Swiss Alps Adventure", destination: "Switzerland", price: 2199, duration: "6 Days", status: "draft", bookings: 0 },
];

export interface VisaApplication {
  id: string;
  applicant: string;
  country: string;
  visaType: string;
  status: "processing" | "approved" | "rejected" | "pending";
  submittedAt: string;
}

export const visaApplications: VisaApplication[] = [
  { id: "VS-001", applicant: "Ahmed Hassan", country: "Saudi Arabia", visaType: "Umrah Visa", status: "processing", submittedAt: "2026-08-02" },
  { id: "VS-002", applicant: "Sarah Johnson", country: "UAE", visaType: "Tourist Visa", status: "approved", submittedAt: "2026-08-01" },
  { id: "VS-003", applicant: "Mohammed Ali", country: "Turkey", visaType: "Tourist Visa", status: "pending", submittedAt: "2026-08-01" },
  { id: "VS-004", applicant: "Fatima Khan", country: "Egypt", visaType: "Tourist Visa", status: "approved", submittedAt: "2026-07-30" },
  { id: "VS-005", applicant: "James Wilson", country: "Saudi Arabia", visaType: "Business Visa", status: "rejected", submittedAt: "2026-07-29" },
];

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: "admin" | "agent" | "customer";
  status: "active" | "inactive";
  joinedAt: string;
  bookings: number;
}

export const users: UserRecord[] = [
  { id: "U-001", name: "Admin User", email: "admin@amdglobaltravel.com", role: "admin", status: "active", joinedAt: "2024-01-15", bookings: 0 },
  { id: "U-002", name: "Agent Sarah", email: "sarah@amdglobaltravel.com", role: "agent", status: "active", joinedAt: "2024-03-20", bookings: 156 },
  { id: "U-003", name: "Agent Omar", email: "omar@amdglobaltravel.com", role: "agent", status: "active", joinedAt: "2024-06-10", bookings: 98 },
  { id: "U-004", name: "Ahmed Hassan", email: "ahmed.h@email.com", role: "customer", status: "active", joinedAt: "2025-11-05", bookings: 3 },
  { id: "U-005", name: "Sarah Johnson", email: "sarah.j@email.com", role: "customer", status: "active", joinedAt: "2026-01-12", bookings: 1 },
  { id: "U-006", name: "Mohammed Ali", email: "m.ali@email.com", role: "customer", status: "inactive", joinedAt: "2025-08-22", bookings: 2 },
];

export const topDestinations = [
  { name: "Dubai, UAE", bookings: 342, percentage: 28 },
  { name: "Makkah, KSA", bookings: 289, percentage: 24 },
  { name: "Istanbul, Turkey", bookings: 198, percentage: 16 },
  { name: "London, UK", bookings: 156, percentage: 13 },
  { name: "Maldives", bookings: 112, percentage: 9 },
];

// ─── Analytics Data ───────────────────────────────────────────────────────────

export const monthlyRevenueData = [
  { month: "Jan", revenue: 42000, bookings: 210, target: 40000 },
  { month: "Feb", revenue: 38000, bookings: 185, target: 42000 },
  { month: "Mar", revenue: 51000, bookings: 260, target: 45000 },
  { month: "Apr", revenue: 47000, bookings: 240, target: 48000 },
  { month: "May", revenue: 62000, bookings: 310, target: 50000 },
  { month: "Jun", revenue: 58000, bookings: 290, target: 55000 },
  { month: "Jul", revenue: 71000, bookings: 355, target: 60000 },
  { month: "Aug", revenue: 68000, bookings: 340, target: 65000 },
];

export const weeklyRevenueData = [
  { day: "Mon", revenue: 8200, bookings: 41 },
  { day: "Tue", revenue: 9400, bookings: 47 },
  { day: "Wed", revenue: 7800, bookings: 39 },
  { day: "Thu", revenue: 11200, bookings: 56 },
  { day: "Fri", revenue: 13500, bookings: 67 },
  { day: "Sat", revenue: 15800, bookings: 79 },
  { day: "Sun", revenue: 12100, bookings: 60 },
];

export const bookingTypeBreakdown = [
  { type: "Flights", count: 842, revenue: 128400, percentage: 45.6, color: "hsl(24 100% 62%)" },
  { type: "Umrah Packages", count: 265, revenue: 89350, percentage: 14.3, color: "hsl(38 92% 50%)" },
  { type: "Tour Deals", count: 202, revenue: 62800, percentage: 10.9, color: "hsl(220 90% 56%)" },
  { type: "Visa Services", count: 381, revenue: 57400, percentage: 20.6, color: "hsl(280 65% 55%)" },
  { type: "Car Rentals", count: 157, revenue: 16570, percentage: 8.5, color: "hsl(0 72% 51%)" },
];

export const geographicData = [
  { country: "United Arab Emirates", flag: "🇦🇪", bookings: 512, revenue: 124800, growth: 18.4 },
  { country: "United Kingdom", flag: "🇬🇧", bookings: 387, revenue: 98200, growth: 12.1 },
  { country: "Saudi Arabia", flag: "🇸🇦", bookings: 298, revenue: 82400, growth: 24.7 },
  { country: "Pakistan", flag: "🇵🇰", bookings: 241, revenue: 54600, growth: 31.2 },
  { country: "Germany", flag: "🇩🇪", bookings: 178, revenue: 46300, growth: 8.9 },
  { country: "France", flag: "🇫🇷", bookings: 156, revenue: 41200, growth: 6.3 },
  { country: "United States", flag: "🇺🇸", bookings: 134, revenue: 38700, growth: 15.6 },
];

export const conversionFunnel = [
  { stage: "Website Visits", count: 48200, percentage: 100 },
  { stage: "Search Initiated", count: 22840, percentage: 47.4 },
  { stage: "Results Viewed", count: 14100, percentage: 29.3 },
  { stage: "Checkout Started", count: 3850, percentage: 7.99 },
  { stage: "Booking Completed", count: 1847, percentage: 3.83 },
];

export const topPerformingRoutes = [
  { route: "DXB → LHR", type: "flight" as BookingType, bookings: 187, revenue: 42340, avgPrice: 226 },
  { route: "LHR → DXB", type: "flight" as BookingType, bookings: 172, revenue: 39560, avgPrice: 230 },
  { route: "Makkah & Madinah", type: "umrah" as BookingType, bookings: 142, revenue: 71200, avgPrice: 501 },
  { route: "DXB → JFK", type: "flight" as BookingType, bookings: 124, revenue: 58280, avgPrice: 470 },
  { route: "Istanbul, Turkey", type: "tour" as BookingType, bookings: 112, revenue: 38640, avgPrice: 345 },
  { route: "Dubai City Break", type: "tour" as BookingType, bookings: 98, revenue: 24500, avgPrice: 250 },
];

export const analyticsKpis = [
  { label: "Total Revenue YTD", value: "€437,000", change: 14.2, changeLabel: "vs last year", prefix: "€" },
  { label: "Total Bookings", value: "1,847", change: 8.2, changeLabel: "vs last month" },
  { label: "Avg. Booking Value", value: "€236", change: 5.5, changeLabel: "vs last month", prefix: "€" },
  { label: "Conversion Rate", value: "3.83%", change: 0.4, changeLabel: "vs last month" },
  { label: "Customer Satisfaction", value: "4.8/5", change: 0.2, changeLabel: "vs last quarter" },
  { label: "Returning Customers", value: "38.4%", change: 3.1, changeLabel: "vs last month" },
];
