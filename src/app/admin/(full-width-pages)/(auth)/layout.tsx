"use client";

import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";
import { ThemeProvider } from "@/context/ThemeContext";
import { StarsBackground } from "@/components/ui/stars-background";
import React, { useEffect } from "react";

function AuthLayoutContent({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    localStorage.setItem("admin_theme", "dark");
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-[#020617] text-white flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      
      {/* Animated Stars Background */}
      <StarsBackground
        starColor="#ffffff"
        speed={180}
        className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_#0f172a_0%,_#020617_100%)]"
      />

      {/* Atmospheric Glowing Light Orbs */}
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#FF5722]/20 blur-3xl pointer-events-none z-0 animate-pulse" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none z-0 animate-pulse" />

      {/* Content Box */}
      <div className="relative z-10 flex flex-col w-full max-w-lg items-center justify-center p-2 sm:p-4 bg-transparent">
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
