"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Search, LayoutGrid, Briefcase, UserRound } from "lucide-react";

export function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const handleOpenDrawer = () => {
    window.dispatchEvent(new CustomEvent("toggle-mobile-drawer"));
  };

  const handleOpenAuth = () => {
    window.dispatchEvent(new CustomEvent("open-auth-modal"));
  };

  const handleOpenSearch = () => {
    if (pathname === "/") {
      const searchHero = document.getElementById("search-hero") || document.querySelector("form");
      if (searchHero) {
        searchHero.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }
    window.dispatchEvent(new CustomEvent("open-mobile-search"));
    router.push("/flights");
  };

  const isHome = pathname === "/";
  const isBookings = pathname === "/bookings" || pathname.startsWith("/bookings/");

  return (
    <div className="md:hidden fixed bottom-3 left-3 right-3 z-50 pointer-events-none">
      <nav
        aria-label="Mobile bottom navigation"
        className="pointer-events-auto max-w-md mx-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-[0_10px_30px_rgba(0,0,0,0.12)] rounded-3xl px-3 py-2 flex items-center justify-around"
      >
        {/* Menu Drawer button */}
        <button
          type="button"
          onClick={handleOpenDrawer}
          className="flex flex-col items-center justify-center py-1 px-2.5 text-slate-600 dark:text-slate-300 hover:text-primary active:scale-95 transition-all group"
        >
          <div className="p-1.5 rounded-xl group-hover:bg-primary/10 transition-colors">
            <LayoutGrid className="h-5 w-5" />
          </div>
          <span className="text-[10px] font-medium tracking-tight mt-0.5">Menu</span>
        </button>

        {/* Search button */}
        <button
          type="button"
          onClick={handleOpenSearch}
          className="flex flex-col items-center justify-center py-1 px-2.5 text-slate-600 dark:text-slate-300 hover:text-primary active:scale-95 transition-all group"
        >
          <div className="p-1.5 rounded-xl group-hover:bg-primary/10 transition-colors">
            <Search className="h-5 w-5" />
          </div>
          <span className="text-[10px] font-medium tracking-tight mt-0.5">Search</span>
        </button>

        {/* Floating Center Home Button */}
        <Link
          href="/"
          className="relative flex flex-col items-center justify-center active:scale-95 transition-transform -translate-y-4 group"
        >
          <div
            className={`h-12 w-12 rounded-full p-0.5 bg-gradient-to-tr from-primary via-emerald-500 to-teal-400 shadow-lg shadow-primary/30 flex items-center justify-center ${
              isHome ? "ring-4 ring-primary/20 scale-105" : ""
            }`}
          >
            <div className="h-full w-full rounded-full bg-primary flex items-center justify-center text-white">
              <Home className="h-5 w-5" />
            </div>
          </div>
          <span
            className={`text-[10px] font-bold tracking-tight mt-0.5 ${
              isHome ? "text-primary" : "text-slate-600 dark:text-slate-300"
            }`}
          >
            Home
          </span>
        </Link>

        {/* Trips / Bookings */}
        <Link
          href="/bookings"
          className={`flex flex-col items-center justify-center py-1 px-2.5 active:scale-95 transition-all group ${
            isBookings ? "text-primary font-semibold" : "text-slate-600 dark:text-slate-300 hover:text-primary"
          }`}
        >
          <div className={`p-1.5 rounded-xl transition-colors relative ${isBookings ? "bg-primary/10" : "group-hover:bg-primary/10"}`}>
            <Briefcase className="h-5 w-5" />
            {isBookings && (
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
            )}
          </div>
          <span className="text-[10px] font-medium tracking-tight mt-0.5">Trips</span>
        </Link>

        {/* Profile / Account */}
        <button
          type="button"
          onClick={handleOpenAuth}
          className="flex flex-col items-center justify-center py-1 px-2.5 text-slate-600 dark:text-slate-300 hover:text-primary active:scale-95 transition-all group"
        >
          <div className="p-1.5 rounded-xl group-hover:bg-primary/10 transition-colors">
            <UserRound className="h-5 w-5" />
          </div>
          <span className="text-[10px] font-medium tracking-tight mt-0.5">Profile</span>
        </button>
      </nav>
    </div>
  );
}
