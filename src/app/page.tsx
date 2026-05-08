import { NavBar } from "@/components/landing/NavBar";
import { Hero } from "@/components/landing/Hero";
import { Stats } from "@/components/landing/Stats";
import { Features } from "@/components/landing/Features";
import { Pricing } from "@/components/landing/Pricing";
import { CtaBand } from "@/components/landing/CtaBand";
import { Footer } from "@/components/landing/Footer";
import { CosmicBackdrop } from "@/components/landing/CosmicBackdrop";

export default function LandingPage() {
  return (
    <main className="bg-black text-white min-h-screen">
      <CosmicBackdrop />
      <div className="relative z-10">
        <NavBar />
        <Hero />
        <Stats />
        <Features />
        <Pricing />
        <CtaBand />
        <Footer />
      </div>
    </main>
  );
}
