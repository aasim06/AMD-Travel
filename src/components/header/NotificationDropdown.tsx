"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dropdown } from "../ui/dropdown/Dropdown";

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const router = useRouter();

  const loadNotifications = async () => {
    try {
      const res = await fetch("/api/admin/notifications", { cache: "no-store" });
      const json = await res.json();
      if (json?.data) {
        setNotifications(json.data);
      }
    } catch (err) {
      console.error("Failed to load notifications", err);
    }
  };

  useEffect(() => {
    loadNotifications();

    // Poll live notifications every 25 seconds
    const interval = setInterval(() => {
      loadNotifications();
    }, 25000);

    // Refresh when user returns to tab
    const handleFocus = () => loadNotifications();
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const unreadNotifications = notifications.filter((n) => !readIds.has(n.id));
  const unreadCount = unreadNotifications.length;

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  const handleNotificationClick = (n: any) => {
    setReadIds((prev) => new Set(prev).add(n.id));
    closeDropdown();
    if (n.link) {
      router.push(n.link);
    }
  };

  const handleMarkAllRead = () => {
    const allIds = new Set(notifications.map((n) => n.id));
    setReadIds(allIds);
  };

  return (
    <div className="relative">
      
      {/* Bell Button */}
      <button
        type="button"
        onClick={toggleDropdown}
        title="Admin Live Notifications"
        className="relative dropdown-toggle flex items-center justify-center text-gray-500 transition-all bg-white border border-gray-200 rounded-full hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white cursor-pointer shadow-xs"
      >
        {/* Bell SVG Icon Always Visible */}
        <svg
          className="w-5 h-5 fill-current text-gray-600 dark:text-gray-300"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
            fill="currentColor"
          />
        </svg>

        {/* Glowing Red Unread Count Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs border-2 border-white dark:border-gray-900">
            <span className="absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75 animate-ping" />
            <span className="relative z-10">{unreadCount > 9 ? "9+" : unreadCount}</span>
          </span>
        )}
      </button>

      {/* Notifications Popover Dropdown */}
      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute -right-[240px] mt-3 flex h-[480px] w-[350px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-2xl dark:border-gray-800 dark:bg-gray-900 sm:w-[380px] lg:right-0 z-50"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <h5 className="text-base font-bold text-gray-900 dark:text-white font-outfit">
              Live Inbox Notifications
            </h5>
            {unreadCount > 0 && (
              <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-600 dark:bg-rose-500/20 dark:text-rose-400">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 cursor-pointer"
              >
                Mark Read
              </button>
            )}
            <button
              type="button"
              onClick={closeDropdown}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Notifications Scrollable List */}
        <ul className="flex flex-col flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800/60 custom-scrollbar">
          {notifications.length > 0 ? (
            notifications.map((n) => {
              const isUnread = !readIds.has(n.id);
              return (
                <li key={n.id}>
                  <div
                    onClick={() => handleNotificationClick(n)}
                    className={`flex items-start gap-3 p-3 rounded-xl transition-all cursor-pointer ${
                      isUnread
                        ? "bg-brand-50/60 dark:bg-brand-500/10 hover:bg-brand-100/60 dark:hover:bg-brand-500/20"
                        : "hover:bg-gray-50 dark:hover:bg-white/5 opacity-85"
                    }`}
                  >
                    {/* Avatar Circle Badge */}
                    <div className={`relative flex items-center justify-center w-10 h-10 rounded-full ${n.avatarBg} text-white font-bold text-xs shrink-0 shadow-xs`}>
                      {n.initials}
                      {isUnread && (
                        <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-rose-500 dark:border-gray-900" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className={`text-xs font-bold truncate ${isUnread ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"}`}>
                          {n.title}
                        </span>
                        <span className="text-[10px] text-gray-400 whitespace-nowrap">
                          {n.timeAgo}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${n.badgeBg}`}>
                          {n.category}
                        </span>
                        <span className="text-[10px] font-semibold text-brand-600 dark:text-brand-400 hover:underline">
                          View details →
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })
          ) : (
            <li className="py-10 text-center text-xs text-gray-400">
              No recent notifications found.
            </li>
          )}
        </ul>

        {/* Footer */}
        <div className="pt-2 mt-2 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-xs">
          <button
            type="button"
            onClick={loadNotifications}
            className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white text-[11px] font-medium flex items-center gap-1 cursor-pointer"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            Sync Live DB
          </button>
          <span className="text-[10px] text-gray-400">
            Realtime DB Connected 🟢
          </span>
        </div>
      </Dropdown>
    </div>
  );
}
