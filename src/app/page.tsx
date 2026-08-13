import { Hero } from "@/components/home/hero";
import { RecentSearches } from "@/components/home/recent-searches";
import { PopularFlights } from "@/components/home/popular-flights";
import { WhyChooseUsSection } from "@/components/home/why-choose-us-section";
import { SpecialServicesSection } from "@/components/home/special-services-section";

export default function Home() {
  return (
    <main>
      <Hero />
      <RecentSearches />
      <PopularFlights />
      <WhyChooseUsSection />
      <SpecialServicesSection />
    </main>
  );
}
