"use client";

const topRoutes = [
  {
    id: 1,
    origin: "LHE",
    destination: "LHR",
    label: "Lahore ➔ London",
    bookings: 420,
    maxBookings: 420,
    revenue: "$46,200",
    airline: "Emirates",
    color: "bg-brand-500",
  },
  {
    id: 2,
    origin: "KHI",
    destination: "DXB",
    label: "Karachi ➔ Dubai",
    bookings: 310,
    maxBookings: 420,
    revenue: "$14,880",
    airline: "flydubai",
    color: "bg-purple-500",
  },
  {
    id: 3,
    origin: "ISB",
    destination: "IST",
    label: "Islamabad ➔ Istanbul",
    bookings: 255,
    maxBookings: 420,
    revenue: "$20,910",
    airline: "Turkish Airlines",
    color: "bg-indigo-500",
  },
  {
    id: 4,
    origin: "LHE",
    destination: "JED",
    label: "Lahore ➔ Jeddah",
    bookings: 198,
    maxBookings: 420,
    revenue: "$9,900",
    airline: "Saudi Airlines",
    color: "bg-success-500",
  },
  {
    id: 5,
    origin: "KHI",
    destination: "KUL",
    label: "Karachi ➔ Kuala Lumpur",
    bookings: 142,
    maxBookings: 420,
    revenue: "$8,520",
    airline: "Malaysia Airlines",
    color: "bg-warning-500",
  },
];

export default function TopRoutesWidget() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6 h-full">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Top Performing Routes
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Most booked flight routes this month
          </p>
        </div>
        <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
          This Month
        </span>
      </div>

      <div className="flex flex-col gap-4">
        {topRoutes.map((route, index) => {
          const percentage = Math.round((route.bookings / route.maxBookings) * 100);
          return (
            <div key={route.id} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                    {index + 1}
                  </span>
                  <div>
                    <span className="text-sm font-semibold text-gray-800 dark:text-white/90">
                      {route.label}
                    </span>
                    <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">
                      via {route.airline}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block text-sm font-semibold text-gray-800 dark:text-white/90">
                    {route.bookings.toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">{route.revenue}</span>
                </div>
              </div>
              {/* Progress Bar */}
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                <div
                  className={`h-full rounded-full ${route.color} transition-all duration-700`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
