"use client";
import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { FloatingSupport } from "@/components/ui/floating-support";
import { FloatingAiTypewriterPill } from "@/components/ai/FloatingAiTypewriterPill";
import { CookieConsent } from "@/components/ui/cookie-consent";

export function MainLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  const isSearchPage = pathname?.startsWith("/search") || pathname?.startsWith("/checkout");

  return (
    <>
      <Header />
      <div className={`min-h-[calc(100vh-4rem)] ${isSearchPage ? "pb-6" : "pb-24 md:pb-0"}`}>{children}</div>
      <Footer />
      <MobileBottomNav />
      <FloatingSupport />
      <FloatingAiTypewriterPill />
      <CookieConsent />
    </>
  );
}
