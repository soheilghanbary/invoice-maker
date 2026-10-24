import { HeroSection } from "@/components/hero-section";
import { SiteHeader } from "@/components/site-header";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f8fbfd]">
      <SiteHeader />
      <HeroSection />
    </div>
  );
}
