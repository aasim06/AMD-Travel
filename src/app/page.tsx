import { PublicLayout } from "@/components/layout/public-layout";
import { Hero } from "@/components/home/hero";
import { RecentSearches } from "@/components/home/recent-searches";
import { PopularFlights } from "@/components/home/popular-flights";

export default function Home() {
  return (
    <PublicLayout>
      <main>
        <Hero />
        <RecentSearches />
        <PopularFlights />
      </main>
    </PublicLayout>
  );
}
