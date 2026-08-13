"use client";
import Link from "next/link";

interface ActionItem {
  id: number;
  type: "refund" | "change" | "inquiry" | "cancellation";
  label: string;
  count: number;
  href: string;
  color: string;
  bgColor: string;
  darkColor: string;
  darkBgColor: string;
  icon: React.ReactNode;
}

const actionItems: ActionItem[] = [
  {
    id: 1,
    type: "refund",
    label: "Pending Refunds",
    count: 0,
    href: "/admin/payments",
    color: "text-error-600",
    bgColor: "bg-error-50",
    darkColor: "dark:text-error-400",
    darkBgColor: "dark:bg-error-500/10",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
      </svg>
    ),
  },
  {
    id: 2,
    type: "change",
    label: "Flight Change Requests",
    count: 0,
    href: "/admin/bookings",
    color: "text-warning-600",
    bgColor: "bg-warning-50",
    darkColor: "dark:text-warning-400",
    darkBgColor: "dark:bg-warning-500/10",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
      </svg>
    ),
  },
  {
    id: 3,
    type: "inquiry",
    label: "Open Inquiries",
    count: 0,
    href: "/admin/bookings",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    darkColor: "dark:text-blue-400",
    darkBgColor: "dark:bg-blue-500/10",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
      </svg>
    ),
  },
  {
    id: 4,
    type: "cancellation",
    label: "Pending Cancellations",
    count: 0,
    href: "/admin/bookings",
    color: "text-gray-600",
    bgColor: "bg-gray-100",
    darkColor: "dark:text-gray-400",
    darkBgColor: "dark:bg-gray-800",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
      </svg>
    ),
  },
];

export default function ActionItemsWidget() {
  const totalActions = actionItems.reduce((sum, a) => sum + a.count, 0);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Action Required
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Items awaiting your attention
          </p>
        </div>
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-error-50 text-sm font-bold text-error-600 dark:bg-error-500/10 dark:text-error-400">
          {totalActions}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {actionItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="flex flex-col items-center justify-center rounded-xl border border-gray-100 bg-gray-50/70 p-4 text-center hover:border-gray-200 hover:bg-gray-100/70 dark:border-gray-800 dark:bg-gray-900/50 dark:hover:bg-white/[0.03] transition-colors duration-150 group"
          >
            <span
              className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${item.bgColor} ${item.darkBgColor} ${item.color} ${item.darkColor} mb-3 group-hover:scale-110 transition-transform duration-200`}
            >
              {item.icon}
            </span>
            <span
              className={`text-2xl font-bold ${item.color} ${item.darkColor}`}
            >
              {item.count}
            </span>
            <span className="mt-1 text-xs font-medium text-gray-500 dark:text-gray-400 leading-tight">
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
