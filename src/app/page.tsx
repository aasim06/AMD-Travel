export const dynamic = "force-dynamic";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/home/hero";
import { RecentSearches } from "@/components/home/recent-searches";
import { PopularFlights } from "@/components/home/popular-flights";


export default function Home() {
  return (
    <>
      <Header />
      <div className="min-h-[calc(100vh-4rem)]">
        <main>
          <Hero />
          <RecentSearches />
          <PopularFlights />
        </main>
      </div>
      <Footer />
    </>
  );
}
