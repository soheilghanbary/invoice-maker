import { FeaturesSection } from "@/components/features-section";
import { HeroSection } from "@/components/hero-section";
import { HomeCtaSection } from "@/components/home-cta-section";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f8fbfd]">
      <SiteHeader />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HomeCtaSection />
      </main>
      <SiteFooter />
    </div>
  );
}
