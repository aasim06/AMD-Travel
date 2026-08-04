import { Hero } from "@/components/home/hero";
import { RecentSearches } from "@/components/home/recent-searches";
import { PopularFlights } from "@/components/home/popular-flights";

export default function Home() {
  return (
    <main>
      <Hero />
      <RecentSearches />
      <PopularFlights />
    </main>
  );
}
