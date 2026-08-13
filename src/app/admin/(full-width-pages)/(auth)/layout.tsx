"use client";

import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import { StarsBackground } from "@/components/ui/stars-background";
import React, { useEffect, useState } from "react";

function AuthLayoutContent({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && theme === "dark";
  const starColor = isDark ? "#ffffff" : "#000000";

  return (
    <div className="relative min-h-screen w-full bg-white dark:bg-gray-950 text-slate-900 dark:text-white flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Animated Stars Background */}
      <StarsBackground
        key={isDark ? "dark-stars" : "light-stars"}
        starColor={starColor}
        speed={50}
        className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_bottom,_#f5f5f5_0%,_#ffffff_100%)] dark:bg-[radial-gradient(ellipse_at_bottom,_#1e293b_0%,_#020617_100%)]"
      />

      {/* Content Box */}
      <div className="relative z-10 flex flex-col w-full max-w-md items-center justify-center p-4 sm:p-6 bg-transparent">
        {children}
      </div>

      <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
        <ThemeTogglerTwo />
      </div>
    </div>
  );
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <AuthLayoutContent>{children}</AuthLayoutContent>
    </ThemeProvider>
  );
}
